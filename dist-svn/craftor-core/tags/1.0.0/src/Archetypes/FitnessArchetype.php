<?php
namespace Craftor\Core\Archetypes;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class FitnessArchetype extends AbstractArchetype {
    public function getKey(): string {
        return 'fitness';
    }

    public function getName(): string {
        return 'Gym & Fitness Club';
    }

    public function getDescription(): string {
        return 'Trainers, dynamic class schedules, membership pricing, and trial passes.';
    }

    public function getAst( string $theme, string $title ): array {
        $c = $this->resolveThemeColors( $theme );
        $hero_img = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80';

        return [
            [
                'id'       => 'fit_hero',
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
                        'id'       => 'fit_h_col1',
                        'elType'   => 'container',
                        'settings' => [
                            'width'          => [ 'unit' => '%', 'size' => 55 ],
                            'flex_direction' => 'column',
                        ],
                        'elements' => [
                            [
                                'id'         => 'fit_badge',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => '🏋️ ELITE STRENGTH & CONDITIONING',
                                    'header_size' => 'h6',
                                    'title_color' => $c['primary'],
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Outfit',
                                    'typography_font_weight' => '800',
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'fit_title',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => "Unleash Your Power at {$title}",
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
                                'id'         => 'fit_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [
                                    'editor'     => "World-class certified trainers, Olympic lifting platforms, recovery spas, and 24/7 access to state-of-the-art conditioning zones.",
                                    'text_color' => $c['text_mute'],
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Inter',
                                    'typography_font_size' => [ 'unit' => 'px', 'size' => 18 ],
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'fit_btn',
                                'elType'     => 'widget',
                                'widgetType' => 'button',
                                'settings'   => [
                                    'text'             => 'Claim Free 7-Day Pass →',
                                    'link'             => [ 'url' => '#membership' ],
                                    'size'             => 'md',
                                    'background_color' => $c['primary'],
                                    'button_text_color'=> '#000000',
                                ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'fit_h_col2',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 40 ] ],
                        'elements' => [
                            [
                                'id'         => 'fit_img',
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
            // Highlights
            [
                'id'       => 'fit_bento',
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
                        'id'       => 'fit_f1',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 31 ] ],
                        'elements' => [
                            [
                                'id'         => 'w_ff1_head',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [ 'title' => '🏆 Certified Coaches', 'title_color' => $c['primary'], 'header_size' => 'h3' ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'w_ff1_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [ 'editor' => 'Personalized 1-on-1 programming tailored to your biometric goals and metabolic rate.', 'text_color' => $c['text_mute'] ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'fit_f2',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 31 ] ],
                        'elements' => [
                            [
                                'id'         => 'w_ff2_head',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [ 'title' => '⚡ 24/7 Keyless Access', 'title_color' => $c['primary'], 'header_size' => 'h3' ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'w_ff2_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [ 'editor' => 'Train on your schedule with encrypted digital keycard entry 365 days a year.', 'text_color' => $c['text_mute'] ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'fit_f3',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 31 ] ],
                        'elements' => [
                            [
                                'id'         => 'w_ff3_head',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [ 'title' => '❄️ Contrast Therapy & Spa', 'title_color' => $c['primary'], 'header_size' => 'h3' ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'w_ff3_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [ 'editor' => 'Infrared saunas, cold plunge tubs, and compression boots for rapid athletic recovery.', 'text_color' => $c['text_mute'] ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
