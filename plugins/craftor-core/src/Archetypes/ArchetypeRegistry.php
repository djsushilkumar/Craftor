<?php
namespace Craftor\Core\Archetypes;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class ArchetypeRegistry {
    private static array $archetypes = [];

    public static function init(): void {
        self::register( new SaasArchetype() );
        self::register( new FitnessArchetype() );
        self::register( new RestaurantArchetype() );
        self::register( new AgencyArchetype() );
    }

    public static function register( ArchetypeInterface $archetype ): void {
        self::$archetypes[ $archetype->getKey() ] = $archetype;
    }

    public static function get( string $key ): ArchetypeInterface {
        if ( empty( self::$archetypes ) ) {
            self::init();
        }
        return self::$archetypes[ $key ] ?? self::$archetypes['saas'];
    }

    public static function getAll(): array {
        if ( empty( self::$archetypes ) ) {
            self::init();
        }
        return self::$archetypes;
    }
}
