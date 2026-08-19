<?php
namespace Craftor\Core\Archetypes;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class AgencyArchetype extends AbstractArchetype {
    public function getKey(): string {
        return 'agency';
    }

    public function getName(): string {
        return 'Creative Agency & Portfolio';
    }

    public function getDescription(): string {
        return 'Case studies, multidisciplinary design services, team showcase, and project inquiry.';
    }

    public function getAst( string $theme, string $title ): array {
        $c = $this->resolveThemeColors( $theme );
        $hero_img = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

        return [
            [
                'id'       => 'agn_hero',
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
                        'id'       => 'agn_h_col1',
                        'elType'   => 'container',
                        'settings' => [
                            'width'          => [ 'unit' => '%', 'size' => 55 ],
                            'flex_direction' => 'column',
                        ],
                        'elements' => [
                            [
                                'id'         => 'agn_badge',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => '🎨 AWARD-WINNING DIGITAL STUDIO',
                                    'header_size' => 'h6',
                                    'title_color' => $c['primary'],
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Outfit',
                                    'typography_font_weight' => '800',
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'agn_title',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => "Design Future Experiences with {$title}",
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
                                'id'         => 'agn_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [
                                    'editor'     => "We partner with visionary founders to build category-defining brands, interactive platforms, and scalable digital products.",
                                    'text_color' => $c['text_mute'],
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Inter',
                                    'typography_font_size' => [ 'unit' => 'px', 'size' => 18 ],
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'agn_btn',
                                'elType'     => 'widget',
                                'widgetType' => 'button',
                                'settings'   => [
                                    'text'             => 'View Our Work →',
                                    'link'             => [ 'url' => '#portfolio' ],
                                    'size'             => 'md',
                                    'background_color' => $c['primary'],
                                    'button_text_color'=> '#000000',
                                ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'agn_h_col2',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 40 ] ],
                        'elements' => [
                            [
                                'id'         => 'agn_img',
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
        ];
    }
}
