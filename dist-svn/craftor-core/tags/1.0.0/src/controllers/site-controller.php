<?php
namespace Craftor\Core\Controllers;

use Craftor\Core\Auth\CraftorAuth;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Site Operations Controller (EMCP Compatible)
 * Manages front page assignment, navigation menus, plugins, themes, and WordPress options.
 */
class SiteController {
    public function register_routes(): void {
        $namespace = 'craftor/v1';

        // 1. Set Front Page (Homepage)
        register_rest_route( $namespace, '/site/set-front-page', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'set_front_page' ],
            'permission_callback' => [ $this, 'check_auth' ],
        ] );

        // 2. Navigation Menus
        register_rest_route( $namespace, '/site/menus', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_menus' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'create_menu' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
        ] );

        register_rest_route( $namespace, '/site/menus/add-item', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'add_menu_item' ],
            'permission_callback' => [ $this, 'check_auth' ],
        ] );

        // 3. Plugins & Themes
        register_rest_route( $namespace, '/site/plugins', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_plugins' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'manage_plugin' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
        ] );

        // 4. Site Settings & Options
        register_rest_route( $namespace, '/site/options', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_options' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'update_options' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
        ] );
    }

    public function check_auth( \WP_REST_Request $request ): bool {
        $path = $request->get_route();
        $method = $request->get_method();

        if ( strpos( $path, '/plugins' ) !== false ) {
            $required_cap = 'activate_plugins';
        } elseif ( $method === 'GET' && ( strpos( $path, '/menus' ) !== false || strpos( $path, '/options' ) !== false ) ) {
            $required_cap = 'edit_theme_options';
        } else {
            $required_cap = 'manage_options';
        }

        return CraftorAuth::verify_request( $request, $required_cap );
    }

    /**
     * Sets any page as the official WordPress Homepage / Front Page.
     */
    public function set_front_page( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        $page_id = isset( $params['pageId'] ) ? (int) $params['pageId'] : ( isset( $params['page_id'] ) ? (int) $params['page_id'] : 0 );

        if ( $page_id <= 0 || ! get_post( $page_id ) ) {
            return new \WP_REST_Response( [
                'success' => false,
                'error'   => 'Valid existing pageId is required',
            ], 400 );
        }

        update_option( 'show_on_front', 'page' );
        update_option( 'page_on_front', $page_id );

        return new \WP_REST_Response( [
            'success'   => true,
            'frontPage' => $page_id,
            'siteUrl'   => home_url( '/' ),
            'message'   => "Page ID {$page_id} is now the active homepage of {$home_url}",
        ], 200 );
    }

    /**
     * Retrieves all registered navigation menus.
     */
    public function get_menus(): \WP_REST_Response {
        $menus = wp_get_nav_menus();
        $data = array_map( function( $m ) {
            return [
                'termId' => $m->term_id,
                'name'   => $m->name,
                'slug'   => $m->slug,
                'count'  => $m->count,
            ];
        }, $menus );

        return new \WP_REST_Response( $data, 200 );
    }

    /**
     * Creates a new navigation menu and assigns it to primary header location.
     */
    public function create_menu( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        $menu_name = sanitize_text_field( $params['name'] ?? 'Primary Navigation' );
        $location  = sanitize_text_field( $params['location'] ?? 'primary' );

        $menu_id = wp_create_nav_menu( $menu_name );
        if ( is_wp_error( $menu_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'error' => $menu_id->get_error_message() ], 400 );
        }

        if ( ! empty( $location ) ) {
            $locations = get_theme_mod( 'nav_menu_locations', [] );
            $locations[ $location ] = $menu_id;
            set_theme_mod( 'nav_menu_locations', $locations );
        }

        return new \WP_REST_Response( [
            'success'  => true,
            'menuId'   => $menu_id,
            'name'     => $menu_name,
            'location' => $location,
        ], 201 );
    }

    /**
     * Adds a page or custom link to a navigation menu.
     */
    public function add_menu_item( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        $menu_id = (int) ( $params['menuId'] ?? 0 );
        $title   = sanitize_text_field( $params['title'] ?? 'Link' );
        $url     = sanitize_text_field( $params['url'] ?? '#' );
        $page_id = isset( $params['pageId'] ) ? (int) $params['pageId'] : 0;

        if ( $menu_id <= 0 ) {
            return new \WP_REST_Response( [ 'success' => false, 'error' => 'menuId is required' ], 400 );
        }

        $item_data = [
            'menu-item-title'   => $title,
            'menu-item-status'  => 'publish',
            'menu-item-type'    => $page_id > 0 ? 'post_type' : 'custom',
            'menu-item-object'  => $page_id > 0 ? 'page' : 'custom',
            'menu-item-object-id' => $page_id,
            'menu-item-url'     => $page_id > 0 ? get_permalink( $page_id ) : $url,
        ];

        $item_id = wp_update_nav_menu_item( $menu_id, 0, $item_data );
        if ( is_wp_error( $item_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'error' => $item_id->get_error_message() ], 500 );
        }

        return new \WP_REST_Response( [
            'success' => true,
            'itemId'  => $item_id,
            'title'   => $title,
            'menuId'  => $menu_id,
        ], 201 );
    }

    /**
     * Lists active and installed plugins.
     */
    public function get_plugins(): \WP_REST_Response {
        if ( ! function_exists( 'get_plugins' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins = get_plugins();
        $active_plugins = get_option( 'active_plugins', [] );

        $data = [];
        foreach ( $all_plugins as $file => $info ) {
            $data[] = [
                'file'        => $file,
                'name'        => $info['Name'],
                'version'     => $info['Version'],
                'isActive'    => in_array( $file, $active_plugins, true ),
                'description' => $info['Description'],
            ];
        }

        return new \WP_REST_Response( $data, 200 );
    }

    public function manage_plugin( \WP_REST_Request $request ): \WP_REST_Response {
        if ( ! function_exists( 'activate_plugin' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $params = $request->get_json_params() ?? [];
        $plugin_file = sanitize_text_field( $params['pluginFile'] ?? '' );
        $action      = sanitize_text_field( $params['action'] ?? 'activate' );

        if ( 'activate' === $action ) {
            $res = activate_plugin( $plugin_file );
            return new \WP_REST_Response( [ 'success' => ! is_wp_error( $res ) ], is_wp_error( $res ) ? 400 : 200 );
        } elseif ( 'deactivate' === $action ) {
            $protected_slugs = [
                'craftor-core',
                'craftor-pro',
                'craftor-enterprise',
                'wordfence',
                'sucuri-scanner',
                'better-wp-security',
                'all-in-one-wp-security-and-firewall',
            ];

            foreach ( $protected_slugs as $slug ) {
                if ( stripos( $plugin_file, $slug ) !== false ) {
                    return new \WP_REST_Response( [
                        'success' => false,
                        'error'   => sprintf( 'Deactivating protected core/security plugin "%s" via REST API is blocked for site safety', $plugin_file ),
                    ], 403 );
                }
            }

            deactivate_plugins( $plugin_file );
            return new \WP_REST_Response( [ 'success' => true ], 200 );
        }

        return new \WP_REST_Response( [ 'error' => 'Invalid action' ], 400 );
    }

    public function get_options(): \WP_REST_Response {
        return new \WP_REST_Response( [
            'blogname'        => get_option( 'blogname' ),
            'blogdescription' => get_option( 'blogdescription' ),
            'siteurl'         => site_url(),
            'home'            => home_url(),
            'show_on_front'   => get_option( 'show_on_front' ),
            'page_on_front'   => get_option( 'page_on_front' ),
        ], 200 );
    }

    public function update_options( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        foreach ( $params as $key => $val ) {
            if ( in_array( $key, [ 'blogname', 'blogdescription', 'show_on_front', 'page_on_front' ], true ) ) {
                update_option( $key, sanitize_text_field( (string) $val ) );
            }
        }
        return new \WP_REST_Response( [ 'success' => true ], 200 );
    }
}
