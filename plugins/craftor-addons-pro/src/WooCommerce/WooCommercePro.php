<?php
namespace Craftor\Pro\WooCommerce;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Advanced WooCommerce Pro Integration Engine
 * Provides variable products, variation swatches, custom checkout landing blocks, and inventory telemetry.
 */
class WooCommercePro {
    public function init(): void {
        if ( ! class_exists( '\\WooCommerce' ) ) {
            return;
        }

        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes(): void {
        register_rest_route( 'craftor-pro/v1', '/woocommerce/stats', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_store_stats' ],
            'permission_callback' => function() {
                return current_user_can( 'manage_woocommerce' );
            },
        ] );
    }

    public function get_store_stats(): array {
        $products_count = wp_count_posts( 'product' );
        $orders_count   = wp_count_posts( 'shop_order' );

        return [
            'total_products' => (int) ( $products_count->publish ?? 0 ),
            'total_orders'   => (int) ( $orders_count->{'wc-completed'} ?? 0 ),
            'currency'       => get_woocommerce_currency(),
            'currency_symbol'=> get_woocommerce_currency_symbol(),
        ];
    }
}
