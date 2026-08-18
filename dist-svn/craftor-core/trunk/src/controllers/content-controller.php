use Craftor\Core\Auth\CraftorAuth;
use Craftor\Core\Auth\CraftorSsrfValidator;
use Craftor\Core\Auth\CraftorApproval;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Content & Media Controller (EMCP Compatible)
 * Handles automated media sideloading from public URLs, post/page management, and taxonomies.
 */
class ContentController {
    public function register_routes(): void {
        $namespace = 'craftor/v1';

        // 1. Media Upload from URL
        register_rest_route( $namespace, '/content/media-upload', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'upload_media_from_url' ],
            'permission_callback' => [ $this, 'check_auth' ],
        ] );

        // 2. Posts & Pages Management
        register_rest_route( $namespace, '/content/posts', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_posts' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'create_post' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
        ] );

        register_rest_route( $namespace, '/content/posts/(?P<id>\d+)', [
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'delete_post' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
        ] );

        // 3. Taxonomies & Categories
        register_rest_route( $namespace, '/content/terms', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_terms' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'create_term' ],
                'permission_callback' => [ $this, 'check_auth' ],
            ],
        ] );
    }

    public function check_auth( \WP_REST_Request $request ): bool {
        $params = $request->get_json_params() ?? [];
        $post_id = isset( $params['postId'] ) ? (int) $params['postId'] : ( isset( $params['pageId'] ) ? (int) $params['pageId'] : (int) $request->get_param( 'id' ) );
        $required_cap = $request->get_method() === 'GET' ? 'read' : 'edit_posts';
        $object_cap = $request->get_method() === 'DELETE' ? 'delete_post' : ( $request->get_method() === 'GET' ? 'read_post' : 'edit_post' );
        return CraftorAuth::verify_request( $request, $required_cap, $post_id > 0 ? $post_id : null, $object_cap );
    }

    /**
     * Sideloads an image from an external URL into WordPress Media Library.
     */
    public function upload_media_from_url( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        $image_url = sanitize_text_field( $params['imageUrl'] ?? ( $params['image_url'] ?? '' ) );
        $alt_text  = sanitize_text_field( $params['altText'] ?? ( $params['alt_text'] ?? 'Craftor AI Asset' ) );
        $post_id   = isset( $params['postId'] ) ? (int) $params['postId'] : 0;

        if ( empty( $image_url ) || ! filter_var( $image_url, FILTER_VALIDATE_URL ) ) {
            return new \WP_REST_Response( [
                'success' => false,
                'error'   => 'Valid imageUrl parameter is required',
            ], 400 );
        }

        // Comprehensive Defense-in-Depth SSRF Validation (IP normalization, DNS rebinding, and metadata protection)
        $ssrf_result = CraftorSsrfValidator::validate_url( $image_url );
        if ( ! $ssrf_result['safe'] ) {
            return new \WP_REST_Response( [
                'success' => false,
                'error'   => $ssrf_result['error'],
            ], 403 );
        }

        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        // Download and attach to media library
        $attachment_id = media_sideload_image( $image_url, $post_id, $alt_text, 'id' );

        if ( is_wp_error( $attachment_id ) ) {
            return new \WP_REST_Response( [
                'success' => false,
                'error'   => $attachment_id->get_error_message(),
            ], 500 );
        }

        $media_url = wp_get_attachment_url( $attachment_id );
        update_post_meta( $attachment_id, '_wp_attachment_image_alt', $alt_text );

        return new \WP_REST_Response( [
            'success'      => true,
            'attachmentId' => $attachment_id,
            'url'          => $media_url,
            'altText'      => $alt_text,
            'message'      => 'Image downloaded and attached to WordPress media library successfully',
        ], 201 );
    }

    public function get_posts( \WP_REST_Request $request ): \WP_REST_Response {
        $post_type = sanitize_text_field( $request->get_param( 'postType' ) ?: 'page' );
        $per_page  = (int) ( $request->get_param( 'perPage' ) ?: 20 );

        $posts = get_posts( [
            'post_type'      => $post_type,
            'posts_per_page' => $per_page,
            'post_status'    => 'any',
        ] );

        $data = array_map( function( $p ) {
            return [
                'id'        => $p->ID,
                'title'     => $p->post_title,
                'slug'      => $p->post_name,
                'status'    => $p->post_status,
                'postType'  => $p->post_type,
                'link'      => get_permalink( $p->ID ),
                'isElementor' => 'builder' === get_post_meta( $p->ID, '_elementor_edit_mode', true ),
            ];
        }, $posts );

        return new \WP_REST_Response( $data, 200 );
    }

    public function create_post( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        $title = sanitize_text_field( $params['title'] ?? 'New Page' );
        $type  = sanitize_text_field( $params['postType'] ?? 'page' );
        $slug  = sanitize_title( $params['slug'] ?? $title );

        $post_id = wp_insert_post( [
            'post_title'  => $title,
            'post_name'   => $slug,
            'post_type'   => $type,
            'post_status' => 'publish',
        ] );

        if ( is_wp_error( $post_id ) ) {
            return new \WP_REST_Response( [
                'success' => false,
                'error'   => $post_id->get_error_message(),
            ], 500 );
        }

        return new \WP_REST_Response( [
            'success'  => true,
            'postId'   => $post_id,
            'title'    => $title,
            'slug'     => $slug,
            'link'     => get_permalink( $post_id ),
        ], 201 );
    }

    public function get_terms( \WP_REST_Request $request ): \WP_REST_Response {
        $taxonomy = sanitize_text_field( $request->get_param( 'taxonomy' ) ?: 'category' );
        $terms = get_terms( [ 'taxonomy' => $taxonomy, 'hide_empty' => false ] );
        return new \WP_REST_Response( is_wp_error( $terms ) ? [] : $terms, 200 );
    }

    public function create_term( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        $name = sanitize_text_field( $params['name'] ?? '' );
        $taxonomy = sanitize_text_field( $params['taxonomy'] ?? 'category' );

        $res = wp_insert_term( $name, $taxonomy );
        if ( is_wp_error( $res ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'error' => $res->get_error_message() ], 400 );
        }

        return new \WP_REST_Response( [ 'success' => true, 'termId' => $res['term_id'] ], 201 );
    }

    public function delete_post( \WP_REST_Request $request ): \WP_REST_Response {
        $id = (int) $request->get_param( 'id' );

        // Machine token callers must supply an approved human authorization
        if ( ! is_user_logged_in() ) {
            $approval_id = $request->get_header( 'X-Craftor-Approval-Id' ) ?: $request->get_param( 'approvalId' );
            $verification = CraftorApproval::verify_and_consume( (string) $approval_id, 'delete_post', $id, $request->get_json_params() ?? [] );
            if ( ! $verification['authorized'] ) {
                if ( empty( $approval_id ) || ! CraftorApproval::get_approval( $approval_id ) ) {
                    $req = CraftorApproval::create_approval( 'delete_post', $id, $request->get_json_params() ?? [] );
                    return new \WP_REST_Response( $req, 403 );
                }
                return new \WP_REST_Response( [ 'error' => $verification['error'], 'requiresHumanApproval' => true ], 403 );
            }
        }

        $res = wp_delete_post( $id, true );
        return new \WP_REST_Response( [ 'id' => $id, 'deleted' => ! empty( $res ) ], 200 );
    }
}
