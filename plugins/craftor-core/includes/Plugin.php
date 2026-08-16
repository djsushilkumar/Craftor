<?php
namespace Craftor\Core;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Plugin {
    private static $instance = null;

    public static function instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init(): void {
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
    }

    public function register_rest_routes(): void {
        register_rest_route( 'craftor/v1', '/auth/handshake', [
            'methods'  => 'GET',
            'callback' => [ $this, 'handle_handshake' ],
            'permission_callback' => '__return_true',
        ] );
    }

    public function handle_handshake( \WP_REST_Request $request ): \WP_REST_Response {
        return new \WP_REST_Response( [
            'status'        => 'ok',
            'plugin'        => 'craftor-core',
            'version'       => CRAFTOR_CORE_VERSION,
            'tier'          => 'core',
            'tools_count'   => 40,
            'server_status' => 'listening',
        ], 200 );
    }
}
