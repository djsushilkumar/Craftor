<?php
/**
 * Craftor WordPress & Elementor IDE Type Stubs
 * Provides static analysis stubs for WordPress Core, WooCommerce, and Elementor functions and classes.
 * @package Craftor\Stubs
 */

namespace {
    if ( ! defined( 'ABSPATH' ) ) {
        define( 'ABSPATH', __DIR__ . '/' );
    }

    // WordPress Core Functions
    if ( ! function_exists( 'is_admin' ) ) {
        function is_admin(): bool { return false; }
    }
    if ( ! function_exists( 'add_action' ) ) {
        function add_action( string $hook_name, callable $callback, int $priority = 10, int $accepted_args = 1 ): bool { return true; }
    }
    if ( ! function_exists( 'did_action' ) ) {
        function did_action( string $hook_name ): int { return 0; }
    }
    if ( ! function_exists( 'apply_filters' ) ) {
        function apply_filters( string $hook_name, $value, ...$args ) { return $value; }
    }
    if ( ! function_exists( 'add_filter' ) ) {
        function add_filter( string $hook_name, callable $callback, int $priority = 10, int $accepted_args = 1 ): bool { return true; }
    }
    if ( ! function_exists( 'register_rest_route' ) ) {
        function register_rest_route( string $namespace, string $route, array $args = [], bool $override = false ): bool { return true; }
    }
    if ( ! function_exists( 'get_option' ) ) {
        function get_option( string $option, $default_value = false ) { return $default_value; }
    }
    if ( ! function_exists( 'update_option' ) ) {
        function update_option( string $option, $value, $autoload = null ): bool { return true; }
    }
    if ( ! function_exists( 'delete_option' ) ) {
        function delete_option( string $option ): bool { return true; }
    }
    if ( ! function_exists( 'wp_json_encode' ) ) {
        function wp_json_encode( $data, int $options = 0, int $depth = 512 ) { return json_encode( $data, $options, $depth ); }
    }
    if ( ! function_exists( 'wp_send_json_success' ) ) {
        function wp_send_json_success( $data = null, ?int $status_code = null, int $options = 0 ): void {}
    }
    if ( ! function_exists( 'wp_send_json_error' ) ) {
        function wp_send_json_error( $data = null, ?int $status_code = null, int $options = 0 ): void {}
    }
    if ( ! function_exists( 'esc_url_raw' ) ) {
        function esc_url_raw( string $url, array $protocols = [] ): string { return $url; }
    }
    if ( ! function_exists( 'esc_url' ) ) {
        function esc_url( string $url, array $protocols = [], string $_context = 'display' ): string { return $url; }
    }
    if ( ! function_exists( 'rest_url' ) ) {
        function rest_url( string $path = '', string $scheme = 'rest' ): string { return 'https://example.com/wp-json/' . ltrim( $path, '/' ); }
    }
    if ( ! function_exists( 'site_url' ) ) {
        function site_url( string $path = '', ?string $scheme = null ): string { return 'https://example.com/' . ltrim( $path, '/' ); }
    }
    if ( ! function_exists( 'home_url' ) ) {
        function home_url( string $path = '', ?string $scheme = null ): string { return 'https://example.com/' . ltrim( $path, '/' ); }
    }
    if ( ! function_exists( 'admin_url' ) ) {
        function admin_url( string $path = '', string $scheme = 'admin' ): string { return 'https://example.com/wp-admin/' . ltrim( $path, '/' ); }
    }
    if ( ! function_exists( 'add_menu_page' ) ) {
        function add_menu_page( string $page_title, string $menu_title, string $capability, string $menu_slug, ?callable $callback = null, string $icon_url = '', ?int $position = null ): string { return ''; }
    }
    if ( ! function_exists( 'add_submenu_page' ) ) {
        function add_submenu_page( string $parent_slug, string $page_title, string $menu_title, string $capability, string $menu_slug, ?callable $callback = null, ?int $position = null ) { return ''; }
    }
    if ( ! function_exists( '__' ) ) {
        function __( string $text, string $domain = 'default' ): string { return $text; }
    }
    if ( ! function_exists( '_e' ) ) {
        function _e( string $text, string $domain = 'default' ): void { echo $text; }
    }
    if ( ! function_exists( 'esc_html__' ) ) {
        function esc_html__( string $text, string $domain = 'default' ): string { return $text; }
    }
    if ( ! function_exists( 'esc_html_e' ) ) {
        function esc_html_e( string $text, string $domain = 'default' ): void { echo $text; }
    }
    if ( ! function_exists( 'esc_attr__' ) ) {
        function esc_attr__( string $text, string $domain = 'default' ): string { return $text; }
    }
    if ( ! function_exists( 'esc_attr_e' ) ) {
        function esc_attr_e( string $text, string $domain = 'default' ): void { echo $text; }
    }
    if ( ! function_exists( 'esc_attr' ) ) {
        function esc_attr( string $text ): string { return $text; }
    }
    if ( ! function_exists( 'esc_html' ) ) {
        function esc_html( string $text ): string { return $text; }
    }
    if ( ! function_exists( 'esc_js' ) ) {
        function esc_js( string $text ): string { return $text; }
    }
    if ( ! function_exists( 'register_setting' ) ) {
        function register_setting( string $option_group, string $option_name, array $args = [] ): void {}
    }
    if ( ! function_exists( 'wp_generate_password' ) ) {
        function wp_generate_password( int $length = 12, bool $special_chars = true, bool $extra_special_chars = false ): string { return substr( md5( (string) mt_rand() ), 0, $length ); }
    }
    if ( ! function_exists( 'wp_create_nonce' ) ) {
        function wp_create_nonce( $action = -1 ): string { return 'nonce_' . substr( md5( (string) $action ), 0, 10 ); }
    }
    if ( ! function_exists( 'wp_verify_nonce' ) ) {
        function wp_verify_nonce( string $nonce, $action = -1 ) { return 1; }
    }
    if ( ! function_exists( 'plugin_dir_path' ) ) {
        function plugin_dir_path( string $file ): string { return dirname( $file ) . '/'; }
    }
    if ( ! function_exists( 'plugin_dir_url' ) ) {
        function plugin_dir_url( string $file ): string { return 'https://example.com/wp-content/plugins/' . basename( dirname( $file ) ) . '/'; }
    }
    if ( ! function_exists( 'plugins_url' ) ) {
        function plugins_url( string $path = '', string $plugin = '' ): string { return 'https://example.com/wp-content/plugins/' . ltrim( $path, '/' ); }
    }
    if ( ! function_exists( 'register_activation_hook' ) ) {
        function register_activation_hook( string $file, callable $callback ): void {}
    }
    if ( ! function_exists( 'register_deactivation_hook' ) ) {
        function register_deactivation_hook( string $file, callable $callback ): void {}
    }
    if ( ! function_exists( 'wp_enqueue_script' ) ) {
        function wp_enqueue_script( string $handle, string $src = '', array $deps = [], $ver = false, $in_footer = false ): void {}
    }
    if ( ! function_exists( 'wp_enqueue_style' ) ) {
        function wp_enqueue_style( string $handle, string $src = '', array $deps = [], $ver = false, string $media = 'all' ): void {}
    }
    if ( ! function_exists( 'wp_localize_script' ) ) {
        function wp_localize_script( string $handle, string $object_name, array $l10n ): bool { return true; }
    }
    if ( ! function_exists( 'current_user_can' ) ) {
        function current_user_can( string $capability, ...$args ): bool { return true; }
    }
    if ( ! function_exists( 'get_post_meta' ) ) {
        function get_post_meta( int $post_id, string $key = '', bool $single = false ) { return $single ? '' : []; }
    }
    if ( ! function_exists( 'update_post_meta' ) ) {
        function update_post_meta( int $post_id, string $meta_key, $meta_value, $prev_value = '' ) { return true; }
    }
    if ( ! function_exists( 'delete_post_meta' ) ) {
        function delete_post_meta( int $post_id, string $meta_key, $meta_value = '' ): bool { return true; }
    }
    if ( ! function_exists( 'get_post' ) ) {
        function get_post( $post = null, string $output = 'OBJECT', string $filter = 'raw' ) { return new \WP_Post(); }
    }
    if ( ! function_exists( 'wp_insert_post' ) ) {
        function wp_insert_post( array $postarr, bool $wp_error = false, bool $fire_after_hooks = true ) { return 1; }
    }
    if ( ! function_exists( 'wp_update_post' ) ) {
        function wp_update_post( array $postarr = [], bool $wp_error = false, bool $fire_after_hooks = true ) { return 1; }
    }
    if ( ! function_exists( 'wp_delete_post' ) ) {
        function wp_delete_post( int $postid = 0, bool $force_delete = false ) { return new \WP_Post(); }
    }
    if ( ! function_exists( 'get_posts' ) ) {
        function get_posts( array $args = null ): array { return []; }
    }
    if ( ! function_exists( 'is_wp_error' ) ) {
        function is_wp_error( $thing ): bool { return $thing instanceof \WP_Error; }
    }

