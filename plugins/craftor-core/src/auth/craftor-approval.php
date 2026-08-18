<?php
namespace Craftor\Core\Auth;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Server-Side Human Approval Authority
 * Enforces that destructive WordPress REST operations require an independent human approval.
 */
class CraftorApproval {
    const OPTION_KEY = 'craftor_approval_records';
    const DEFAULT_TTL = 300; // 5 minutes

    /**
     * Determines if a REST endpoint / action is classified as destructive.
     */
    public static function is_destructive_operation( string $action, string $method = 'POST' ): bool {
        $destructive = [
            'delete_post',
            'delete_product',
            'restore_snapshot',
            'delete_snapshot',
            'deactivate_plugin',
        ];
        return in_array( $action, $destructive, true );
    }

    /**
     * Creates a PENDING approval record.
     */
    public static function create_approval( string $action, $target_id, array $args = [] ): array {
        $records = self::get_all_records();
        $approval_id = 'crf_appr_' . bin2hex( wp_generate_password( 16, false, false ) ? random_bytes( 16 ) : wp_generate_password( 16, false ) );
        $now = time();
        $expires_at = $now + self::DEFAULT_TTL;

        // Canonical argument hash
        ksort( $args );
        unset( $args['approvalId'], $args['executionToken'], $args['confirmed'] );
        $arguments_hash = hash( 'sha256', wp_json_encode( $args ) );

        $record = [
            'approvalId'    => $approval_id,
            'action'        => $action,
            'targetId'      => (string) $target_id,
            'argumentsHash' => $arguments_hash,
            'status'        => 'PENDING',
            'requestedAt'   => $now,
            'expiresAt'     => $expires_at,
        ];

        $records[ $approval_id ] = $record;
        self::save_records( $records );

        return [
            'requiresHumanApproval' => true,
            'approvalId'            => $approval_id,
            'status'                => 'PENDING',
            'action'                => $action,
            'targetId'              => $target_id,
            'expiresInSeconds'      => self::DEFAULT_TTL,
            'message'               => sprintf(
                '[HUMAN APPROVAL REQUIRED] Destructive action "%s" on target "%s" requires explicit human authorization in WordPress Admin. Approval ID: "%s".',
                $action,
                $target_id,
                $approval_id
            ),
        ];
    }

    /**
     * Approves an approval record. MUST be called by an authenticated human user session.
     */
    public static function approve_by_human( string $approval_id, int $user_id, string $required_capability = 'manage_options' ): array {
        if ( ! is_user_logged_in() || ! current_user_can( $required_capability ) ) {
            return [ 'success' => false, 'error' => 'Human administrator session with required capability is mandatory to approve destructive operations' ];
        }

        $records = self::get_all_records();
        if ( ! isset( $records[ $approval_id ] ) ) {
            return [ 'success' => false, 'error' => 'Approval record not found' ];
        }

        $record = &$records[ $approval_id ];
        if ( time() > $record['expiresAt'] || $record['status'] === 'EXPIRED' ) {
            $record['status'] = 'EXPIRED';
            self::save_records( $records );
            return [ 'success' => false, 'error' => 'Approval request has expired' ];
        }

        if ( $record['status'] !== 'PENDING' ) {
            return [ 'success' => false, 'error' => sprintf( 'Cannot approve request with status "%s"', $record['status'] ) ];
        }

        $record['status']     = 'APPROVED';
        $record['approvedAt'] = time();
        $record['approvedBy'] = $user_id;
        $record['executionToken'] = 'crf_exec_' . bin2hex( random_bytes( 16 ) );

        self::save_records( $records );
        return [ 'success' => true, 'record' => $record ];
    }

    /**
     * Denies an approval record. MUST be called by an authenticated human user.
     */
    public static function deny_by_human( string $approval_id, int $user_id ): array {
        if ( ! is_user_logged_in() ) {
            return [ 'success' => false, 'error' => 'Human login session required' ];
        }

        $records = self::get_all_records();
        if ( ! isset( $records[ $approval_id ] ) ) {
            return [ 'success' => false, 'error' => 'Approval record not found' ];
        }

        $record = &$records[ $approval_id ];
        if ( $record['status'] !== 'PENDING' ) {
            return [ 'success' => false, 'error' => sprintf( 'Cannot deny request with status "%s"', $record['status'] ) ];
        }

        $record['status']   = 'DENIED';
        $record['deniedAt'] = time();
        $record['deniedBy'] = $user_id;

        self::save_records( $records );
        return [ 'success' => true, 'record' => $record ];
    }

    /**
     * Verifies that the human approval was granted and atomically consumes it.
     */
    public static function verify_and_consume( string $approval_id, string $action, $target_id, array $args = [] ): array {
        if ( empty( $approval_id ) ) {
            return [ 'authorized' => false, 'error' => 'Missing approvalId for destructive action' ];
        }

        $records = self::get_all_records();
        if ( ! isset( $records[ $approval_id ] ) ) {
            return [ 'authorized' => false, 'error' => sprintf( 'Approval record "%s" not found', $approval_id ) ];
        }

        $record = &$records[ $approval_id ];

        // Check expiration
        if ( time() > $record['expiresAt'] && ( $record['status'] === 'PENDING' || $record['status'] === 'APPROVED' ) ) {
            $record['status'] = 'EXPIRED';
            self::save_records( $records );
            return [ 'authorized' => false, 'error' => 'Approval request has expired' ];
        }

        if ( $record['status'] !== 'APPROVED' ) {
            return [ 'authorized' => false, 'error' => sprintf( 'Approval status is "%s". Destructive operation not authorized.', $record['status'] ) ];
        }

        if ( $record['action'] !== $action ) {
            return [ 'authorized' => false, 'error' => sprintf( 'Action mismatch: approved for "%s", requested "%s"', $record['action'], $action ) ];
        }

        if ( (string) $record['targetId'] !== (string) $target_id ) {
            return [ 'authorized' => false, 'error' => sprintf( 'Target mismatch: approved for target "%s", requested "%s"', $record['targetId'], $target_id ) ];
        }

        // Verify arguments hash
        ksort( $args );
        unset( $args['approvalId'], $args['executionToken'], $args['confirmed'] );
        $current_hash = hash( 'sha256', wp_json_encode( $args ) );
        if ( $record['argumentsHash'] !== $current_hash ) {
            return [ 'authorized' => false, 'error' => 'Arguments have been altered since approval was granted (Parameter tampering blocked).' ];
        }

        // Atomically burn approval (single-use)
        $record['status']     = 'CONSUMED';
        $record['consumedAt'] = time();

        self::save_records( $records );
        return [ 'authorized' => true, 'record' => $record ];
    }

    /**
     * Fetches an approval record with status check.
     */
    public static function get_approval( string $approval_id ): ?array {
        $records = self::get_all_records();
        if ( ! isset( $records[ $approval_id ] ) ) {
            return null;
        }
        $record = $records[ $approval_id ];
        if ( time() > $record['expiresAt'] && ( $record['status'] === 'PENDING' || $record['status'] === 'APPROVED' ) ) {
            $record['status'] = 'EXPIRED';
        }
        return $record;
    }

    private static function get_all_records(): array {
        $data = get_option( self::OPTION_KEY, [] );
        return is_array( $data ) ? $data : [];
    }

    private static function save_records( array $records ): void {
        // Keep up to 100 recent records
        if ( count( $records ) > 100 ) {
            $records = array_slice( $records, -100, 100, true );
        }
        update_option( self::OPTION_KEY, $records, false );
    }

    public static function reset(): void {
        delete_option( self::OPTION_KEY );
    }
}
