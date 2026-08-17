<?php
/**
 * Plugin Name: Craftor Core
 * Plugin URI: https://craftor.ai
 * Description: Universal Model Context Protocol (MCP) platform for WordPress and Elementor (Free Tier).
 * Version: 1.0.0
 * Author: Craftor AI Core Organization
 * Author URI: https://craftor.ai
 * License: GPLv2 or later
 * Text Domain: craftor
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'CRAFTOR_CORE_VERSION', '1.0.0' );
define( 'CRAFTOR_CORE_FILE', __FILE__ );
define( 'CRAFTOR_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'CRAFTOR_CORE_URL', plugin_dir_url( __FILE__ ) );

// Autoload core classes
if ( file_exists( CRAFTOR_CORE_PATH . 'vendor/autoload.php' ) ) {
    require_once CRAFTOR_CORE_PATH . 'vendor/autoload.php';
} else {
    spl_autoload_register( function( $class ) {
        $prefix = 'Craftor\\Core\\';
        $len = strlen( $prefix );
        if ( strncmp( $prefix, $class, $len ) !== 0 ) {
            return;
        }
        $relative_class = substr( $class, $len );
        $parts = explode( '\\', $relative_class );
        
        $direct_path = str_replace( '\\', '/', $relative_class ) . '.php';
        
        $kebab_parts = array_map( function( $part ) {
            return strtolower( preg_replace( '/(?<!^)[A-Z]/', '-$0', $part ) );
        }, $parts );
        $kebab_path = implode( '/', $kebab_parts ) . '.php';

        $directories = [
            CRAFTOR_CORE_PATH . 'includes/',
            CRAFTOR_CORE_PATH . 'src/',
        ];

        foreach ( $directories as $dir ) {
            foreach ( [ $direct_path, $kebab_path ] as $rel ) {
                $file = $dir . $rel;
                if ( file_exists( $file ) ) {
                    require_once $file;
                    return;
                }
            }
        }
    } );
}

// Register database installation on plugin activation
register_activation_hook( CRAFTOR_CORE_FILE, function() {
    if ( class_exists( 'Craftor\\Core\\Database\\SchemaInstaller' ) ) {
        \Craftor\Core\Database\SchemaInstaller::install();
    }
} );

add_action( 'plugins_loaded', function() {
    // Check and run DB migration if version upgraded
    if ( get_option( 'craftor_db_version' ) !== CRAFTOR_CORE_VERSION && class_exists( 'Craftor\\Core\\Database\\SchemaInstaller' ) ) {
        \Craftor\Core\Database\SchemaInstaller::install();
    }

    \Craftor\Core\Plugin::instance()->init();
} );

