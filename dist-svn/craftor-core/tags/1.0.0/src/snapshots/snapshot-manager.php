<?php
namespace Craftor\Core\Snapshots;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Snapshot Manager (PHP Plugin Layer)
 * Captures pre-mutation state snapshots, computes SHA-256 hashes,
 * and maintains immutable snapshot records for atomic recovery.
 * Supports both dedicated wp_craftor_snapshots table and options fallback.
 */
class SnapshotManager {
    private const OPTION_KEY_PREFIX = '_craftor_snapshot_';
    private const INDEX_KEY = '_craftor_snapshot_index';

    /**
     * Checks if the dedicated wp_craftor_snapshots table exists in the database.
     */
    private function has_snapshots_table(): bool {
        global $wpdb;
        if ( ! isset( $wpdb ) || ! is_object( $wpdb ) ) {
            return false;
        }
        $table_name = $wpdb->prefix . 'craftor_snapshots';
        $found = $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) );
        return $found === $table_name;
    }

    /**
     * Captures a new snapshot before a mutation.
     *
     * @param int|string $target_id
     * @param string $target_type
     * @param mixed $data_payload
     * @param string $created_by_token
     * @param string $action_context
     * @return array
     */
    public function capture_snapshot(
        $target_id,
        string $target_type,
        $data_payload,
        string $created_by_token = '',
        string $action_context = ''
    ): array {
        global $wpdb;

        $snapshot_id = 'crf_snp_' . wp_generate_uuid4();
        $payload_json = is_string( $data_payload ) ? $data_payload : wp_json_encode( $data_payload );
        $pre_state_hash = hash( 'sha256', $payload_json );
        $created_at = gmdate( 'Y-m-d\TH:i:s\Z' );

        $snapshot = [
            'snapshot_id'      => $snapshot_id,
            'target_id'        => $target_id,
            'target_type'      => $target_type,
            'pre_state_hash'   => $pre_state_hash,
            'data_payload'     => $payload_json,
            'created_at'       => $created_at,
            'created_by_token' => $created_by_token,
            'action_context'   => $action_context,
        ];

        if ( $this->has_snapshots_table() ) {
            $wpdb->insert(
                $wpdb->prefix . 'craftor_snapshots',
                [
                    'uuid'             => $snapshot_id,
                    'post_id'          => is_numeric( $target_id ) ? (int) $target_id : 0,
                    'action_context'   => $action_context ?: $target_type,
                    'payload'          => $payload_json,
                    'payload_checksum' => $pre_state_hash,
                    'created_at'       => gmdate( 'Y-m-d H:i:s' ),
                ],
                [ '%s', '%d', '%s', '%s', '%s', '%s' ]
            );
        }

        // Store in options cache for fast recovery and fallback
        update_option( self::OPTION_KEY_PREFIX . $snapshot_id, $snapshot, false );

        // Maintain index
        $index = get_option( self::INDEX_KEY, [] );
        if ( ! is_array( $index ) ) {
            $index = [];
        }
        $index[] = [
            'snapshot_id' => $snapshot_id,
            'target_id'   => $target_id,
            'target_type' => $target_type,
            'created_at'  => $created_at,
        ];

        // Keep last 200 snapshots in index
        if ( count( $index ) > 200 ) {
            $oldest = array_shift( $index );
            delete_option( self::OPTION_KEY_PREFIX . $oldest['snapshot_id'] );
        }

        update_option( self::INDEX_KEY, $index, false );

        return $snapshot;
    }

    /**
     * Retrieves a snapshot by ID.
     */
    public function get_snapshot( string $snapshot_id ): ?array {
        global $wpdb;

        // Try options cache first
        $snapshot = get_option( self::OPTION_KEY_PREFIX . $snapshot_id, null );
        if ( is_array( $snapshot ) ) {
            return $snapshot;
        }

        // Try querying dedicated database table
        if ( $this->has_snapshots_table() ) {
            $row = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM {$wpdb->prefix}craftor_snapshots WHERE uuid = %s LIMIT 1",
                    $snapshot_id
                ),
                ARRAY_A
            );

            if ( $row ) {
                return [
                    'snapshot_id'      => $row['uuid'],
                    'target_id'        => (int) $row['post_id'],
                    'target_type'      => $row['action_context'],
                    'pre_state_hash'   => $row['payload_checksum'],
                    'data_payload'     => $row['payload'],
                    'created_at'       => $row['created_at'],
                    'created_by_token' => '',
                    'action_context'   => $row['action_context'],
                ];
            }
        }

        return null;
    }

    /**
     * Verifies the cryptographic integrity of a snapshot.
     */
    public function verify_snapshot( string $snapshot_id ): array {
        $snapshot = $this->get_snapshot( $snapshot_id );
        if ( ! $snapshot ) {
            return [
                'valid'         => false,
                'snapshot_id'   => $snapshot_id,
                'expected_hash' => '',
                'computed_hash' => '',
                'matched'       => false,
            ];
        }

        $computed_hash = hash( 'sha256', $snapshot['data_payload'] );
        $matched = hash_equals( $snapshot['pre_state_hash'], $computed_hash );

        return [
            'valid'         => $matched,
            'snapshot_id'   => $snapshot_id,
            'expected_hash' => $snapshot['pre_state_hash'],
            'computed_hash' => $computed_hash,
            'matched'       => $matched,
        ];
    }

    /**
     * Deletes a snapshot by ID.
     */
    public function delete_snapshot( string $snapshot_id ): bool {
        global $wpdb;

        if ( $this->has_snapshots_table() ) {
            $wpdb->delete(
                $wpdb->prefix . 'craftor_snapshots',
                [ 'uuid' => $snapshot_id ],
                [ '%s' ]
            );
        }

        $deleted = delete_option( self::OPTION_KEY_PREFIX . $snapshot_id );

        $index = get_option( self::INDEX_KEY, [] );
        if ( is_array( $index ) ) {
            $index = array_values( array_filter( $index, function( $item ) use ( $snapshot_id ) {
                return ( $item['snapshot_id'] ?? '' ) !== $snapshot_id;
            } ) );
            update_option( self::INDEX_KEY, $index, false );
        }

        return $deleted;
    }

    /**
     * Lists snapshots with optional filtering.
     */
    public function list_snapshots( $target_id = null, string $target_type = '' ): array {
        global $wpdb;

        if ( $this->has_snapshots_table() ) {
            $sql = "SELECT uuid AS snapshot_id, post_id AS target_id, action_context AS target_type, created_at FROM {$wpdb->prefix}craftor_snapshots";
            $where = [];
            $args = [];

            if ( null !== $target_id && is_numeric( $target_id ) ) {
                $where[] = "post_id = %d";
                $args[] = (int) $target_id;
            }
            if ( ! empty( $target_type ) ) {
                $where[] = "action_context = %s";
                $args[] = $target_type;
            }

            if ( ! empty( $where ) ) {
                $sql .= " WHERE " . implode( " AND ", $where );
            }
            $sql .= " ORDER BY id DESC LIMIT 100";

            $rows = ! empty( $args ) ? $wpdb->get_results( $wpdb->prepare( $sql, $args ), ARRAY_A ) : $wpdb->get_results( $sql, ARRAY_A );
            if ( is_array( $rows ) && ! empty( $rows ) ) {
                return $rows;
            }
        }

        $index = get_option( self::INDEX_KEY, [] );
        if ( ! is_array( $index ) ) {
            return [];
        }

        return array_values( array_filter( $index, function( $item ) use ( $target_id, $target_type ) {
            if ( null !== $target_id && (string) $item['target_id'] !== (string) $target_id ) {
                return false;
            }
            if ( ! empty( $target_type ) && $item['target_type'] !== $target_type ) {
                return false;
            }
            return true;
        } ) );
    }
}
