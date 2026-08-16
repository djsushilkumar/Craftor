# Example: Snapshot & Rollback PHP Implementation

```php
namespace Craftor\Snapshot;

class SnapshotManager {
    /**
     * Captures a snapshot of a post's content and metadata before mutation.
     *
     * @param int $post_id
     * @param string $action_context
     * @return string Snapshot UUID
     */
    public static function capture( int $post_id, string $action_context = 'ai_mutation' ): string {
        global $wpdb;
        $table_name = $wpdb->prefix . 'craftor_snapshots';
        $uuid = wp_generate_uuid4();

        $post_record = get_post( $post_id, ARRAY_A );
        $meta_record = get_post_meta( $post_id );

        $payload = [
            'post' => $post_record,
            'meta' => $meta_record,
            'elementor_data' => get_post_meta( $post_id, '_elementor_data', true ),
        ];

        $wpdb->insert(
            $table_name,
            [
                'uuid'           => $uuid,
                'post_id'        => $post_id,
                'action_context' => sanitize_text_field( $action_context ),
                'payload'        => wp_json_encode( $payload ),
                'created_at'     => current_time( 'mysql', 1 ),
            ],
            [ '%s', '%d', '%s', '%s', '%s' ]
        );

        return $uuid;
    }
}
```
