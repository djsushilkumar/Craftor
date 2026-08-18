<?php
/**
 * Plugin Name: Craftor Pro
 * Plugin URI: https://craftor.ai/pro
 * Description: Commercial tier for Craftor adding Live Canvas Sync, WooCommerce engine, and Global Kits.
 * Version: 1.0.0
 * Author: Craftor AI Core Organization
 * Author URI: https://craftor.ai
 * License: Commercial
 * Text Domain: craftor-pro
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'CRAFTOR_PRO_VERSION', '1.0.0' );
define( 'CRAFTOR_PRO_FILE', __FILE__ );
define( 'CRAFTOR_PRO_PATH', plugin_dir_path( __FILE__ ) );
define( 'CRAFTOR_PRO_URL', plugin_dir_url( __FILE__ ) );

if ( file_exists( __DIR__ . '/includes/Plugin.php' ) ) {
    require_once __DIR__ . '/includes/Plugin.php';
}

add_action( 'plugins_loaded', function() {
    if ( class_exists( '\\Craftor\\Pro\\Plugin' ) ) {
        \Craftor\Pro\Plugin::instance()->init();
    }
} );
