<?php
namespace Craftor\Core\Archetypes;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class RestaurantArchetype extends AbstractArchetype {
    public function getKey(): string {
        return 'restaurant';
    }

    public function getName(): string {
        return 'Cafe & Artisan Dining';
    }

    public function getDescription(): string {
        return 'Artisan menus, chef specials, online table reservations, and cozy culinary storytelling.';
    }

    public function getAst( string $theme, string $title ): array {
        $c = $this->resolveThemeColors( $theme );
        $hero_img = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

        return [
            [
                'id'       => 'rest_hero',
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
                        'id'       => 'rest_h_col1',
                        'elType'   => 'container',
                        'settings' => [
                            'width'          => [ 'unit' => '%', 'size' => 55 ],
                            'flex_direction' => 'column',
                        ],
                        'elements' => [
                            [
                                'id'         => 'rest_badge',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => '🌿 FARM-TO-TABLE ARTISAN CUISINE',
                                    'header_size' => 'h6',
                                    'title_color' => $c['primary'],
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Outfit',
                                    'typography_font_weight' => '800',
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'rest_title',
                                'elType'     => 'widget',
                                'widgetType' => 'heading',
                                'settings'   => [
                                    'title'       => "Artisan Culinary Dining at {$title}",
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
                                'id'         => 'rest_text',
                                'elType'     => 'widget',
                                'widgetType' => 'text-editor',
                                'settings'   => [
                                    'editor'     => "Handcrafted seasonal tasting menus, ethically sourced organic ingredients, and an unforgettable candlelit atmosphere.",
                                    'text_color' => $c['text_mute'],
                                    'typography_typography' => 'custom',
                                    'typography_font_family' => 'Inter',
                                    'typography_font_size' => [ 'unit' => 'px', 'size' => 18 ],
                                ],
                                'elements'   => [],
                            ],
                            [
                                'id'         => 'rest_btn',
                                'elType'     => 'widget',
                                'widgetType' => 'button',
                                'settings'   => [
                                    'text'             => 'Reserve a Table Online →',
                                    'link'             => [ 'url' => '#reservation' ],
                                    'size'             => 'md',
                                    'background_color' => $c['primary'],
                                    'button_text_color'=> '#000000',
                                ],
                                'elements'   => [],
                            ],
                        ],
                    ],
                    [
                        'id'       => 'rest_h_col2',
                        'elType'   => 'container',
                        'settings' => [ 'width' => [ 'unit' => '%', 'size' => 40 ] ],
                        'elements' => [
                            [
                                'id'         => 'rest_img',
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
