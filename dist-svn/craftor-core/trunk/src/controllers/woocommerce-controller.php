<?php
namespace Craftor\Core\Controllers;

use Craftor\Core\Snapshots\SnapshotManager;
use Craftor\Core\Snapshots\RollbackManager;
use Craftor\Core\Auth\CraftorAuth;
use Craftor\Core\Auth\CraftorApproval;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor WooCommerce & Snapshot REST API Controller
 * Provides guarded REST endpoints for WooCommerce products, orders, snapshots, and rollback execution.
 */
class WooCommerceController {
    private SnapshotManager $snapshots;
    private RollbackManager $rollback;

    public function __construct() {
        $this->snapshots = new SnapshotManager();
        $this->rollback  = new RollbackManager( $this->snapshots );
    }

    public function register_routes(): void {
        $namespace = 'craftor/v1';

        // Products
        register_rest_route( $namespace, '/woocommerce/products', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_products' ],
                'permission_callback' => [ $this, 'check_read_permission' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'create_product' ],
                'permission_callback' => [ $this, 'check_write_permission' ],
            ],
        ] );

        register_rest_route( $namespace, '/woocommerce/products/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_product' ],
                'permission_callback' => [ $this, 'check_read_permission' ],
            ],
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'update_product' ],
                'permission_callback' => [ $this, 'check_write_permission' ],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'delete_product' ],
                'permission_callback' => [ $this, 'check_write_permission' ],
            ],
        ] );

        // Orders
        register_rest_route( $namespace, '/woocommerce/orders', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_orders' ],
            'permission_callback' => [ $this, 'check_read_permission' ],
        ] );

        // Customers
        register_rest_route( $namespace, '/woocommerce/customers', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_customers' ],
            'permission_callback' => [ $this, 'check_read_permission' ],
        ] );

        // Categories
        register_rest_route( $namespace, '/woocommerce/categories', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_categories' ],
            'permission_callback' => [ $this, 'check_read_permission' ],
        ] );

        // Inventory
        register_rest_route( $namespace, '/woocommerce/inventory/(?P<id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_inventory' ],
            'permission_callback' => [ $this, 'check_read_permission' ],
        ] );

        // Snapshots
        register_rest_route( $namespace, '/snapshots', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'list_snapshots' ],
                'permission_callback' => [ $this, 'check_read_permission' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'create_snapshot' ],
                'permission_callback' => [ $this, 'check_write_permission' ],
            ],
        ] );

        register_rest_route( $namespace, '/snapshots/(?P<id>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_snapshot' ],
                'permission_callback' => [ $this, 'check_read_permission' ],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'delete_snapshot' ],
                'permission_callback' => [ $this, 'check_write_permission' ],
            ],
        ] );

        // Rollback
        register_rest_route( $namespace, '/rollback/(?P<id>[a-zA-Z0-9_\-]+)', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'restore_snapshot' ],
            'permission_callback' => [ $this, 'check_write_permission' ],
        ] );
    }

    public function check_read_permission( \WP_REST_Request $request ): bool {
        $path = $request->get_route();
        if ( strpos( $path, '/snapshots' ) !== false ) {
            return CraftorAuth::verify_request( $request, 'manage_options' );
        }
        if ( strpos( $path, '/orders' ) !== false || strpos( $path, '/customers' ) !== false ) {
            return CraftorAuth::verify_request( $request, 'manage_woocommerce' );
        }
        return CraftorAuth::verify_request( $request, 'read' );
    }

    public function check_write_permission( \WP_REST_Request $request ): bool {
        $path = $request->get_route();
        $id = (int) $request->get_param( 'id' );

        if ( strpos( $path, '/rollback' ) !== false || strpos( $path, '/snapshots' ) !== false ) {
            return CraftorAuth::verify_request( $request, 'manage_options' );
        }

        $required_cap = $request->get_method() === 'DELETE' ? 'delete_posts' : 'edit_posts';
        $object_cap = $request->get_method() === 'DELETE' ? 'delete_post' : 'edit_post';
        return CraftorAuth::verify_request( $request, $required_cap, $id > 0 ? $id : null, $object_cap );
    }

    public function get_products( \WP_REST_Request $request ): \WP_REST_Response {
        $posts = get_posts( [
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => (int) ( $request->get_param( 'per_page' ) ?? 10 ),
        ] );

        $products = array_map( function( $post ) {
            return [
                'id'            => $post->ID,
                'name'          => $post->post_title,
                'slug'          => $post->post_name,
                'description'   => $post->post_content,
                'regular_price' => get_post_meta( $post->ID, '_regular_price', true ) ?: '0.00',
                'sku'           => get_post_meta( $post->ID, '_sku', true ) ?: '',
            ];
        }, $posts );

        return new \WP_REST_Response( $products, 200 );
    }

    public function get_product( \WP_REST_Request $request ): \WP_REST_Response {
        $id = (int) $request->get_param( 'id' );
        $post = get_post( $id );
        if ( ! $post ) {
            return new \WP_REST_Response( [ 'code' => 'not_found', 'message' => 'Product not found' ], 404 );
        }

        return new \WP_REST_Response( [
            'id'            => $post->ID,
            'name'          => $post->post_title,
            'slug'          => $post->post_name,
            'description'   => $post->post_content,
            'regular_price' => get_post_meta( $post->ID, '_regular_price', true ) ?: '0.00',
            'sku'           => get_post_meta( $post->ID, '_sku', true ) ?: '',
        ], 200 );
    }

    public function create_product( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        $title = $params['name'] ?? 'New Product';

        $post_id = wp_insert_post( [
            'post_title'   => $title,
            'post_type'    => 'product',
            'post_status'  => $params['status'] ?? 'publish',
            'post_content' => $params['description'] ?? '',
        ] );

        if ( is_wp_error( $post_id ) ) {
            return new \WP_REST_Response( [ 'error' => $post_id->get_error_message() ], 500 );
        }

        if ( isset( $params['regular_price'] ) ) {
            update_post_meta( $post_id, '_regular_price', $params['regular_price'] );
            update_post_meta( $post_id, '_price', $params['regular_price'] );
        }
        if ( isset( $params['sku'] ) ) {
            update_post_meta( $post_id, '_sku', $params['sku'] );
        }

        $created = [
            'id'            => $post_id,
            'name'          => $title,
            'status'        => $params['status'] ?? 'publish',
            'regular_price' => $params['regular_price'] ?? '0.00',
            'sku'           => $params['sku'] ?? '',
        ];

        // Capture snapshot
        $this->snapshots->capture_snapshot( $post_id, 'woocommerce_product', $created, '', 'create_product' );

        return new \WP_REST_Response( $created, 201 );
    }

    public function update_product( \WP_REST_Request $request ): \WP_REST_Response {
        $id = (int) $request->get_param( 'id' );
        $params = $request->get_json_params() ?? [];

        // Snapshot current state
        $existing = get_post( $id );
        if ( $existing ) {
            $this->snapshots->capture_snapshot( $id, 'woocommerce_product', (array) $existing, '', 'update_product' );
        }

        $update_data = [ 'ID' => $id ];
        if ( isset( $params['name'] ) ) {
            $update_data['post_title'] = $params['name'];
        }
        if ( isset( $params['description'] ) ) {
            $update_data['post_content'] = $params['description'];
        }

        wp_update_post( $update_data );

        if ( isset( $params['regular_price'] ) ) {
            update_post_meta( $id, '_regular_price', $params['regular_price'] );
        }

        return new \WP_REST_Response( [ 'id' => $id, 'updated' => true ], 200 );
    }

    public function delete_product( \WP_REST_Request $request ): \WP_REST_Response {
        $id = (int) $request->get_param( 'id' );

        // Machine token callers must supply an approved human authorization
        if ( ! is_user_logged_in() ) {
            $approval_id = $request->get_header( 'X-Craftor-Approval-Id' ) ?: $request->get_param( 'approvalId' );
            $verification = CraftorApproval::verify_and_consume( (string) $approval_id, 'delete_product', $id, $request->get_json_params() ?? [] );
            if ( ! $verification['authorized'] ) {
                if ( empty( $approval_id ) || ! CraftorApproval::get_approval( $approval_id ) ) {
                    $req = CraftorApproval::create_approval( 'delete_product', $id, $request->get_json_params() ?? [] );
                    return new \WP_REST_Response( $req, 403 );
                }
                return new \WP_REST_Response( [ 'error' => $verification['error'], 'requiresHumanApproval' => true ], 403 );
            }
        }

        $existing = get_post( $id );
        if ( $existing ) {
            $this->snapshots->capture_snapshot( $id, 'woocommerce_product', (array) $existing, '', 'delete_product' );
        }

        wp_delete_post( $id, true );
        return new \WP_REST_Response( [ 'id' => $id, 'deleted' => true ], 200 );
    }

    public function get_orders(): \WP_REST_Response {
        return new \WP_REST_Response( [], 200 );
    }

    public function get_customers(): \WP_REST_Response {
        return new \WP_REST_Response( [], 200 );
    }

    public function get_categories(): \WP_REST_Response {
        return new \WP_REST_Response( [], 200 );
    }

    public function get_inventory( \WP_REST_Request $request ): \WP_REST_Response {
        $id = (int) $request->get_param( 'id' );
        return new \WP_REST_Response( [
            'productId'     => $id,
            'sku'           => get_post_meta( $id, '_sku', true ) ?: '',
            'manageStock'   => false,
            'stockQuantity' => null,
            'stockStatus'   => 'instock',
        ], 200 );
    }

    public function create_snapshot( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        $snapshot = $this->snapshots->capture_snapshot(
            $params['target_id'] ?? 0,
            $params['target_type'] ?? 'post',
            $params['data_payload'] ?? '',
            $params['created_by_token'] ?? '',
            $params['action_context'] ?? ''
        );
        return new \WP_REST_Response( $snapshot, 201 );
    }

    public function get_snapshot( \WP_REST_Request $request ): \WP_REST_Response {
        $id = $request->get_param( 'id' );
        $snapshot = $this->snapshots->get_snapshot( $id );
        if ( ! $snapshot ) {
            return new \WP_REST_Response( [ 'error' => 'Snapshot not found' ], 404 );
        }
        return new \WP_REST_Response( $snapshot, 200 );
    }

    public function delete_snapshot( \WP_REST_Request $request ): \WP_REST_Response {
        $id = $request->get_param( 'id' );

        // Machine token callers must supply an approved human authorization
        if ( ! is_user_logged_in() ) {
            $approval_id = $request->get_header( 'X-Craftor-Approval-Id' ) ?: $request->get_param( 'approvalId' );
            $verification = CraftorApproval::verify_and_consume( (string) $approval_id, 'delete_snapshot', $id, $request->get_json_params() ?? [] );
            if ( ! $verification['authorized'] ) {
                if ( empty( $approval_id ) || ! CraftorApproval::get_approval( $approval_id ) ) {
                    $req = CraftorApproval::create_approval( 'delete_snapshot', $id, $request->get_json_params() ?? [] );
                    return new \WP_REST_Response( $req, 403 );
                }
                return new \WP_REST_Response( [ 'error' => $verification['error'], 'requiresHumanApproval' => true ], 403 );
            }
        }

        $deleted = $this->snapshots->delete_snapshot( $id );
        return new \WP_REST_Response( [ 'deleted' => $deleted ], 200 );
    }

    public function list_snapshots(): \WP_REST_Response {
        return new \WP_REST_Response( $this->snapshots->list_snapshots(), 200 );
    }

    public function restore_snapshot( \WP_REST_Request $request ): \WP_REST_Response {
        $id = $request->get_param( 'id' );

        // Machine token callers must supply an approved human authorization
        if ( ! is_user_logged_in() ) {
            $approval_id = $request->get_header( 'X-Craftor-Approval-Id' ) ?: $request->get_param( 'approvalId' );
            $verification = CraftorApproval::verify_and_consume( (string) $approval_id, 'restore_snapshot', $id, $request->get_json_params() ?? [] );
            if ( ! $verification['authorized'] ) {
                if ( empty( $approval_id ) || ! CraftorApproval::get_approval( $approval_id ) ) {
                    $req = CraftorApproval::create_approval( 'restore_snapshot', $id, $request->get_json_params() ?? [] );
                    return new \WP_REST_Response( $req, 403 );
                }
                return new \WP_REST_Response( [ 'error' => $verification['error'], 'requiresHumanApproval' => true ], 403 );
            }
        }

        $result = $this->rollback->restore_snapshot( $id );
        $status = $result['success'] ? 200 : 400;
        return new \WP_REST_Response( $result, $status );
    }
}
