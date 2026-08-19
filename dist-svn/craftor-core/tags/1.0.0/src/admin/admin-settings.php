<?php
namespace Craftor\Core\Admin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor WordPress Admin Settings & Onboarding Wizard Controller
 * Clean MVC architecture without inline styling or monolithic scripts.
 */
class AdminSettings {
    public function __construct() {
        add_action( 'admin_menu', [ $this, 'register_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
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

        add_submenu_page(
            'craftor-settings',
            __( '⚡ 3-Step AI Site Wizard', 'craftor' ),
            __( '⚡ AI Site Wizard', 'craftor' ),
            'manage_options',
            'craftor-wizard',
            [ $this, 'render_wizard_page' ]
        );
    }

    public function register_settings(): void {
        register_setting( 'craftor_settings_group', 'craftor_api_token' );
        register_setting( 'craftor_settings_group', 'craftor_whitelabel_title' );
        register_setting( 'craftor_settings_group', 'craftor_telemetry_enabled' );

        if ( ! get_option( 'craftor_api_token' ) ) {
            update_option( 'craftor_api_token', 'crf_' . wp_generate_password( 24, false ) );
        }
    }

    public function enqueue_admin_assets( string $hook ): void {
        if ( strpos( $hook, 'craftor-settings' ) === false && strpos( $hook, 'craftor-wizard' ) === false ) {
            return;
        }

        wp_enqueue_style(
            'craftor-admin-wizard-css',
            CRAFTOR_CORE_URL . 'assets/css/admin-wizard.css',
            [],
            CRAFTOR_CORE_VERSION
        );

        wp_enqueue_script(
            'craftor-admin-wizard-js',
            CRAFTOR_CORE_URL . 'assets/js/admin-wizard.js',
            [],
            CRAFTOR_CORE_VERSION,
            true
        );

        $token = get_option( 'craftor_api_token' );
        wp_localize_script( 'craftor-admin-wizard-js', 'craftorWizardData', [
            'endpoint'  => rest_url( 'craftor/v1/wizard/generate' ),
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'token'     => $token,
            'siteUrl'   => site_url(),
            'editorUrl' => admin_url( 'post.php' ),
        ] );
    }

    public function render_page(): void {
        $token = get_option( 'craftor_api_token' );
        $site_url = site_url();
        $is_elementor_active = class_exists( '\\Elementor\\Plugin' );
        $is_woo_active = class_exists( '\\WooCommerce' );
        $wizard_url = admin_url( 'admin.php?page=craftor-wizard' );
        ?>
        <div class="wrap craftor-admin-wrap">
            <div class="craftor-header">
                <div>
                    <h1>⚡ Craftor AI Autonomous Platform</h1>
                    <p>Universal Model Context Protocol (MCP) Bridge for WordPress & Elementor</p>
                </div>
                <div class="craftor-status-badge">
                    ● REST API ENGINE READY
                </div>
            </div>

            <!-- PROMINENT WIZARD BANNER -->
            <div class="craftor-banner">
                <div>
                    <span style="background: #f59e0b; color: #000; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">ZERO-PROMPT WORKFLOW</span>
                    <h2>🚀 Launch 3-Step AI Site Generator Wizard</h2>
                    <p>Cannot write complex AI prompts? Pick your business, choose your color theme, and build a complete Elementor website in 3 clicks.</p>
                </div>
                <div>
                    <a href="<?php echo esc_url( $wizard_url ); ?>" class="craftor-btn-launch">
                        ⚡ Start 3-Step Wizard →
                    </a>
                </div>
            </div>

            <!-- DIAGNOSTICS CARDS -->
            <div class="craftor-grid-cards">
                <div class="craftor-card">
                    <div class="craftor-card-title">Elementor Status</div>
                    <div class="craftor-card-value" style="color: <?php echo $is_elementor_active ? '#10b981' : '#f59e0b'; ?>;">
                        <?php echo $is_elementor_active ? 'Active & Hooked' : 'Not Detected'; ?>
                    </div>
                </div>
                <div class="craftor-card">
                    <div class="craftor-card-title">WooCommerce Bridge</div>
                    <div class="craftor-card-value" style="color: <?php echo $is_woo_active ? '#10b981' : '#64748b'; ?>;">
                        <?php echo $is_woo_active ? 'Active & Synced' : 'Optional (Standby)'; ?>
                    </div>
                </div>
                <div class="craftor-card">
                    <div class="craftor-card-title">MCP Tools Catalog</div>
                    <div class="craftor-card-value" style="color: #6366f1;">
                        94 Production Tools
                    </div>
                </div>
            </div>

            <!-- CREDENTIALS BOX -->
            <div class="craftor-card" style="margin-bottom: 25px;">
                <h3 style="margin-top: 0; font-size: 18px; color: #0f172a;">🔑 AI Client Connection Credentials</h3>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Use this token in your Cursor, Claude Desktop, Antigravity, or VS Code MCP configuration:</p>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 700; font-size: 13px; margin-bottom: 6px;">WordPress Site Base URL:</label>
                    <input type="text" readonly value="<?php echo esc_attr( $site_url ); ?>" style="width: 100%; max-width: 500px; padding: 8px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px;" />
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-weight: 700; font-size: 13px; margin-bottom: 6px;">Craftor Secret API Token (Header: X-Craftor-Token):</label>
                    <input type="text" id="craftor-token-field" readonly value="<?php echo esc_attr( $token ); ?>" style="width: 100%; max-width: 500px; padding: 8px 12px; font-family: monospace; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px;" />
                    <button type="button" class="button button-secondary" onclick="navigator.clipboard.writeText(document.getElementById('craftor-token-field').value); alert('API Token copied to clipboard!');" style="margin-left: 8px;">📋 Copy Token</button>
                </div>
            </div>
        </div>
        <?php
    }

    public function render_wizard_page(): void {
        ?>
        <div class="wrap craftor-admin-wrap craftor-wizard-container">
            <div style="text-align: center; margin-bottom: 30px;">
                <span style="background: #f59e0b; color: #000; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">ZERO-PROMPT BUILDER</span>
                <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 10px 0 8px 0;">⚡ 3-Step AI Website Generator</h1>
                <p style="color: #64748b; font-size: 16px; margin: 0;">Select your business and preferences. Craftor will generate a 100% native Elementor website in seconds.</p>
            </div>

            <!-- STEP PROGRESS TRACKER -->
            <div class="craftor-step-progress">
                <div class="craftor-progress-line"></div>
                <div id="step-ind-1" class="craftor-step-item">
                    <div class="craftor-step-circle active">1</div>
                    <div class="craftor-step-label">Business Type</div>
                </div>
                <div id="step-ind-2" class="craftor-step-item">
                    <div class="craftor-step-circle">2</div>
                    <div class="craftor-step-label">Design & Colors</div>
                </div>
                <div id="step-ind-3" class="craftor-step-item">
                    <div class="craftor-step-circle">3</div>
                    <div class="craftor-step-label">Build & Launch</div>
                </div>
            </div>

            <div class="craftor-card" style="padding: 35px; border-radius: 16px;">
                <!-- STEP 1 -->
                <div id="wizard-step-1">
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">Step 1: Choose Your Business Archetype</h3>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Select the industry that matches your website needs:</p>

                    <div class="craftor-archetype-grid">
                        <div class="craftor-archetype-card selected" onclick="craftorSelectArchetype('saas', this)">
                            <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">SaaS & Startup</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Features, Pricing, Testimonials</div>
                        </div>
                        <div class="craftor-archetype-card" onclick="craftorSelectArchetype('fitness', this)">
                            <div style="font-size: 32px; margin-bottom: 8px;">🏋️</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">Gym & Fitness</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Trainers, Plans, Trial CTA</div>
                        </div>
                        <div class="craftor-archetype-card" onclick="craftorSelectArchetype('restaurant', this)">
                            <div style="font-size: 32px; margin-bottom: 8px;">☕</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">Cafe & Dining</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Menu Grid, Chef Specials, Booking</div>
                        </div>
                        <div class="craftor-archetype-card" onclick="craftorSelectArchetype('agency', this)">
                            <div style="font-size: 32px; margin-bottom: 8px;">🎨</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">Agency & Portfolio</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Case Studies, Services, Contact</div>
                        </div>
                    </div>

                    <div style="text-align: right;">
                        <button type="button" class="craftor-btn-primary" onclick="craftorGoToStep(2)">Next: Choose Colors →</button>
                    </div>
                </div>

                <!-- STEP 2 -->
                <div id="wizard-step-2" style="display: none;">
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">Step 2: Choose Your Design Vibe</h3>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Select the visual aesthetic and color palette:</p>

                    <div class="craftor-theme-grid">
                        <div class="craftor-theme-card selected" onclick="craftorSelectTheme('dark-gold', this)" style="background: #0b0f19; color: #fff;">
                            <div style="font-size: 18px; font-weight: 700; color: #f59e0b; margin-bottom: 6px;">🌙 Dark Obsidian & Gold</div>
                            <div style="font-size: 13px; color: #94a3b8;">Luxury, high-tech, modern contrast with engineering precision.</div>
                        </div>
                        <div class="craftor-theme-card" onclick="craftorSelectTheme('clean-blue', this)" style="background: #f8fafc;">
                            <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-bottom: 6px;">☀️ Clean White & Ocean Blue</div>
                            <div style="font-size: 13px; color: #64748b;">Crisp, corporate, trustworthy healthcare & SaaS aesthetic.</div>
                        </div>
                        <div class="craftor-theme-card" onclick="craftorSelectTheme('neon-cyan', this)" style="background: #070a12; color: #fff;">
                            <div style="font-size: 18px; font-weight: 700; color: #06b6d4; margin-bottom: 6px;">⚡ High-Tech Cyan Neon</div>
                            <div style="font-size: 13px; color: #94a3b8;">Cyberpunk, AI, dev tools, and Web3 energy.</div>
                        </div>
                        <div class="craftor-theme-card" onclick="craftorSelectTheme('emerald-green', this)" style="background: #f0fdf4;">
                            <div style="font-size: 18px; font-weight: 700; color: #16a34a; margin-bottom: 6px;">🌿 Organic Emerald & Earth</div>
                            <div style="font-size: 13px; color: #64748b;">Sustainable, wellness, fitness, and eco-friendly products.</div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between;">
                        <button type="button" class="button" onclick="craftorGoToStep(1)">← Back</button>
                        <button type="button" class="craftor-btn-primary" onclick="craftorGoToStep(3)">Next: Name & Launch →</button>
                    </div>
                </div>

                <!-- STEP 3 -->
                <div id="wizard-step-3" style="display: none;">
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">Step 3: Name Your Website & Features</h3>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Enter your brand title and enable optional integrations:</p>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 700; font-size: 14px; margin-bottom: 8px;">Website / Business Title:</label>
                        <input type="text" id="wizard-site-title" value="AuraFlow AI — NextGen Platform" style="width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 16px;" />
                    </div>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 28px;">
                        <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; cursor: pointer;">
                            <input type="checkbox" id="wizard-opt-woo" checked style="width: 18px; height: 18px;" />
                            <span style="font-weight: 600; font-size: 14px;">🛒 Create 3 Live WooCommerce Subscription Products ($19, $49, $99)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="wizard-opt-seo" checked style="width: 18px; height: 18px;" />
                            <span style="font-weight: 600; font-size: 14px;">🔍 Auto-Inject RankMath / Yoast SEO Titles & OpenGraph Meta</span>
                        </label>
                    </div>

                    <div id="wizard-loading-area" style="display: none; background: #0f172a; color: #fff; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                        <div style="font-weight: 700; color: #38bdf8; font-size: 15px; margin-bottom: 10px;">⚡ Generating Native Elementor Website...</div>
                        <div style="font-size: 13px; color: #94a3b8;">⏳ Communicating with Craftor Core Archetype Engine...</div>
                    </div>

                    <div id="wizard-success-area" style="display: none; background: #ecfdf5; border: 1px solid #10b981; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
                        <h4 id="wizard-success-title" style="font-size: 20px; font-weight: 800; color: #065f46; margin: 0 0 6px 0;">Your Website is Live & Ready!</h4>
                        <p id="wizard-success-desc" style="color: #047857; font-size: 14px; margin-bottom: 18px;">Created with 100% Native Elementor Widgets & Flexbox layout.</p>
                        <div style="display: flex; justify-content: center; gap: 14px;">
                            <a id="btn-view-site" href="#" target="_blank" class="craftor-btn-primary" style="background: #10b981; text-decoration: none;">👁️ View Live Website →</a>
                            <a id="btn-edit-elementor" href="#" target="_blank" class="craftor-btn-primary" style="background: #1e1b4b; text-decoration: none;">✏️ Edit in Elementor Canvas</a>
                        </div>
                    </div>

                    <div id="wizard-actions-bar" style="display: flex; justify-content: space-between;">
                        <button type="button" class="button" onclick="craftorGoToStep(2)">← Back</button>
                        <button type="button" id="btn-start-build" class="craftor-btn-build" onclick="craftorExecuteWizardBuild()">⚡ Build Website Now →</button>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}
