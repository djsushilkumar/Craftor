<?php
namespace Craftor\Core;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Main Craftor Core Plugin Orchestrator
 */
class Plugin {
    private static $instance = null;
    private $admin_settings = null;
    private $elementor_controller = null;
    private $woocommerce_controller = null;

    public static function instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init(): void {
        // 1. Initialize Admin Settings Dashboard
        if ( is_admin() ) {
            $admin_file = CRAFTOR_CORE_PATH . 'src/admin/admin-settings.php';
            if ( file_exists( $admin_file ) ) {
                require_once $admin_file;
            }
            if ( class_exists( 'Craftor\\Core\\Admin\\AdminSettings' ) ) {
                $this->admin_settings = new \Craftor\Core\Admin\AdminSettings();
            }
        }

        // 2. Register REST API Routes
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
        if ( did_action( 'rest_api_init' ) ) {
            $this->register_rest_routes();
        }
    }

    public function register_rest_routes(): void {
        // Core Handshake
        register_rest_route( 'craftor/v1', '/auth/handshake', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'handle_handshake' ],
            'permission_callback' => '__return_true',
        ] );

        // 1. Load & Register Elementor Controller
        $elementor_file = CRAFTOR_CORE_PATH . 'src/controllers/elementor-controller.php';
        if ( file_exists( $elementor_file ) ) {
            require_once $elementor_file;
        }
        if ( class_exists( 'Craftor\\Core\\Controllers\\ElementorController' ) ) {
            $this->elementor_controller = new \Craftor\Core\Controllers\ElementorController();
            $this->elementor_controller->register_routes();
        }

        // 2. Load & Register WooCommerce Controller
        $woo_file = CRAFTOR_CORE_PATH . 'src/controllers/woocommerce-controller.php';
        if ( file_exists( $woo_file ) ) {
            require_once $woo_file;
        }
        if ( class_exists( 'Craftor\\Core\\Controllers\\WooCommerceController' ) ) {
            $this->woocommerce_controller = new \Craftor\Core\Controllers\WooCommerceController();
            $this->woocommerce_controller->register_routes();
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
            'db_version'    => get_option( 'craftor_db_version', CRAFTOR_CORE_VERSION ),
        ], 200 );
    }
}
