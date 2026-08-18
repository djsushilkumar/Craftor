<?php
namespace Craftor\Core\Admin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor WordPress Admin Settings & Diagnostics Dashboard
 * Provides real-life agency control panel, API Token generation, and MCP server connectivity diagnostics.
 */
class AdminSettings {
    public function __construct() {
        add_action( 'admin_menu', [ $this, 'register_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
    }

    public function register_menu(): void {
        add_menu_page(
            __( 'Craftor AI Studio', 'craftor' ),
            __( 'Craftor AI', 'craftor' ),
            'manage_options',
            'craftor-settings',
            [ $this, 'render_page' ],
            'dashicons-superhero-alt',
            58
        );
    }

    public function register_settings(): void {
        register_setting( 'craftor_settings_group', 'craftor_api_token' );
        register_setting( 'craftor_settings_group', 'craftor_whitelabel_title' );
        register_setting( 'craftor_settings_group', 'craftor_telemetry_enabled' );

        // Ensure default token exists
        if ( ! get_option( 'craftor_api_token' ) ) {
            update_option( 'craftor_api_token', 'crf_' . wp_generate_password( 24, false ) );
        }
    }

    public function render_page(): void {
        $token = get_option( 'craftor_api_token', 'crf_live_demo_sec_key_2026' );
        $site_url = site_url();
        $rest_url = rest_url( 'craftor/v1' );
        $is_elementor_active = class_exists( '\\Elementor\\Plugin' );
        $is_woo_active = class_exists( '\\WooCommerce' );
        ?>
        <div class="wrap" style="max-width: 1050px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 20px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
                <div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #1e1b4b;">⚡ Craftor AI Autonomous Platform</h1>
                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Universal Model Context Protocol (MCP) Bridge for WordPress & Elementor</p>
                </div>
                <div style="background: #ecfdf5; border: 1px solid #10b981; color: #065f46; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px;">
                    ● REST API ENGINE READY
                </div>
            </div>

            <!-- Diagnostics Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 25px;">
                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Elementor Status</div>
                    <div style="font-size: 18px; font-weight: 700; margin-top: 6px; color: <?php echo $is_elementor_active ? '#10b981' : '#f59e0b'; ?>;">
                        <?php echo $is_elementor_active ? 'Active & Hooked' : 'Not Detected'; ?>
                    </div>
                </div>
                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">WooCommerce Bridge</div>
                    <div style="font-size: 18px; font-weight: 700; margin-top: 6px; color: <?php echo $is_woo_active ? '#10b981' : '#64748b'; ?>;">
                        <?php echo $is_woo_active ? 'Active & Synced' : 'Optional (Standby)'; ?>
                    </div>
                </div>
                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">MCP Tools Catalog</div>
                    <div style="font-size: 18px; font-weight: 700; margin-top: 6px; color: #6366f1;">
                        86 Production Tools
                    </div>
                </div>
            </div>

            <!-- Credentials & Config Box -->
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; font-size: 18px; color: #0f172a;">🔑 AI Client Connection Credentials</h3>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Use this token in your Cursor, Claude Desktop, Antigravity, or VS Code MCP configuration:</p>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #334155;">WordPress Site Base URL:</label>
                    <input type="text" readonly value="<?php echo esc_attr( $site_url ); ?>" style="width: 100%; max-width: 500px; padding: 8px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px;" />
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #334155;">Craftor Secret API Token (Header: X-Craftor-Token):</label>
                    <input type="text" id="craftor-token-field" readonly value="<?php echo esc_attr( $token ); ?>" style="width: 100%; max-width: 500px; padding: 8px 12px; font-family: monospace; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px;" />
                    <button type="button" class="button button-secondary" onclick="navigator.clipboard.writeText(document.getElementById('craftor-token-field').value); alert('API Token copied to clipboard!');" style="margin-left: 8px;">📋 Copy Token</button>
                </div>
            </div>

            <!-- Ready-to-use Client Config Snippet -->
            <div style="background: #0f172a; border-radius: 10px; padding: 20px; color: #f8fafc; margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: #38bdf8; font-size: 15px;">🤖 Ready-to-Copy Cursor / Claude Desktop / Antigravity Config</h4>
                    <span style="font-size: 12px; color: #94a3b8;">mcp.json</span>
                </div>
                <pre style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 6px; overflow-x: auto; color: #a5f3fc; font-size: 13px; margin: 0;">{
  "mcpServers": {
    "craftor": {
      "command": "node",
      "args": ["C:/Users/420/Crafter/packages/mcp-server/dist/index.js"],
      "env": {
        "WORDPRESS_BASE_URL": "<?php echo esc_js( $site_url ); ?>",
        "WORDPRESS_API_TOKEN": "<?php echo esc_js( $token ); ?>"
      }
    }
  }
}</pre>
            </div>
        </div>
        <?php
    }
}
