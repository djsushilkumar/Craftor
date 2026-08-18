<?php
namespace Craftor\Core\Auth;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Centralized Authentication & Authorization Authority
 * Enforces Zero-Trust token validation, WordPress user capability checks, and object-level authorization.
 */
class CraftorAuth {

    /**
     * Verifies that the incoming REST request is authorized either via:
     * 1. Logged-in WordPress user session with the required capability (and object ID check if provided)
     * 2. Valid Craftor machine token (X-Craftor-Token or Authorization: Bearer <token>)
     *
     * @param \WP_REST_Request $request The REST request instance.
     * @param string $required_capability WordPress capability required for user sessions (e.g. 'read', 'edit_posts', 'manage_options').
     * @param int|null $object_id Optional post/page/product ID for object-level capability checks (e.g. 'edit_post', 'delete_post').
     * @param string|null $object_cap Optional object capability (e.g. 'edit_post', 'delete_post'). If null, derived from required_capability or skipped.
     * @return bool True if authorized, false otherwise.
     */
    public static function verify_request(
        \WP_REST_Request $request,
        string $required_capability = 'edit_posts',
        ?int $object_id = null,
        ?string $object_cap = null
    ): bool {
        // Mode A: WordPress authenticated user session
        if ( is_user_logged_in() ) {
            // If an object ID and object capability are specified, check object-level capability
            if ( $object_id !== null && $object_id > 0 && ! empty( $object_cap ) ) {
                if ( current_user_can( $object_cap, $object_id ) ) {
                    return true;
                }
            }
            if ( current_user_can( $required_capability ) ) {
                return true;
            }
        }

        // Mode B: Craftor Machine Token
        return self::verify_token( $request );
    }

    /**
     * Validates the machine token passed via X-Craftor-Token or Authorization: Bearer header.
     *
     * @param \WP_REST_Request $request
     * @return bool True if token matches configured database token, false otherwise.
     */
    public static function verify_token( \WP_REST_Request $request ): bool {
        $saved_token = get_option( 'craftor_api_token' );
        
        // If no token is configured in database, DENY all machine token requests
        if ( empty( $saved_token ) || ! is_string( $saved_token ) || trim( $saved_token ) === '' ) {
            return false;
        }

        $auth_header = $request->get_header( 'X-Craftor-Token' ) ?: $request->get_header( 'Authorization' );
        if ( empty( $auth_header ) || ! is_string( $auth_header ) ) {
            return false;
        }

        $clean_token = trim( str_replace( 'Bearer ', '', trim( $auth_header ) ) );
        if ( empty( $clean_token ) ) {
            return false;
        }

        return hash_equals( (string) $saved_token, (string) $clean_token );
    }

    /**
     * Validates an explicit token string (used by SSE stream endpoint where token is query param or header).
     *
     * @param string|null $provided_token
     * @return bool
     */
    public static function verify_raw_token( ?string $provided_token ): bool {
        $saved_token = get_option( 'craftor_api_token' );
        if ( empty( $saved_token ) || ! is_string( $saved_token ) || trim( $saved_token ) === '' ) {
            return false;
        }
        if ( empty( $provided_token ) || ! is_string( $provided_token ) ) {
            return false;
        }
        $clean = trim( str_replace( 'Bearer ', '', trim( $provided_token ) ) );
        if ( empty( $clean ) ) {
            return false;
        }
        return hash_equals( (string) $saved_token, (string) $clean );
    }
}
