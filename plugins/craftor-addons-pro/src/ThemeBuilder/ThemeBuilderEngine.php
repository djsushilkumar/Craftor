<?php
namespace Craftor\Pro\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Theme Builder Engine for Elementor Pro
 * Synthesizes dynamic Header, Footer, Popup, Single Post, and Archive templates.
 */
class ThemeBuilderEngine {
    public function init(): void {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes(): void {
        register_rest_route( 'craftor-pro/v1', '/theme-builder/templates', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_available_templates' ],
            'permission_callback' => '__return_true',
        ] );
    }

    public function get_available_templates(): array {
        return [
            'headers'  => [ 'modern-sticky-header', 'minimal-transparent-header', 'centered-brand-header' ],
            'footers'  => [ '4-column-enterprise-footer', 'minimal-newsletter-footer' ],
            'popups'   => [ 'lead-capture-modal', 'exit-intent-offer', 'login-register-dialog' ],
            'archives' => [ 'bento-grid-archive', 'magazine-post-list' ],
        ];
    }
}
