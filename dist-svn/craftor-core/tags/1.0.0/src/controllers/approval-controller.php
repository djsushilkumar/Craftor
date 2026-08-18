<?php
namespace Craftor\Core\Controllers;

use Craftor\Core\Auth\CraftorAuth;
use Craftor\Core\Auth\CraftorApproval;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Approval REST API Controller
 * Provides endpoints for querying approval status and processing human approval/denial events.
 */
class ApprovalController {
    public function register_routes(): void {
        $namespace = 'craftor/v1';

        // 1. Query Approval Status (Read-Only)
        register_rest_route( $namespace, '/approvals/(?P<id>[a-zA-Z0-9_\-]+)', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_approval_status' ],
            'permission_callback' => [ $this, 'check_read_permission' ],
        ] );

        // 2. List Pending Approvals (Human Admin Review)
        register_rest_route( $namespace, '/approvals', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'list_pending_approvals' ],
            'permission_callback' => [ $this, 'check_human_admin_permission' ],
        ] );

        // 3. Human Approve Endpoint (STRICT HUMAN SESSION ONLY - MACHINE TOKEN BLOCKED)
        register_rest_route( $namespace, '/approvals/(?P<id>[a-zA-Z0-9_\-]+)/approve', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'approve_request' ],
            'permission_callback' => [ $this, 'check_human_admin_permission' ],
        ] );

        // 4. Human Deny Endpoint (STRICT HUMAN SESSION ONLY - MACHINE TOKEN BLOCKED)
        register_rest_route( $namespace, '/approvals/(?P<id>[a-zA-Z0-9_\-]+)/deny', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'deny_request' ],
            'permission_callback' => [ $this, 'check_human_admin_permission' ],
        ] );
    }

    public function check_read_permission( \WP_REST_Request $request ): bool {
        return CraftorAuth::verify_request( $request, 'read' );
    }

    /**
     * Strictly verifies that the request originates from an authentic logged-in human administrator.
     * Machine API tokens (X-Craftor-Token) are STRICTLY REJECTED for approving/denying actions.
     */
    public function check_human_admin_permission( \WP_REST_Request $request ): bool {
        // Machine tokens cannot approve destructive actions!
        if ( ! is_user_logged_in() ) {
            return false;
        }

        return current_user_can( 'manage_options' ) || current_user_can( 'delete_posts' ) || current_user_can( 'activate_plugins' );
    }

    public function get_approval_status( \WP_REST_Request $request ): \WP_REST_Response {
        $id = $request->get_param( 'id' );
        $record = CraftorApproval::get_approval( $id );

        if ( ! $record ) {
            return new \WP_REST_Response( [ 'error' => 'Approval record not found' ], 404 );
        }

        // Return public approval status (omit internal executionToken from read status)
        $clean = $record;
        unset( $clean['executionToken'] );

        return new \WP_REST_Response( $clean, 200 );
    }

    public function list_pending_approvals(): \WP_REST_Response {
        $all = get_option( CraftorApproval::OPTION_KEY, [] );
        $pending = [];
        $now = time();

        foreach ( $all as $rec ) {
            if ( $rec['status'] === 'PENDING' && $now <= $rec['expiresAt'] ) {
                $clean = $rec;
                unset( $clean['executionToken'] );
                $pending[] = $clean;
            }
        }

        return new \WP_REST_Response( $pending, 200 );
    }

    public function approve_request( \WP_REST_Request $request ): \WP_REST_Response {
        $id = $request->get_param( 'id' );
        $user_id = get_current_user_id();

        $res = CraftorApproval::approve_by_human( $id, $user_id, 'edit_posts' );
        if ( ! $res['success'] ) {
            return new \WP_REST_Response( [ 'success' => false, 'error' => $res['error'] ], 400 );
        }

        return new \WP_REST_Response( [
            'success'        => true,
            'message'        => 'Approval granted successfully by human administrator',
            'approvalId'     => $id,
            'status'         => 'APPROVED',
            'executionToken' => $res['record']['executionToken'] ?? null,
        ], 200 );
    }

    public function deny_request( \WP_REST_Request $request ): \WP_REST_Response {
        $id = $request->get_param( 'id' );
        $user_id = get_current_user_id();

        $res = CraftorApproval::deny_by_human( $id, $user_id );
        if ( ! $res['success'] ) {
            return new \WP_REST_Response( [ 'success' => false, 'error' => $res['error'] ], 400 );
        }

        return new \WP_REST_Response( [
            'success'    => true,
            'message'    => 'Approval request DENIED',
            'approvalId' => $id,
            'status'     => 'DENIED',
        ], 200 );
    }
}
