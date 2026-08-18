<?php
namespace Craftor\Core;

use Craftor\Core\Controllers\WooCommerceController;
use Craftor\Core\Controllers\ElementorController;
use Craftor\Core\Admin\AdminSettings;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Plugin {
    private static $instance = null;
    private $admin_settings = null;

    public static function instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init(): void {
        if ( is_admin() && class_exists( 'Craftor\\Core\\Admin\\AdminSettings' ) ) {
            $this->admin_settings = new AdminSettings();
        }

        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
    }

    public function register_rest_routes(): void {
        register_rest_route( 'craftor/v1', '/auth/handshake', [
            'methods'  => 'GET',
            'callback' => [ $this, 'handle_handshake' ],
            'permission_callback' => '__return_true',
        ] );

        // 1. Elementor Controller
        if ( class_exists( 'Craftor\\Core\\Controllers\\ElementorController' ) ) {
            $elementor_ctrl = new ElementorController();
            $elementor_ctrl->register_routes();
        }

        // 2. WooCommerce Controller
        if ( class_exists( 'Craftor\\Core\\Controllers\\WooCommerceController' ) ) {
            $woo_ctrl = new WooCommerceController();
            $woo_ctrl->register_routes();
        }
    }

    public function handle_handshake( \WP_REST_Request $request ): \WP_REST_Response {
        return new \WP_REST_Response( [
            'status'        => 'ok',
            'plugin'        => 'craftor-core',
            'version'       => CRAFTOR_CORE_VERSION,
            'tier'          => 'core',
            'tools_count'   => 86,
            'server_status' => 'listening',
            'elementor'     => class_exists( '\\Elementor\\Plugin' ) ? 'active' : 'standby',
            'woocommerce'   => class_exists( '\\WooCommerce' ) ? 'active' : 'standby',
        ], 200 );
    }
}