    // WordPress Classes
    if ( ! class_exists( 'WP_REST_Request' ) ) {
        class WP_REST_Request {
            public function get_param( string $key ) { return null; }
            public function get_params(): array { return []; }
            public function get_json_params(): array { return []; }
            public function get_header( string $header ): ?string { return null; }
            public function get_method(): string { return 'GET'; }
            public function set_param( string $key, $value ): void {}
        }
    }

    if ( ! class_exists( 'WP_REST_Response' ) ) {
        class WP_REST_Response {
            public function __construct( $data = null, int $status = 200, array $headers = [] ) {}
            public function get_data() { return null; }
            public function set_data( $data ): void {}
            public function get_status(): int { return 200; }
            public function set_status( int $status ): void {}
        }
    }

    if ( ! class_exists( 'WP_Error' ) ) {
        class WP_Error {
            public function __construct( $code = '', string $message = '', $data = '' ) {}
            public function get_error_message( $code = '' ): string { return ''; }
            public function get_error_code() { return ''; }
            public function get_error_data( $code = '' ) { return null; }
        }
    }

    if ( ! class_exists( 'WP_Post' ) ) {
        class WP_Post {
            public int $ID = 0;
            public string $post_author = '0';
            public string $post_date = '';
            public string $post_title = '';
            public string $post_content = '';
            public string $post_status = 'publish';
            public string $post_type = 'post';
        }
    }

