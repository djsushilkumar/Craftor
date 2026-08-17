<?php
namespace Craftor\Core\Snapshots;

use Craftor\Core\Database\TransactionManager;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Rollback Manager (PHP Plugin Layer)
 * Restores pre-mutation states for posts, post meta, options, Elementor AST, and WooCommerce products.
 */
class RollbackManager {
    private SnapshotManager $snapshots;
    private const HISTORY_KEY = '_craftor_rollback_history';

    public function __construct( ?SnapshotManager $snapshots = null ) {
        $this->snapshots = $snapshots ?? new SnapshotManager();
    }

    /**
     * Restores a snapshot and restores state to the database.
     */
    public function restore_snapshot( string $snapshot_id ): array {
        $snapshot = $this->snapshots->get_snapshot( $snapshot_id );
        if ( ! $snapshot ) {
            return [
                'success' => false,
                'error'   => "Snapshot not found: {$snapshot_id}",
                'code'    => -32005,
            ];
        }

        // Verify SHA-256 integrity
        $verification = $this->snapshots->verify_snapshot( $snapshot_id );
        if ( ! $verification['valid'] ) {
            return [
                'success' => false,
                'error'   => "Cryptographic verification failed for snapshot: {$snapshot_id}",
                'code'    => -32004,
            ];
        }

        $target_id   = $snapshot['target_id'];
        $target_type = $snapshot['target_type'];
        $payload     = json_decode( $snapshot['data_payload'], true );

        try {
            TransactionManager::execute_transactionally( function() use ( $target_id, $target_type, $payload ) {
                switch ( $target_type ) {
                    case 'woocommerce_product':
                    case 'post':
                        if ( is_array( $payload ) && isset( $payload['id'] ) ) {
                            wp_update_post( [
                                'ID'           => (int) $target_id,
                                'post_title'   => $payload['name'] ?? $payload['title']['rendered'] ?? $payload['post_title'] ?? '',
                                'post_content' => $payload['description'] ?? $payload['content']['rendered'] ?? $payload['post_content'] ?? '',
                                'post_status'  => $payload['status'] ?? 'publish',
                            ] );

                            if ( isset( $payload['regular_price'] ) && function_exists( 'update_post_meta' ) ) {
                                update_post_meta( (int) $target_id, '_regular_price', $payload['regular_price'] );
                                update_post_meta( (int) $target_id, '_price', $payload['sale_price'] ?? $payload['regular_price'] );
                            }
                            if ( isset( $payload['sku'] ) ) {
                                update_post_meta( (int) $target_id, '_sku', $payload['sku'] );
                            }
                        }
                        break;

                    case 'elementor_data':
                        if ( is_array( $payload ) ) {
                            update_post_meta( (int) $target_id, '_elementor_data', wp_json_encode( $payload ) );
                            delete_post_meta( (int) $target_id, '_elementor_css' );
                        }
                        break;

                    case 'option':
                        if ( is_string( $target_id ) ) {
                            update_option( $target_id, $payload );
                        }
                        break;

                    default:
                        // Custom handler or generic postmeta update
                        break;
                }
            } );

            $restored_at = gmdate( 'Y-m-d\TH:i:s\Z' );
            $result = [
                'success'        => true,
                'snapshot_id'    => $snapshot_id,
                'target_id'      => $target_id,
                'target_type'    => $target_type,
                'restored_at'    => $restored_at,
                'action_context' => $snapshot['action_context'] ?? '',
            ];

            $this->record_history( [
                'rollback_id'   => 'crf_rbk_' . wp_generate_uuid4(),
                'snapshot_id'   => $snapshot_id,
                'target_id'     => $target_id,
                'target_type'   => $target_type,
                'reason'        => 'Restored from snapshot',
                'triggered_by'  => $snapshot['created_by_token'] ?? 'system',
                'timestamp'     => $restored_at,
                'success'       => true,
            ] );

            return $result;
        } catch ( \Throwable $e ) {
            return [
                'success' => false,
                'error'   => "Database rollback failed: " . $e->getMessage(),
                'code'    => -32004,
            ];
        }
    }

    /**
     * Executes an operation inside a snapshot guard with automatic rollback on failure.
     */
    public function execute_guarded( callable $mutation, $target_id, string $target_type, string $token = '' ): array {
        // 1. Capture current state
        $current_state = null;
        if ( $target_type === 'woocommerce_product' && function_exists( 'wc_get_product' ) ) {
            $product = wc_get_product( $target_id );
            $current_state = $product ? $product->get_data() : [];
        } elseif ( $target_type === 'elementor_data' ) {
            $current_state = get_post_meta( $target_id, '_elementor_data', true );
        } elseif ( $target_type === 'post' ) {
            $post = get_post( $target_id );
            $current_state = $post ? (array) $post : [];
        }

        $snapshot = $this->snapshots->capture_snapshot( $target_id, $target_type, $current_state, $token, 'guarded_mutation' );

        try {
            $result = call_user_func( $mutation );
            return [
                'success'  => true,
                'result'   => $result,
                'snapshot' => $snapshot,
            ];
        } catch ( \Throwable $e ) {
            $this->restore_snapshot( $snapshot['snapshot_id'] );
            return [
                'success'        => false,
                'error'          => $e->getMessage(),
                'code'           => -32004,
                'rolled_back_to' => $snapshot['snapshot_id'],
            ];
        }
    }

    private function record_history( array $entry ): void {
        $history = get_option( self::HISTORY_KEY, [] );
        if ( ! is_array( $history ) ) {
            $history = [];
        }
        array_unshift( $history, $entry );
        if ( count( $history ) > 100 ) {
            $history = array_slice( $history, 0, 100 );
        }
        update_option( self::HISTORY_KEY, $history, false );
    }

    public function get_history(): array {
        $history = get_option( self::HISTORY_KEY, [] );
        return is_array( $history ) ? $history : [];
    }
}
