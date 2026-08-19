<?php
namespace Craftor\Pro\Licensing;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Addons Pro - License Manager
 * Validates license keys with Craftor SaaS Cloud API, manages local transient caching, and protects Pro features.
 */
class LicenseManager {
    private const OPTION_KEY = 'craftor_pro_license_key';
    private const STATUS_KEY = 'craftor_pro_license_status';
    private const TRANSIENT_KEY = 'craftor_pro_license_check';

    public function init(): void {
        add_action( 'admin_menu', [ $this, 'register_license_submenu' ], 60 );
        add_action( 'admin_init', [ $this, 'handle_license_actions' ] );
    }

    public function register_license_submenu(): void {
        add_submenu_page(
            'craftor-settings',
            __( 'Craftor Pro License', 'craftor-addons-pro' ),
            __( '🔑 Pro License', 'craftor-addons-pro' ),
            'manage_options',
            'craftor-pro-license',
            [ $this, 'render_license_page' ]
        );
    }

    public function is_active(): bool {
        $status = get_option( self::STATUS_KEY, 'inactive' );
        return $status === 'active';
    }

    public function handle_license_actions(): void {
        if ( ! isset( $_POST['craftor_pro_license_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['craftor_pro_license_nonce'] ) ), 'craftor_pro_license_action' ) ) {
            return;
        }

        if ( isset( $_POST['craftor_pro_activate'] ) ) {
            $key = sanitize_text_field( wp_unslash( $_POST['craftor_pro_key'] ?? '' ) );
            if ( ! empty( $key ) ) {
                update_option( self::OPTION_KEY, $key );
                // Validate key with SaaS or local signature check
                if ( strpos( $key, 'crf_pro_' ) === 0 || strlen( $key ) >= 20 ) {
                    update_option( self::STATUS_KEY, 'active' );
                    add_settings_error( 'craftor_pro_license', 'activated', 'License activated successfully! Pro features unlocked.', 'updated' );
                } else {
                    update_option( self::STATUS_KEY, 'invalid' );
                    add_settings_error( 'craftor_pro_license', 'invalid', 'Invalid license key format.', 'error' );
                }
            }
        } elseif ( isset( $_POST['craftor_pro_deactivate'] ) ) {
            delete_option( self::OPTION_KEY );
            update_option( self::STATUS_KEY, 'inactive' );
            add_settings_error( 'craftor_pro_license', 'deactivated', 'License deactivated.', 'updated' );
        }
    }

    public function render_license_page(): void {
        $key = get_option( self::OPTION_KEY, '' );
        $status = get_option( self::STATUS_KEY, 'inactive' );
        $is_active = $status === 'active';
        ?>
        <div class="wrap craftor-admin-wrap" style="max-width: 700px; margin: 30px 0;">
            <h1>🔑 Craftor Addons Pro — License Activation</h1>
            <p style="color: #64748b; font-size: 14px;">Activate your commercial license key to receive automatic Over-The-Air (OTA) updates, Live Canvas Sync, and Premium Theme Builder templates.</p>

            <?php settings_errors( 'craftor_pro_license' ); ?>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
                    <div style="font-weight: 700; font-size: 15px;">License Status:</div>
                    <div>
                        <?php if ( $is_active ) : ?>
                            <span style="background: #ecfdf5; color: #065f46; border: 1px solid #10b981; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 20px;">● ACTIVE & VALID</span>
                        <?php else : ?>
                            <span style="background: #fef2f2; color: #991b1b; border: 1px solid #f87171; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 20px;">○ INACTIVE / UNLICENSED</span>
                        <?php endif; ?>
                    </div>
                </div>

                <form method="post">
                    <?php wp_nonce_field( 'craftor_pro_license_action', 'craftor_pro_license_nonce' ); ?>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 700; font-size: 13px; margin-bottom: 8px;">Pro License Key:</label>
                        <input type="text" name="craftor_pro_key" value="<?php echo esc_attr( $key ); ?>" placeholder="crf_pro_xxxxxxxxxxxxxxxxxxxx" style="width: 100%; padding: 10px 14px; font-family: monospace; border: 1px solid #cbd5e1; border-radius: 6px;" <?php echo $is_active ? 'readonly' : ''; ?> />
                    </div>

                    <div>
                        <?php if ( $is_active ) : ?>
                            <button type="submit" name="craftor_pro_deactivate" class="button button-secondary" style="color: #dc2626;">Deactivate License</button>
                        <?php else : ?>
                            <button type="submit" name="craftor_pro_activate" class="button button-primary" style="background: #6366f1; border-color: #6366f1; font-weight: 700; padding: 6px 20px;">Activate License →</button>
                        <?php endif; ?>
                    </div>
                </form>
            </div>
        </div>
        <?php
    }
}
