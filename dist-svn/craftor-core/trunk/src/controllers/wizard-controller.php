<?php
namespace Craftor\Core\Controllers;

use WP_REST_Request;
use WP_REST_Response;
use Craftor\Core\Auth\CraftorAuth;
use Craftor\Core\Archetypes\ArchetypeRegistry;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Dynamic AI Site Onboarding Wizard Controller
 * Generates 100% Native Elementor Websites and WooCommerce Products in Pure PHP.
 */
class WizardController {
    public function register_routes(): void {
        register_rest_route( 'craftor/v1', '/wizard/generate', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_generate_site' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ] );
    }

    public function check_permission( WP_REST_Request $request ): bool {
        return CraftorAuth::verify_request( $request, 'edit_pages' );
    }

    public function handle_generate_site( WP_REST_Request $request ): WP_REST_Response {
        $params = $request->get_json_params() ?: $request->get_params();

        $archetype_key = sanitize_key( $params['archetype'] ?? 'saas' );
        $theme         = sanitize_key( $params['theme'] ?? 'dark-gold' );
        $title         = sanitize_text_field( $params['title'] ?? 'NextGen Website' );
        $has_woo       = ! empty( $params['create_woo_products'] );
        $has_seo       = ! empty( $params['inject_seo'] );

        // 1. Create WordPress Page
        $slug = sanitize_title( $title );
        $page_id = wp_insert_post( [
            'post_title'   => $title,
            'post_name'    => $slug,
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_content' => '',
        ] );

        if ( is_wp_error( $page_id ) || ! $page_id ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Failed to create WordPress page.',
            ], 500 );
        }

        // Set Elementor Builder flag
        update_post_meta( $page_id, '_elementor_edit_mode', 'builder' );
        update_post_meta( $page_id, '_elementor_template_type', 'wp-page' );
        update_post_meta( $page_id, '_elementor_version', '3.20.0' );

        // 2. Delegate to Archetype Engine for 100% Native Elementor AST
        $archetype = ArchetypeRegistry::get( $archetype_key );
        $ast = $archetype->getAst( $theme, $title );
        update_post_meta( $page_id, '_elementor_data', wp_slash( wp_json_encode( $ast ) ) );

        // 3. Create WooCommerce Products if requested
        $product_ids = [];
        if ( $has_woo ) {
            $plans = $archetype->getWooCommercePlans();
            foreach ( $plans as $plan ) {
                $prod_id = wp_insert_post( [
                    'post_title'   => $plan['name'],
                    'post_content' => "Official {$plan['name']} for {$title}.",
                    'post_status'  => 'publish',
                    'post_type'    => 'product',
                ] );

                if ( $prod_id && ! is_wp_error( $prod_id ) ) {
                    update_post_meta( $prod_id, '_regular_price', $plan['price'] );
                    update_post_meta( $prod_id, '_price', $plan['price'] );
                    update_post_meta( $prod_id, '_sku', $plan['sku'] );
                    update_post_meta( $prod_id, '_visibility', 'visible' );
                    update_post_meta( $prod_id, '_stock_status', 'instock' );
                    $product_ids[] = $prod_id;
                }
            }
        }

        // 4. Configure SEO Metadata if requested
        if ( $has_seo ) {
            update_post_meta( $page_id, 'rank_math_title', $title );
            update_post_meta( $page_id, 'rank_math_description', "Welcome to {$title}. Designed and powered by Craftor Autonomous Agent Runtime." );
            update_post_meta( $page_id, '_yoast_wpseo_title', $title );
            update_post_meta( $page_id, '_yoast_wpseo_metadesc', "Welcome to {$title}. Designed and powered by Craftor Autonomous Agent Runtime." );
        }

        $page_url = get_permalink( $page_id );
        $editor_url = admin_url( "post.php?post={$page_id}&action=elementor" );

        return new WP_REST_Response( [
            'success'              => true,
            'page_id'              => $page_id,
            'page_url'             => $page_url,
            'editor_url'           => $editor_url,
            'archetype'            => $archetype->getKey(),
            'theme'                => $theme,
            'title'                => $title,
            'containers_count'     => count( $ast ),
            'woocommerce_products' => $product_ids,
        ], 200 );
    }
}
