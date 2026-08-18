<?php
namespace Craftor\Core\Controllers;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use Craftor\Core\Auth\CraftorAuth;

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

        $archetype = sanitize_key( $params['archetype'] ?? 'saas' );
        $theme     = sanitize_key( $params['theme'] ?? 'dark-gold' );
        $title     = sanitize_text_field( $params['title'] ?? 'NextGen Website' );
        $has_woo   = ! empty( $params['create_woo_products'] );
        $has_seo   = ! empty( $params['inject_seo'] );

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

        // 2. Generate 100% Native Elementor AST for Chosen Archetype & Theme
        $ast = $this->build_archetype_ast( $archetype, $theme, $title );
        update_post_meta( $page_id, '_elementor_data', wp_slash( wp_json_encode( $ast ) ) );

        // 3. Create WooCommerce Products if requested
        $product_ids = [];
        if ( $has_woo ) {
            $product_ids = $this->create_archetype_products( $archetype );
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
            'archetype'            => $archetype,
            'theme'                => $theme,
            'title'                => $title,
            'containers_count'     => count( $ast ),
            'woocommerce_products' => $product_ids,
        ], 200 );
    }

    /**
     * Builds 100% Native Elementor AST for the specified archetype & theme
     */
    private function build_archetype_ast( string $archetype, string $theme, string $title ): array {
        // Theme Colors
        $bg_dark   = '#070A12';
        $bg_card   = '#111827';
        $primary   = '#F59E0B'; // default gold
        $text_main = '#FFFFFF';
        $text_mute = '#94A3B8';

        if ( $theme === 'clean-blue' ) {
            $bg_dark   = '#FFFFFF';
            $bg_card   = '#F8FAFC';
            $primary   = '#0284C7';
            $text_main = '#0F172A';
            $text_mute = '#64748B';
        } elseif ( $theme === 'neon-cyan' ) {
            $bg_dark   = '#070A12';
            $bg_card   = '#0F172A';
            $primary   = '#06B6D4';
            $text_main = '#FFFFFF';
            $text_mute = '#94A3B8';
        } elseif ( $theme === 'emerald-green' ) {
            $bg_dark   = '#061A14';
            $bg_card   = '#0F2D24';
            $primary   = '#10B981';
            $text_main = '#FFFFFF';
            $text_mute = '#A7F3D0';
        }

        // Section 1: Hero
        $hero_title = "Welcome to {$title}";
        $hero_desc  = "The ultimate modern experience designed for speed, performance, and uncompromising quality.";
        $hero_img   = 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80';

        if ( $archetype === 'fitness' ) {
            $hero_title = "Unleash Your Ultimate Strength at {$title}";
            $hero_desc  = "Elite strength conditioning, world-class trainers, and 24/7 access to state-of-the-art fitness equipment.";
            $hero_img   = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80';
        } elseif ( $archetype === 'restaurant' ) {
            $hero_title = "Artisan Culinary Dining at {$title}";
            $hero_desc  = "Fresh farm-to-table organic ingredients, master chef specials, and unforgettable cozy ambiance.";
            $hero_img   = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
        } elseif ( $archetype === 'agency' ) {
            $hero_title = "Digital Transformation & Brand Strategy at {$title}";
            $hero_desc  = "Award-winning design, engineering, and digital growth agency scaling ambitious modern brands.";
            $hero_img   = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
        }

        return [
            // Section 1: Hero
            [
                'id'       => 'wiz_hero',
                'elType'   => 'container',
                'settings' => [
                    'layout'                => 'full',
                    'flex_direction'        => 'row',
                    'flex_justify_content'  => 'space-between',
                    'flex_align_items'      => 'center',
                    'background_background' => 'classic',
                    'background_color'      => $bg_dark,
                    'padding'               => [ 'unit' => 'px', 'top' => '80', 'bottom' => '80', 'left' => '40', 'right' => '40' ],
                ],
                'elements' => [
                    [
                        'id'       => 'wiz_h_col1',
                        'elType'   => 'container',
                        'settings' => [
                            'width'          => [ 'unit' => '%', 'size' => 55 ],
                            'flex_direction' => 'column',
                        ],
                        'elements' => [
                            [
                                'id'         => 'wiz_h_badge',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => '✨ OFFICIAL LAUNCH',
                                    'header_size' => 'h6',
                                    'title_color' => $primary,
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'wiz_h_title',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => $hero_title,
                                    'header_size' => 'h1',
                                    'title_color' => $text_main,
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Outfit',
                                    'typography_font_size' => [ 'unit' => 'px', 'size' => 48 ],
                                    'typography_font_weight' => '800',
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'wiz_h_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [
                                    'editor'     => $hero_desc,
                                    'text_color' => $text_mute,
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Inter',
                                    'typography_font_size' => [ 'unit' => 'px', 'size' => 18 ],
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'wiz_h_btn',
                                'elType'     => 'widget',
                                'widgetType' => 'button',
                                'settings'   => [
                                    'text'             => 'Get Started Today →',
                                    'link'             => [ 'url' => '#pricing' ],
                                    'size'             => 'md',
                                    'background_color' => $primary,
                                    'button_text_color'=> '#000000',
                                ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'wiz_h_col2',
                        'elType'   => 'container',
                        'settings' => [
                            'width' => [ 'unit' => '%', 'size' => 40 ],
                        ],
                        'elements' => [
                            [
                                'id'         => 'wiz_h_img',
                                'elType'     => 'widget',
                                'widgetType' => 'image',
                                'settings'   => [
                                    'image'         => [ 'url' => $hero_img, 'id' => 0 ],
                                    'image_size'    => 'full',
                                    'border_radius' => [ 'unit' => 'px', 'top' => 16, 'bottom' => 16, 'left' => 16, 'right' => 16 ],
                                ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                ],
            ],

            // Section 2: Features / Highlights
            [
                'id'       => 'wiz_features',
                'elType'   => 'container',
                'settings' => [
                    'layout'                => 'full',
                    'flex_direction'        => 'row',
                    'flex_justify_content'  => 'space-between',
                    'background_background' => 'classic',
                    'background_color'      => $bg_card,
                    'padding'               => [ 'unit' => 'px', 'top' => '60', 'bottom' => '60', 'left' => '40', 'right' => '40' ],
                ],
                'elements' => [
                    [
                        'id'       => 'wiz_f1',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 31 ] ],
                        'elements' => [
                            [
                                'id'         => 'w_f1_head',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [ 'title' => '⚡ Premium Quality', 'title_color' => $primary, 'header_size' => 'h3' ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'w_f1_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [ 'editor' => 'Engineered to highest industry standards with SLA-backed guarantees.', 'text_color' => $text_mute ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'wiz_f2',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 31 ] ],
                        'elements' => [
                            [
                                'id'         => 'w_f2_head',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [ 'title' => '🛡️ Enterprise Security', 'title_color' => $primary, 'header_size' => 'h3' ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'w_f2_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [ 'editor' => 'Complete Zero-Trust security and cryptographic data protection.', 'text_color' => $text_mute ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'wiz_f3',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 31 ] ],
                        'elements' => [
                            [
                                'id'         => 'w_f3_head',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [ 'title' => '🌟 24/7 Dedicated Support', 'title_color' => $primary, 'header_size' => 'h3' ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'w_f3_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [ 'editor' => 'Round-the-clock advisory, maintenance, and technical support.', 'text_color' => $text_mute ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                ],
            ],

            // Section 3: Call to Action
            [
                'id'       => 'wiz_cta',
                'elType'   => 'container',
                'settings' => [
                    'layout'                => 'full',
                    'flex_direction'        => 'column',
                    'flex_align_items'      => 'center',
                    'background_background' => 'classic',
                    'background_color'      => $bg_dark,
                    'padding'               => [ 'unit' => 'px', 'top' => '80', 'bottom' => '80', 'left' => '40', 'right' => '40' ],
                ],
                'elements' => [
                    [
                        'id'         => 'wiz_c_title',
                        'elType'     => 'widget',
                        'widgetType' => 'heading',
                        'settings'   => [
                            'title'       => "Ready to Experience {$title}?",
                            'header_size' => 'h2',
                            'align'       => 'center',
                            'title_color' => $text_main,
                        ],
                        'elements'   => [],
                    ],
                    [
                        'id'         => 'wiz_c_btn',
                        'elType'     => 'widget',
                        'widgetType' => 'button',
                        'settings'   => [
                            'text'             => 'Contact Our Team Today →',
                            'link'             => [ 'url' => '#contact' ],
                            'size'             => 'lg',
                            'background_color' => $primary,
                            'button_text_color'=> '#000000',
                        ],
                        'elements'   => [],
                    ],
                ],
            ],
        ];
    }

    /**
     * Creates matching WooCommerce products in MariaDB
     */
    private function create_archetype_products( string $archetype ): array {
        $product_ids = [];

        $plans = [
            [ 'name' => 'Starter Membership / Plan', 'price' => '19.00', 'sku' => strtoupper($archetype) . '-START' ],
            [ 'name' => 'Pro Tier Membership / Plan', 'price' => '49.00', 'sku' => strtoupper($archetype) . '-PRO' ],
            [ 'name' => 'VIP Enterprise Tier', 'price' => '99.00', 'sku' => strtoupper($archetype) . '-VIP' ],
        ];

        foreach ( $plans as $plan ) {
            $post_id = wp_insert_post( [
                'post_title'   => $plan['name'],
                'post_content' => "Official {$plan['name']} for {$archetype} customer tier.",
                'post_status'  => 'publish',
                'post_type'    => 'product',
            ] );

            if ( $post_id && ! is_wp_error( $post_id ) ) {
                update_post_meta( $post_id, '_regular_price', $plan['price'] );
                update_post_meta( $post_id, '_price', $plan['price'] );
                update_post_meta( $post_id, '_sku', $plan['sku'] );
                update_post_meta( $post_id, '_visibility', 'visible' );
                update_post_meta( $post_id, '_stock_status', 'instock' );
                $product_ids[] = $post_id;
            }
        }

        return $product_ids;
    }
}
