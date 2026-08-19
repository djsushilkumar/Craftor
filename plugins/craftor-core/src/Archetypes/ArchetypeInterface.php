<?php
namespace Craftor\Core\Archetypes;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Interface ArchetypeInterface
 * Standard contract for pure PHP Elementor AST generation.
 */
interface ArchetypeInterface {
    public function getKey(): string;
    public function getName(): string;
    public function getDescription(): string;
    public function getAst( string $theme, string $title ): array;
    public function getWooCommercePlans(): array;
}