    if ( ! class_exists( 'wpdb' ) ) {
        class wpdb {
            public string $prefix = 'wp_';
            public string $posts = 'wp_posts';
            public string $postmeta = 'wp_postmeta';
            public string $options = 'wp_options';
            public function query( string $query ) { return 1; }
            public function get_results( ?string $query = null, string $output = 'OBJECT' ): array { return []; }
            public function get_row( ?string $query = null, string $output = 'OBJECT', int $y = 0 ) { return null; }
            public function get_var( ?string $query = null, int $x = 0, int $y = 0 ) { return null; }
            public function prepare( string $query, ...$args ): string { return $query; }
            public function insert( string $table, array $data, $format = null ) { return 1; }
            public function update( string $table, array $data, array $where, $format = null, $where_format = null ) { return 1; }
            public function delete( string $table, array $where, $where_format = null ) { return 1; }
        }
    }

    global $wpdb;
    if ( ! isset( $wpdb ) ) {
        $wpdb = new \wpdb();
    }
}

namespace Elementor {
    if ( ! class_exists( 'Elementor\\Plugin' ) ) {
        class Plugin {
            public static $instance = null;
            public static function instance(): self {
                if ( null === self::$instance ) {
                    self::$instance = new self();
                }
                return self::$instance;
            }
            public $documents;
            public $kits_manager;
            public $elements_manager;
            public $widgets_manager;
        }
    }
}

namespace WooCommerce {
    if ( ! class_exists( 'WooCommerce' ) ) {
        class WooCommerce {
            public static $instance = null;
            public static function instance(): self {
                if ( null === self::$instance ) {
                    self::$instance = new self();
                }
                return self::$instance;
            }
            public string $version = '9.3.0';
        }
    }
}
