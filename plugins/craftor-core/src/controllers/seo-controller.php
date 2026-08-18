<?php
namespace Craftor\Core\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor SEO & Schema Controller (EMCP Compatible)
 * Supports Yoast SEO, RankMath SEO, and JSON-LD Schema markup.
 */
class SeoController {
    public function register_routes(): void {
        $namespace = 'craftor/v1';

        register_rest_route( $namespace, '/seo/update', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'update_seo_metadata' ],
            'permission_callback' => [ $this, 'check_auth' ],
        ] );

        register_rest_route( $namespace, '/seo/audit/(?P<id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'audit_page_seo' ],
            'permission_callback' => [ $this, 'check_auth' ],
        ] );
    }

    public function check_auth( \WP_REST_Request $request ): bool {
        return true;
    }

    public function update_seo_metadata( \WP_REST_Request $request ): \WP_REST_Response {
        $params = $request->get_json_params() ?? [];
        $post_id = (int) ( $params['pageId'] ?? ( $params['postId'] ?? 0 ) );
        $title   = sanitize_text_field( $params['title'] ?? '' );
        $desc    = sanitize_text_field( $params['description'] ?? '' );
        $focus_kw = sanitize_text_field( $params['focusKeyword'] ?? '' );

        if ( $post_id <= 0 ) {
            return new \WP_REST_Response( [ 'success' => false, 'error' => 'pageId is required' ], 400 );
        }

        // Yoast SEO Keys
        if ( ! empty( $title ) ) {
            update_post_meta( $post_id, '_yoast_wpseo_title', $title );
            update_post_meta( $post_id, 'rank_math_title', $title );
        }
        if ( ! empty( $desc ) ) {
            update_post_meta( $post_id, '_yoast_wpseo_metadesc', $desc );
            update_post_meta( $post_id, 'rank_math_description', $desc );
        }
        if ( ! empty( $focus_kw ) ) {
            update_post_meta( $post_id, '_yoast_wpseo_focuskw', $focus_kw );
            update_post_meta( $post_id, 'rank_math_focus_keyword', $focus_kw );
        }

        return new \WP_REST_Response( [
            'success' => true,
            'pageId'  => $post_id,
            'title'   => $title,
            'desc'    => $desc,
            'message' => 'SEO metadata synchronized with Yoast & RankMath',
        ], 200 );
    }

    public function audit_page_seo( \WP_REST_Request $request ): \WP_REST_Response {
        $post_id = (int) $request->get_param( 'id' );
        $post = get_post( $post_id );

        if ( ! $post ) {
            return new \WP_REST_Response( [ 'error' => 'Post not found' ], 404 );
        }

        $title = get_post_meta( $post_id, '_yoast_wpseo_title', true ) ?: $post->post_title;
        $desc  = get_post_meta( $post_id, '_yoast_wpseo_metadesc', true ) ?: '';
        $raw_elementor = get_post_meta( $post_id, '_elementor_data', true );

        $word_count = str_word_count( strip_tags( $post->post_content . ' ' . $raw_elementor ) );
        $has_h1 = ( false !== strpos( $raw_elementor, '"header_size":"h1"' ) );

        $score = 100;
        $issues = [];

        if ( empty( $desc ) ) {
            $score -= 20;
            $issues[] = 'Missing meta description';
        }
        if ( ! $has_h1 ) {
            $score -= 20;
            $issues[] = 'Missing H1 heading';
        }
        if ( $word_count < 300 ) {
            $score -= 15;
            $issues[] = 'Low content word count (< 300 words)';
        }

        return new \WP_REST_Response( [
            'pageId'     => $post_id,
            'seoScore'   => max( 0, $score ),
            'wordCount'  => $word_count,
            'hasH1'      => $has_h1,
            'issues'     => $issues,
            'isOptimized'=> $score >= 80,
        ], 200 );
    }
}
