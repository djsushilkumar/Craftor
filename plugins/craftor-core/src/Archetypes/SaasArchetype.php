<?php
namespace Craftor\Core\Archetypes;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class SaasArchetype extends AbstractArchetype {
    public function getKey(): string {
        return 'saas';
    }

    public function getName(): string {
        return 'SaaS & Tech Startup';
    }

    public function getDescription(): string {
        return 'Features, 3-tier pricing, and testimonials for digital platforms and software.';
    }

    public function getAst( string $theme, string $title ): array {
        $c = $this->resolveThemeColors( $theme );
        $hero_img = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

        return [
            // Hero Section
            [
                'id'       => 'saas_hero',
                'elType'   => 'container',
                'settings' => [
                    'layout'                => 'full',
                    'flex_direction'        => 'row',
                    'flex_justify_content'  => 'space-between',
                    'flex_align_items'      => 'center',
                    'background_background' => 'classic',
                    'background_color'      => $c['bg_dark'],
                    'padding'               => [ 'unit' => 'px', 'top' => '80', 'bottom' => '80', 'left' => '40', 'right' => '40' ],
                ],
                'elements' => [
                    [
                        'id'       => 'saas_h_left',
                        'elType'   => 'container',
                        'settings' => [
                            'width'          => [ 'unit' => '%', 'size' => 55 ],
                            'flex_direction' => 'column',
                        ],
                        'elements' => [
                            [
                                'id'         => 'saas_badge',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => '✨ AUTONOMOUS PLATFORM',
                                    'header_size' => 'h6',
                                    'title_color' => $c['primary'],
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Outfit',
                                    'typography_font_weight' => '800',
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'saas_title',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => "Scale Faster with {$title}",
                                    'header_size' => 'h1',
                                    'title_color' => $c['text_main'],
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Outfit',
                                    'typography_font_size' => [ 'unit' => 'px', 'size' => 48 ],
                                    'typography_font_weight' => '800',
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'saas_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [
                                    'editor'     => "Automate mission-critical digital workflows with zero-shot accuracy, enterprise reliability, and real-time synchronization.",
                                    'text_color' => $c['text_mute'],
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Inter',
                                    'typography_font_size' => [ 'unit' => 'px', 'size' => 18 ],
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'saas_btn',
                                'elType'     => 'widget',
                                'widgetType' => 'button',
                                'settings'   => [
                                    'text'             => 'Start Free Trial →',
                                    'link'             => [ 'url' => '#pricing' ],
                                    'size'             => 'md',
                                    'background_color' => $c['primary'],
                                    'button_text_color'=> '#000000',
                                ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'saas_h_right',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 40 ] ],
                        'elements' => [
                            [
                                'id'         => 'saas_img',
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
            // Bento Features
            [
                'id'       => 'saas_bento',
                'elType'   => 'container',
                'settings' => [
                    'layout'                => 'full',
                    'flex_direction'        => 'row',
                    'flex_justify_content'  => 'space-between',
                    'background_background' => 'classic',
                    'background_color'      => $c['bg_card'],
                    'padding'               => [ 'unit' => 'px', 'top' => '60', 'bottom' => '60', 'left' => '40', 'right' => '40' ],
                ],
                'elements' => [
                    [
                        'id'       => 'saas_f1',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 31 ] ],
                        'elements' => [
                            [
                                'id'         => 'w_sf1_head',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [ 'title' => '🧠 Autonomous Core', 'title_color' => $c['primary'], 'header_size' => 'h3' ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'w_sf1_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [ 'editor' => 'Zero-shot LLM reasoning integrated directly into live application execution DAGs.', 'text_color' => $c['text_mute'] ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'saas_f2',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 31 ] ],
                        'elements' => [
                            [
                                'id'         => 'w_sf2_head',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [ 'title' => '⚡ Sub-15ms Sync', 'title_color' => $c['primary'], 'header_size' => 'h3' ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'w_sf2_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [ 'editor' => 'Real-time distributed state propagation with vector clock conflict resolution.', 'text_color' => $c['text_mute'] ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'saas_f3',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 31 ] ],
                        'elements' => [
                            [
                                'id'         => 'w_sf3_head',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [ 'title' => '🛡️ Zero-Trust Vault', 'title_color' => $c['primary'], 'header_size' => 'h3' ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'w_sf3_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [ 'editor' => 'AES-256 state snapshots, DNS pinning, and automated rollback verification.', 'text_color' => $c['text_mute'] ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
