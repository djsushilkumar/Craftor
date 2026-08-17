<?php
namespace Craftor\Core\Database;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Transaction Manager
 * Manages database transaction boundaries, savepoints, and state rollback safety using $wpdb.
 */
class TransactionManager {
    private static int $transaction_depth = 0;
    private static array $savepoints = [];

    /**
     * Begins a database transaction or creates a savepoint if already nested.
     */
    public static function begin_transaction(): bool {
        global $wpdb;

        if ( self::$transaction_depth === 0 ) {
            $wpdb->query( 'SET autocommit = 0' );
            $result = $wpdb->query( 'START TRANSACTION' );
            if ( $result !== false ) {
                self::$transaction_depth = 1;
                return true;
            }
            return false;
        }

        self::$transaction_depth++;
        $savepoint_name = 'crf_sp_' . self::$transaction_depth;
        return self::create_savepoint( $savepoint_name );
    }

    /**
     * Commits the active transaction or releases a nested savepoint.
     */
    public static function commit(): bool {
        global $wpdb;

        if ( self::$transaction_depth <= 0 ) {
            return false;
        }

        if ( self::$transaction_depth === 1 ) {
            $result = $wpdb->query( 'COMMIT' );
            $wpdb->query( 'SET autocommit = 1' );
            self::$transaction_depth = 0;
            self::$savepoints = [];
            return $result !== false;
        }

        $savepoint_name = 'crf_sp_' . self::$transaction_depth;
        self::$transaction_depth--;
        return self::release_savepoint( $savepoint_name );
    }

    /**
     * Rolls back the active transaction or rolls back to the latest savepoint.
     */
    public static function rollback(): bool {
        global $wpdb;

        if ( self::$transaction_depth <= 0 ) {
            return false;
        }

        if ( self::$transaction_depth === 1 ) {
            $result = $wpdb->query( 'ROLLBACK' );
            $wpdb->query( 'SET autocommit = 1' );
            self::$transaction_depth = 0;
            self::$savepoints = [];
            return $result !== false;
        }

        $savepoint_name = 'crf_sp_' . self::$transaction_depth;
        self::$transaction_depth--;
        return self::rollback_to_savepoint( $savepoint_name );
    }

    /**
     * Creates a named SQL savepoint.
     */
    public static function create_savepoint( string $name ): bool {
        global $wpdb;
        $clean_name = preg_replace( '/[^a-zA-Z0-9_]/', '', $name );
        $result = $wpdb->query( "SAVEPOINT {$clean_name}" );
        if ( $result !== false ) {
            self::$savepoints[ $clean_name ] = true;
            return true;
        }
        return false;
    }

    /**
     * Rolls back to a named SQL savepoint.
     */
    public static function rollback_to_savepoint( string $name ): bool {
        global $wpdb;
        $clean_name = preg_replace( '/[^a-zA-Z0-9_]/', '', $name );
        $result = $wpdb->query( "ROLLBACK TO SAVEPOINT {$clean_name}" );
        return $result !== false;
    }

    /**
     * Releases a named SQL savepoint.
     */
    public static function release_savepoint( string $name ): bool {
        global $wpdb;
        $clean_name = preg_replace( '/[^a-zA-Z0-9_]/', '', $name );
        $result = $wpdb->query( "RELEASE SAVEPOINT {$clean_name}" );
        unset( self::$savepoints[ $clean_name ] );
        return $result !== false;
    }

    /**
     * Checks if currently inside an active transaction.
     */
    public static function is_in_transaction(): bool {
        return self::$transaction_depth > 0;
    }

    /**
     * Executes a callback inside an atomic transactional boundary.
     * Automatically rolls back on any thrown exception or WP_Error.
     *
     * @param callable $callback
     * @return mixed
     * @throws \Throwable
     */
    public static function execute_transactionally( callable $callback ) {
        self::begin_transaction();

        try {
            $result = call_user_func( $callback );

            if ( is_wp_error( $result ) ) {
                self::rollback();
                return $result;
            }

            self::commit();
            return $result;
        } catch ( \Throwable $e ) {
            self::rollback();
            throw $e;
        }
    }
}
