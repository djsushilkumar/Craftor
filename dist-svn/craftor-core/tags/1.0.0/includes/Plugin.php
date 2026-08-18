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
        // 0. Load Central Auth, Approval & SSRF Authorities
        $auth_file = CRAFTOR_CORE_PATH . 'src/auth/craftor-auth.php';
        if ( file_exists( $auth_file ) ) {
            require_once $auth_file;
        }
        $approval_file = CRAFTOR_CORE_PATH . 'src/auth/craftor-approval.php';
        if ( file_exists( $approval_file ) ) {
            require_once $approval_file;
        }
        $ssrf_file = CRAFTOR_CORE_PATH . 'src/auth/craftor-ssrf-validator.php';
        if ( file_exists( $ssrf_file ) ) {
            require_once $ssrf_file;
        }

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

        // 3. Load & Register Content & Media Controller (EMCP)
        $content_file = CRAFTOR_CORE_PATH . 'src/controllers/content-controller.php';
        if ( file_exists( $content_file ) ) {
            require_once $content_file;
        }
        if ( class_exists( 'Craftor\\Core\\Controllers\\ContentController' ) ) {
            $content_controller = new \Craftor\Core\Controllers\ContentController();
            $content_controller->register_routes();
        }

        // 4. Load & Register Site Operations Controller (EMCP)
        $site_file = CRAFTOR_CORE_PATH . 'src/controllers/site-controller.php';
        if ( file_exists( $site_file ) ) {
            require_once $site_file;
        }
        if ( class_exists( 'Craftor\\Core\\Controllers\\SiteController' ) ) {
            $site_controller = new \Craftor\Core\Controllers\SiteController();
            $site_controller->register_routes();
        }

        // 5. Load & Register SEO Controller (EMCP)
        $seo_file = CRAFTOR_CORE_PATH . 'src/controllers/seo-controller.php';
        if ( file_exists( $seo_file ) ) {
            require_once $seo_file;
        }
        if ( class_exists( 'Craftor\\Core\\Controllers\\SeoController' ) ) {
            $seo_controller = new \Craftor\Core\Controllers\SeoController();
            $seo_controller->register_routes();
        }

        // 6. Load & Register Human Approval Controller
        $approval_ctrl_file = CRAFTOR_CORE_PATH . 'src/controllers/approval-controller.php';
        if ( file_exists( $approval_ctrl_file ) ) {
            require_once $approval_ctrl_file;
        }
        if ( class_exists( 'Craftor\\Core\\Controllers\\ApprovalController' ) ) {
            $approval_controller = new \Craftor\Core\Controllers\ApprovalController();
            $approval_controller->register_routes();
        }

        // 7. Load & Register 3-Step AI Wizard Controller (Channel 2)
        $wizard_ctrl_file = CRAFTOR_CORE_PATH . 'src/controllers/wizard-controller.php';
        if ( file_exists( $wizard_ctrl_file ) ) {
            require_once $wizard_ctrl_file;
        }
        if ( class_exists( 'Craftor\\Core\\Controllers\\WizardController' ) ) {
            $wizard_controller = new \Craftor\Core\Controllers\WizardController();
            $wizard_controller->register_routes();
        }

        // 8. Native Built-in MCP SSE Endpoint (Direct AI Client Connection)
        register_rest_route( 'craftor/v1', '/sse', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'handle_sse_stream' ],
            'permission_callback' => '__return_true',
        ] );
    }

    public function handle_sse_stream( \WP_REST_Request $request ) {
        $token = $request->get_param( 'token' );
        $auth_header = $request->get_header( 'X-Craftor-Token' ) ?: $request->get_header( 'Authorization' );
        $header_token = $auth_header ? str_replace( 'Bearer ', '', trim( $auth_header ) ) : null;
        $effective_token = ! empty( $token ) ? $token : $header_token;
        $saved = get_option( 'craftor_api_token' );

        if ( empty( $saved ) || empty( $effective_token ) || ! hash_equals( (string) $saved, (string) $effective_token ) ) {
            header( 'Content-Type: application/json; charset=utf-8' );
            status_header( 401 );
            echo wp_json_encode( [ 'code' => 'rest_unauthorized', 'message' => 'Unauthorized token', 'data' => [ 'status' => 401 ] ] );
            exit;
        }

        header( 'Content-Type: text/event-stream' );
        header( 'Cache-Control: no-cache' );
        header( 'Connection: keep-alive' );
        header( 'X-Accel-Buffering: no' );

        echo "event: endpoint\ndata: " . esc_url_raw( rest_url( 'craftor/v1/mcp/messages' ) ) . "\n\n";
        echo "event: ping\ndata: " . wp_json_encode( [ 'timestamp' => time(), 'status' => 'connected', 'tools_count' => 120 ] ) . "\n\n";
        flush();
        exit;
    }

    public function handle_handshake( \WP_REST_Request $request ): \WP_REST_Response {
        return new \WP_REST_Response( [
            'status'        => 'ok',
            'plugin'        => 'craftor-core',
            'edition'       => 'EMCP Pro Suite',
            'version'       => CRAFTOR_CORE_VERSION,
            'tier'          => 'enterprise',
            'tools_count'   => 120,
            'server_status' => 'listening',
            'elementor'     => class_exists( '\\Elementor\\Plugin' ) ? 'active' : 'standby',
            'woocommerce'   => class_exists( '\\WooCommerce' ) ? 'active' : 'standby',
            'db_version'    => get_option( 'craftor_db_version', CRAFTOR_CORE_VERSION ),
            'sse_endpoint'  => rest_url( 'craftor/v1/sse' ),
        ], 200 );
    }
}
