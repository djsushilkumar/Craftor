<?php
namespace Craftor\Core\Database;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Database Schema Installer
 * Provisions and manages the 12 core MySQL database tables (wp_craftor_*)
 * using WordPress dbDelta() with charset/collation awareness and upgrade migration safety.
 */
class SchemaInstaller {
    const DB_VERSION = '1.0.0';
    const DB_VERSION_OPTION = 'craftor_db_version';

    /**
     * Executes dbDelta() schema migration for all 12 core tables.
     *
     * @return array Installation result status, created tables, and execution log.
     */
    public static function install(): array {
        global $wpdb;

        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix;
        $schema_queries = self::get_schema_queries( $prefix, $charset_collate );

        $results = [];
        foreach ( $schema_queries as $table_name => $sql ) {
            $delta_result = dbDelta( $sql );
            $results[ $table_name ] = $delta_result;
        }

        update_option( self::DB_VERSION_OPTION, self::DB_VERSION );
        update_option( 'craftor_db_installed_at', gmdate( 'Y-m-d\TH:i:s\Z' ) );

        return [
            'success'        => true,
            'db_version'     => self::DB_VERSION,
            'tables_count'   => count( $schema_queries ),
            'tables'         => array_keys( $schema_queries ),
            'dbdelta_output' => $results,
        ];
    }

    /**
     * Returns the array of all 12 table names with the current WordPress table prefix.
     *
     * @return array
     */
    public static function get_table_names(): array {
        global $wpdb;
        $prefix = $wpdb->prefix;

        return [
            'snapshots'          => $prefix . 'craftor_snapshots',
            'activity_logs'      => $prefix . 'craftor_activity_logs',
            'tokens'             => $prefix . 'craftor_tokens',
            'tool_registry'      => $prefix . 'craftor_tool_registry',
            'skill_registry'     => $prefix . 'craftor_skill_registry',
            'agent_registry'     => $prefix . 'craftor_agent_registry',
            'workflow_registry'  => $prefix . 'craftor_workflow_registry',
            'ai_providers'       => $prefix . 'craftor_ai_providers',
            'client_connections' => $prefix . 'craftor_client_connections',
            'licenses'           => $prefix . 'craftor_licenses',
            'updates'            => $prefix . 'craftor_updates',
            'settings'           => $prefix . 'craftor_settings',
        ];
    }

    /**
     * Generates all 12 CREATE TABLE DDL queries formatted strictly for dbDelta compatibility.
     *
     * @param string $prefix Table prefix (e.g. wp_)
     * @param string $charset_collate Charset and Collation SQL clause
     * @return array<string, string> Map of table_name => SQL query
     */
    public static function get_schema_queries( string $prefix, string $charset_collate ): array {
        return [
            // 1. wp_craftor_snapshots
            $prefix . 'craftor_snapshots' => "CREATE TABLE {$prefix}craftor_snapshots (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  uuid varchar(64) NOT NULL,
  post_id bigint(20) unsigned NOT NULL DEFAULT 0,
  action_context varchar(64) NOT NULL DEFAULT '',
  payload longtext NOT NULL,
  payload_checksum varchar(64) NOT NULL DEFAULT '',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_snapshot_uuid (uuid),
  KEY idx_post_created (post_id, created_at),
  KEY idx_created_at (created_at)
) {$charset_collate};",

            // 2. wp_craftor_activity_logs
            $prefix . 'craftor_activity_logs' => "CREATE TABLE {$prefix}craftor_activity_logs (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  session_id varchar(64) NOT NULL DEFAULT '',
  tool_name varchar(64) NOT NULL DEFAULT '',
  user_id bigint(20) unsigned NOT NULL DEFAULT 0,
  execution_ms int(10) unsigned NOT NULL DEFAULT 0,
  request_params longtext DEFAULT NULL,
  response_summary longtext DEFAULT NULL,
  snapshot_uuid varchar(64) DEFAULT NULL,
  status_code tinyint(3) unsigned NOT NULL DEFAULT 200,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  KEY idx_tool_created (tool_name, created_at),
  KEY idx_session (session_id),
  KEY idx_snapshot (snapshot_uuid)
) {$charset_collate};",

