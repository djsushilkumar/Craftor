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
        $base_dir = CRAFTOR_CORE_PATH . 'includes/';
        $len = strlen( $prefix );
        if ( strncmp( $prefix, $class, $len ) !== 0 ) {
            return;
        }
        $relative_class = substr( $class, $len );
        $file = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';
        if ( file_exists( $file ) ) {
            require $file;
        }
    } );
}

add_action( 'plugins_loaded', function() {
    \Craftor\Core\Plugin::instance()->init();
} );
