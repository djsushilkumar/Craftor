<?php
/**
 * Plugin Name: Craftor Addons Pro
 * Plugin URI: https://craftor.ai/pro
 * Description: Commercial extension for Craftor Core adding Live Canvas SSE Sync, Theme Builder, Global Kits, Advanced WooCommerce, and SaaS License Activation.
 * Version: 1.0.0
 * Author: Craftor AI Core Organization
 * Author URI: https://craftor.ai
 * License: Commercial
 * Text Domain: craftor-addons-pro
 * Requires Plugins: craftor-core
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

// Class Autoloader
spl_autoload_register( function( $class ) {
    $prefix = 'Craftor\\Pro\\';
    $len = strlen( $prefix );
    if ( strncmp( $prefix, $class, $len ) !== 0 ) {
        return;
    }
    $relative_class = substr( $class, $len );
    $file = CRAFTOR_PRO_PATH . 'src/' . str_replace( '\\', '/', $relative_class ) . '.php';
    if ( file_exists( $file ) ) {
        require_once $file;
    }
} );

// Initialize Pro Plugin
add_action( 'plugins_loaded', function() {
    // Check if Craftor Core is active
    if ( ! class_exists( '\\Craftor\\Core\\Plugin' ) ) {
        add_action( 'admin_notices', function() {
            ?>
            <div class="notice notice-error is-dismissible">
                <p><strong>Craftor Addons Pro</strong> requires <strong>Craftor Core</strong> to be installed and active. Please activate Craftor Core.</p>
            </div>
            <?php
        } );
        return;
    }

    if ( class_exists( '\\Craftor\\Pro\\Plugin' ) ) {
        \Craftor\Pro\Plugin::instance()->init();
    }
} );
