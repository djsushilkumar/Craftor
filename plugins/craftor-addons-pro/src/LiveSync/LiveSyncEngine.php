<?php
namespace Craftor\Pro\LiveSync;

use Craftor\Core\Auth\CraftorAuth;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Live Canvas SSE Sync Engine for Elementor
 * Streams real-time AST updates directly into the live Elementor editor canvas.
 */
class LiveSyncEngine {
    public function init(): void {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
        add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_editor_assets' ] );
    }

    public function register_routes(): void {
        register_rest_route( 'craftor/v1', '/editor/events', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'handle_event_stream' ],
            'permission_callback' => '__return_true',
        ] );
    }

    public function handle_event_stream( WP_REST_Request $request ) {
        $token = $request->get_param( 'token' );
        if ( ! CraftorAuth::verify_raw_token( $token ) ) {
            status_header( 401 );
            echo wp_json_encode( [ 'error' => 'Unauthorized live sync token' ] );
            exit;
        }

        header( 'Content-Type: text/event-stream' );
        header( 'Cache-Control: no-cache' );
        header( 'Connection: keep-alive' );
        header( 'X-Accel-Buffering: no' );

        echo "event: connected\n";
        echo 'data: ' . wp_json_encode( [ 'status' => 'connected', 'timestamp' => time() ] ) . "\n\n";

        if ( ob_get_level() > 0 ) {
            ob_flush();
        }
        flush();
        exit;
    }

    public function enqueue_editor_assets(): void {
        wp_enqueue_script(
            'craftor-pro-livesync',
            CRAFTOR_PRO_URL . 'assets/js/editor-livesync.js',
            [ 'elementor-editor' ],
            CRAFTOR_PRO_VERSION,
            true
        );
        wp_localize_script( 'craftor-pro-livesync', 'craftorProData', [
            'sseUrl' => rest_url( 'craftor/v1/editor/events' ),
            'token'  => get_option( 'craftor_api_token' ),
        ] );
    }
}
