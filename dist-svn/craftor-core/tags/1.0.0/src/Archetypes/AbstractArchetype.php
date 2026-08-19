<?php
namespace Craftor\Core\Archetypes;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

abstract class AbstractArchetype implements ArchetypeInterface {
    protected function resolveThemeColors( string $theme ): array {
        switch ( $theme ) {
            case 'clean-blue':
                return [
                    'bg_dark'   => '#FFFFFF',
                    'bg_card'   => '#F8FAFC',
                    'primary'   => '#0284C7',
                    'text_main' => '#0F172A',
                    'text_mute' => '#64748B',
                ];
            case 'neon-cyan':
                return [
                    'bg_dark'   => '#070A12',
                    'bg_card'   => '#0F172A',
                    'primary'   => '#06B6D4',
                    'text_main' => '#FFFFFF',
                    'text_mute' => '#94A3B8',
                ];
            case 'emerald-green':
                return [
                    'bg_dark'   => '#061A14',
                    'bg_card'   => '#0F2D24',
                    'primary'   => '#10B981',
                    'text_main' => '#FFFFFF',
                    'text_mute' => '#A7F3D0',
                ];
            case 'dark-gold':
            default:
                return [
                    'bg_dark'   => '#070A12',
                    'bg_card'   => '#111827',
                    'primary'   => '#F59E0B',
                    'text_main' => '#FFFFFF',
                    'text_mute' => '#94A3B8',
                ];
        }
    }

    public function getWooCommercePlans(): array {
        $prefix = strtoupper( $this->getKey() );
        return [
            [ 'name' => 'Starter Plan', 'price' => '19.00', 'sku' => "{$prefix}-START" ],
            [ 'name' => 'Professional Plan', 'price' => '49.00', 'sku' => "{$prefix}-PRO" ],
            [ 'name' => 'Enterprise Plan', 'price' => '99.00', 'sku' => "{$prefix}-VIP" ],
        ];
    }
}
