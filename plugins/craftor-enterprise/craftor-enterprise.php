<?php
/**
 * Plugin Name: Craftor Enterprise
 * Plugin URI: https://craftor.ai/enterprise
 * Description: Enterprise tier for Craftor adding WPMU multi-site orchestration, KMS key vault, and white-label SDK.
 * Version: 1.0.0
 * Author: Craftor AI Core Organization
 * Author URI: https://craftor.ai
 * License: Commercial
 * Text Domain: craftor-enterprise
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'CRAFTOR_ENTERPRISE_VERSION', '1.0.0' );
define( 'CRAFTOR_ENTERPRISE_FILE', __FILE__ );
define( 'CRAFTOR_ENTERPRISE_PATH', plugin_dir_path( __FILE__ ) );
define( 'CRAFTOR_ENTERPRISE_URL', plugin_dir_url( __FILE__ ) );

if ( file_exists( __DIR__ . '/includes/Plugin.php' ) ) {
    require_once __DIR__ . '/includes/Plugin.php';
}

add_action( 'plugins_loaded', function() {
    if ( class_exists( '\\Craftor\\Enterprise\\Plugin' ) ) {
        \Craftor\Enterprise\Plugin::instance()->init();
    }
} );