            // 3. wp_craftor_tokens
            $prefix . 'craftor_tokens' => "CREATE TABLE {$prefix}craftor_tokens (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  token_hash varchar(64) NOT NULL,
  label varchar(64) NOT NULL DEFAULT '',
  user_id bigint(20) unsigned NOT NULL DEFAULT 0,
  scopes text NOT NULL,
  expires_at datetime DEFAULT NULL,
  last_used_at datetime DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_token_hash (token_hash),
  KEY idx_user_id (user_id)
) {$charset_collate};",

            // 4. wp_craftor_tool_registry
            $prefix . 'craftor_tool_registry' => "CREATE TABLE {$prefix}craftor_tool_registry (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  tool_id varchar(64) NOT NULL,
  version varchar(16) NOT NULL DEFAULT '1.0.0',
  category varchar(64) NOT NULL DEFAULT 'general',
  permissions text NOT NULL,
  input_schema longtext NOT NULL,
  output_schema longtext NOT NULL,
  is_active tinyint(1) NOT NULL DEFAULT 1,
  is_deprecated tinyint(1) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_tool_id (tool_id),
  KEY idx_category_active (category, is_active)
) {$charset_collate};",

            // 5. wp_craftor_skill_registry
            $prefix . 'craftor_skill_registry' => "CREATE TABLE {$prefix}craftor_skill_registry (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  skill_id varchar(64) NOT NULL,
  version varchar(16) NOT NULL DEFAULT '1.0.0',
  name varchar(128) NOT NULL DEFAULT '',
  description text NOT NULL,
  system_prompt longtext NOT NULL,
  eval_accuracy decimal(5,2) NOT NULL DEFAULT 0.00,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_skill_id (skill_id)
) {$charset_collate};",

            // 6. wp_craftor_agent_registry
            $prefix . 'craftor_agent_registry' => "CREATE TABLE {$prefix}craftor_agent_registry (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  agent_id varchar(64) NOT NULL,
  name varchar(128) NOT NULL DEFAULT '',
  role_persona varchar(64) NOT NULL DEFAULT '',
  bound_skills text NOT NULL,
  guardrails text NOT NULL,
  is_active tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_agent_id (agent_id)
) {$charset_collate};",

            // 7. wp_craftor_workflow_registry
            $prefix . 'craftor_workflow_registry' => "CREATE TABLE {$prefix}craftor_workflow_registry (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  workflow_id varchar(64) NOT NULL,
  name varchar(128) NOT NULL DEFAULT '',
  step_graph longtext NOT NULL,
  rollback_on_failure tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_workflow_id (workflow_id)
) {$charset_collate};",

            // 8. wp_craftor_ai_providers
            $prefix . 'craftor_ai_providers' => "CREATE TABLE {$prefix}craftor_ai_providers (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  provider_key varchar(32) NOT NULL,
  provider_name varchar(64) NOT NULL DEFAULT '',
  encrypted_api_key text DEFAULT NULL,
  custom_endpoint varchar(255) DEFAULT NULL,
  is_active tinyint(1) NOT NULL DEFAULT 0,
  last_ping_at datetime DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_provider_key (provider_key)
) {$charset_collate};",

            // 9. wp_craftor_client_connections
            $prefix . 'craftor_client_connections' => "CREATE TABLE {$prefix}craftor_client_connections (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  client_id varchar(64) NOT NULL,
  client_type varchar(64) NOT NULL DEFAULT '',
  transport_mode varchar(16) NOT NULL DEFAULT 'stdio',
  token_hash varchar(64) NOT NULL DEFAULT '',
  connected_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_heartbeat_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_client_id (client_id),
  KEY idx_heartbeat (last_heartbeat_at)
) {$charset_collate};",

            // 10. wp_craftor_licenses
            $prefix . 'craftor_licenses' => "CREATE TABLE {$prefix}craftor_licenses (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  license_key varchar(128) NOT NULL,
  tier varchar(32) NOT NULL DEFAULT 'core',
  expires_at datetime DEFAULT NULL,
  active_features text NOT NULL,
  last_validated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_license_key (license_key)
) {$charset_collate};",

            // 11. wp_craftor_updates
            $prefix . 'craftor_updates' => "CREATE TABLE {$prefix}craftor_updates (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  version varchar(32) NOT NULL,
  release_channel varchar(32) NOT NULL DEFAULT 'stable',
  package_checksum varchar(64) NOT NULL DEFAULT '',
  changelog longtext NOT NULL,
  release_date datetime NOT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_version (version)
) {$charset_collate};",

            // 12. wp_craftor_settings
            $prefix . 'craftor_settings' => "CREATE TABLE {$prefix}craftor_settings (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  setting_key varchar(64) NOT NULL,
  setting_value longtext DEFAULT NULL,
  is_autoload tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  UNIQUE KEY idx_setting_key (setting_key),
  KEY idx_autoload (is_autoload)
) {$charset_collate};",
        ];
    }

    /**
     * Uninstalls/drops all 12 Craftor database tables safely.
     *
     * @return bool True if all tables dropped successfully.
     */
    public static function drop_tables(): bool {
        global $wpdb;

        $tables = self::get_table_names();
        foreach ( $tables as $table ) {
            $wpdb->query( "DROP TABLE IF EXISTS {$table};" );
        }

        delete_option( self::DB_VERSION_OPTION );
        delete_option( 'craftor_db_installed_at' );

        return true;
    }
}
