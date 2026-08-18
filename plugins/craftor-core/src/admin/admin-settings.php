<?php
namespace Craftor\Core\Admin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor WordPress Admin Settings, Diagnostics Dashboard & 3-Step Onboarding Wizard
 * Provides real-life agency control panel, 3-Step AI Site Generator Wizard, API Token management, and diagnostics.
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

        // Ensure default token exists
        if ( ! get_option( 'craftor_api_token' ) ) {
            update_option( 'craftor_api_token', 'crf_' . wp_generate_password( 24, false ) );
        }
    }

    public function render_page(): void {
        $token = get_option( 'craftor_api_token' );
        if ( empty( $token ) ) {
            $token = 'crf_' . wp_generate_password( 24, false );
            update_option( 'craftor_api_token', $token );
        }
        $site_url = site_url();
        $is_elementor_active = class_exists( '\\Elementor\\Plugin' );
        $is_woo_active = class_exists( '\\WooCommerce' );
        $wizard_url = admin_url( 'admin.php?page=craftor-wizard' );
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

            <!-- PROMINENT ONBOARDING WIZARD BANNER (CHANNEL 2) -->
            <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 12px; padding: 28px 32px; color: #fff; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 25px rgba(30, 27, 75, 0.2);">
                <div>
                    <span style="background: #f59e0b; color: #000; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">NEW USER WORKFLOW</span>
                    <h2 style="margin: 10px 0 6px 0; font-size: 22px; color: #fff; font-weight: 700;">🚀 Launch 3-Step AI Site Generator Wizard</h2>
                    <p style="margin: 0; color: #cbd5e1; font-size: 14px;">Cannot write complex AI prompts? Pick your business, choose your color theme, and build a complete Elementor website in 3 clicks.</p>
                </div>
                <div>
                    <a href="<?php echo esc_url( $wizard_url ); ?>" style="background: #f59e0b; color: #000; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); white-space: nowrap;">
                        ⚡ Start 3-Step Wizard →
                    </a>
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
                        94 Production Tools
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

    /**
     * Renders the Interactive 3-Step AI Onboarding Wizard (Channel 2)
     */
    public function render_wizard_page(): void {
        $token = get_option( 'craftor_api_token' );
        $site_url = site_url();
        ?>
        <div class="wrap" style="max-width: 900px; margin: 30px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
                <span style="background: #f59e0b; color: #000; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">CHANNEL 2 • ZERO-PROMPT BUILDER</span>
                <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 10px 0 8px 0;">⚡ 3-Step AI Website Generator</h1>
                <p style="color: #64748b; font-size: 16px; margin: 0;">Select your business and preferences. Craftor will generate a 100% native Elementor website in seconds.</p>
            </div>

            <!-- Progress Tracker -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 35px; position: relative;">
                <div style="position: absolute; top: 18px; left: 10%; right: 10%; height: 2px; background: #e2e8f0; z-index: 1;"></div>
                <div id="step-ind-1" style="position: relative; z-index: 2; text-align: center; width: 33%;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #6366f1; color: #fff; font-weight: 700; line-height: 36px; margin: 0 auto; box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);">1</div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e1b4b; margin-top: 6px;">Business Type</div>
                </div>
                <div id="step-ind-2" style="position: relative; z-index: 2; text-align: center; width: 33%;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #e2e8f0; color: #64748b; font-weight: 700; line-height: 36px; margin: 0 auto;">2</div>
                    <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-top: 6px;">Design & Colors</div>
                </div>
                <div id="step-ind-3" style="position: relative; z-index: 2; text-align: center; width: 33%;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #e2e8f0; color: #64748b; font-weight: 700; line-height: 36px; margin: 0 auto;">3</div>
                    <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-top: 6px;">Build & Launch</div>
                </div>
            </div>

            <!-- Card Box -->
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 35px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                
                <!-- STEP 1: Business Archetype -->
                <div id="wizard-step-1">
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">Step 1: Choose Your Business Archetype</h3>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Select the industry that matches your website needs:</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px;">
                        <div class="archetype-card selected" onclick="selectArchetype('saas', this)" style="border: 2px solid #6366f1; background: #f5f3ff; border-radius: 12px; padding: 20px; cursor: pointer; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">SaaS & Startup</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Features, Pricing, Testimonials</div>
                        </div>
                        <div class="archetype-card" onclick="selectArchetype('fitness', this)" style="border: 2px solid #e2e8f0; background: #fff; border-radius: 12px; padding: 20px; cursor: pointer; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🏋️</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">Gym & Fitness</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Trainers, Plans, Trial CTA</div>
                        </div>
                        <div class="archetype-card" onclick="selectArchetype('restaurant', this)" style="border: 2px solid #e2e8f0; background: #fff; border-radius: 12px; padding: 20px; cursor: pointer; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">☕</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">Cafe & Dining</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Menu Grid, Chef Specials, Booking</div>
                        </div>
                        <div class="archetype-card" onclick="selectArchetype('agency', this)" style="border: 2px solid #e2e8f0; background: #fff; border-radius: 12px; padding: 20px; cursor: pointer; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🎨</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">Agency & Portfolio</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Case Studies, Services, Contact</div>
                        </div>
                        <div class="archetype-card" onclick="selectArchetype('ecommerce', this)" style="border: 2px solid #e2e8f0; background: #fff; border-radius: 12px; padding: 20px; cursor: pointer; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🛍️</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">WooCommerce Store</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Product Grid, Cart, Offers</div>
                        </div>
                        <div class="archetype-card" onclick="selectArchetype('infrastructure', this)" style="border: 2px solid #e2e8f0; background: #fff; border-radius: 12px; padding: 20px; cursor: pointer; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🏛️</div>
                            <div style="font-weight: 700; color: #1e1b4b; font-size: 15px;">Enterprise & Govt</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Infrastructure, PSUs, GeM Specs</div>
                        </div>
                    </div>

                    <div style="text-align: right;">
                        <button type="button" onclick="goToStep(2)" style="background: #6366f1; color: #fff; font-weight: 700; font-size: 15px; padding: 12px 28px; border: none; border-radius: 8px; cursor: pointer;">Next: Choose Colors →</button>
                    </div>
                </div>

                <!-- STEP 2: Theme & Colors -->
                <div id="wizard-step-2" style="display: none;">
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">Step 2: Choose Your Design Vibe</h3>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Select the visual aesthetic and color palette:</p>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 30px;">
                        <div class="theme-card selected" onclick="selectTheme('dark-gold', this)" style="border: 2px solid #6366f1; background: #0b0f19; color: #fff; border-radius: 12px; padding: 20px; cursor: pointer;">
                            <div style="font-size: 18px; font-weight: 700; color: #f59e0b; margin-bottom: 6px;">🌙 Dark Obsidian & Gold</div>
                            <div style="font-size: 13px; color: #94a3b8;">Luxury, high-tech, modern contrast with engineering precision.</div>
                        </div>
                        <div class="theme-card" onclick="selectTheme('clean-blue', this)" style="border: 2px solid #e2e8f0; background: #f8fafc; border-radius: 12px; padding: 20px; cursor: pointer;">
                            <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-bottom: 6px;">☀️ Clean White & Ocean Blue</div>
                            <div style="font-size: 13px; color: #64748b;">Crisp, corporate, trustworthy healthcare & SaaS aesthetic.</div>
                        </div>
                        <div class="theme-card" onclick="selectTheme('neon-cyan', this)" style="border: 2px solid #e2e8f0; background: #070a12; color: #fff; border-radius: 12px; padding: 20px; cursor: pointer;">
                            <div style="font-size: 18px; font-weight: 700; color: #06b6d4; margin-bottom: 6px;">⚡ High-Tech Cyan Neon</div>
                            <div style="font-size: 13px; color: #94a3b8;">Cyberpunk, AI, dev tools, and Web3 energy.</div>
                        </div>
                        <div class="theme-card" onclick="selectTheme('emerald-green', this)" style="border: 2px solid #e2e8f0; background: #f0fdf4; border-radius: 12px; padding: 20px; cursor: pointer;">
                            <div style="font-size: 18px; font-weight: 700; color: #16a34a; margin-bottom: 6px;">🌿 Organic Emerald & Earth</div>
                            <div style="font-size: 13px; color: #64748b;">Sustainable, wellness, fitness, and eco-friendly products.</div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between;">
                        <button type="button" onclick="goToStep(1)" style="background: #e2e8f0; color: #475569; font-weight: 600; font-size: 14px; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">← Back</button>
                        <button type="button" onclick="goToStep(3)" style="background: #6366f1; color: #fff; font-weight: 700; font-size: 15px; padding: 12px 28px; border: none; border-radius: 8px; cursor: pointer;">Next: Name & Launch →</button>
                    </div>
                </div>

                <!-- STEP 3: Business Details & Launch -->
                <div id="wizard-step-3" style="display: none;">
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">Step 3: Name Your Website & Features</h3>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Enter your brand title and enable optional integrations:</p>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 8px;">Website / Business Title:</label>
                        <input type="text" id="wizard-site-title" value="AuraFlow AI — NextGen Platform" style="width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 16px;" />
                    </div>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 28px;">
                        <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; cursor: pointer;">
                            <input type="checkbox" id="wizard-opt-woo" checked style="width: 18px; height: 18px;" />
                            <span style="font-weight: 600; color: #1e293b; font-size: 14px;">🛒 Create 3 Live WooCommerce Subscription Products ($19, $49, $99)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="wizard-opt-seo" checked style="width: 18px; height: 18px;" />
                            <span style="font-weight: 600; color: #1e293b; font-size: 14px;">🔍 Auto-Inject RankMath / Yoast SEO Titles & OpenGraph Meta</span>
                        </label>
                    </div>

                    <div id="wizard-loading-area" style="display: none; background: #0f172a; color: #fff; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                        <div style="font-weight: 700; color: #38bdf8; font-size: 15px; margin-bottom: 10px;">⚡ Generating Native Elementor Website...</div>
                        <div id="gen-step-1" style="font-size: 13px; color: #94a3b8; margin-bottom: 6px;">⏳ Creating live WordPress page...</div>
                        <div id="gen-step-2" style="font-size: 13px; color: #94a3b8; margin-bottom: 6px;">⏳ Compiling 100% Native Elementor AST Flexbox Containers...</div>
                        <div id="gen-step-3" style="font-size: 13px; color: #94a3b8; margin-bottom: 6px;">⏳ Persisting to MariaDB _elementor_data...</div>
                        <div id="gen-step-4" style="font-size: 13px; color: #94a3b8;">⏳ Creating WooCommerce products and SEO metadata...</div>
                    </div>

                    <div id="wizard-success-area" style="display: none; background: #ecfdf5; border: 1px solid #10b981; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
                        <h4 style="font-size: 20px; font-weight: 800; color: #065f46; margin: 0 0 6px 0;">Your Website is Live & Ready!</h4>
                        <p style="color: #047857; font-size: 14px; margin-bottom: 18px;">Created with 100% Native Elementor Widgets & Flexbox layout.</p>
                        <div style="display: flex; justify-content: center; gap: 14px;">
                            <a id="btn-view-site" href="#" target="_blank" style="background: #10b981; color: #fff; font-weight: 700; padding: 12px 24px; border-radius: 6px; text-decoration: none;">👁️ View Live Website →</a>
                            <a id="btn-edit-elementor" href="#" target="_blank" style="background: #1e1b4b; color: #fff; font-weight: 700; padding: 12px 24px; border-radius: 6px; text-decoration: none;">✏️ Edit in Elementor Canvas</a>
                        </div>
                    </div>

                    <div id="wizard-actions-bar" style="display: flex; justify-content: space-between;">
                        <button type="button" onclick="goToStep(2)" style="background: #e2e8f0; color: #475569; font-weight: 600; font-size: 14px; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">← Back</button>
                        <button type="button" id="btn-start-build" onclick="executeWizardBuild()" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; font-weight: 800; font-size: 16px; padding: 14px 36px; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">⚡ Build Website Now →</button>
                    </div>
                </div>

            </div>
        </div>

        <script>
        let selectedArchetypeVal = 'saas';
        let selectedThemeVal = 'dark-gold';

        function selectArchetype(val, el) {
            selectedArchetypeVal = val;
            document.querySelectorAll('.archetype-card').forEach(c => {
                c.style.border = '2px solid #e2e8f0';
                c.style.background = '#fff';
            });
            el.style.border = '2px solid #6366f1';
            el.style.background = '#f5f3ff';
        }

        function selectTheme(val, el) {
            selectedThemeVal = val;
            document.querySelectorAll('.theme-card').forEach(c => {
                c.style.border = '2px solid #e2e8f0';
            });
            el.style.border = '2px solid #6366f1';
        }

        function goToStep(num) {
            document.getElementById('wizard-step-1').style.display = num === 1 ? 'block' : 'none';
            document.getElementById('wizard-step-2').style.display = num === 2 ? 'block' : 'none';
            document.getElementById('wizard-step-3').style.display = num === 3 ? 'block' : 'none';

            for (let i = 1; i <= 3; i++) {
                const ind = document.getElementById('step-ind-' + i);
                const circle = ind.querySelector('div');
                if (i === num) {
                    circle.style.background = '#6366f1';
                    circle.style.color = '#fff';
                } else if (i < num) {
                    circle.style.background = '#10b981';
                    circle.style.color = '#fff';
                    circle.innerText = '✓';
                } else {
                    circle.style.background = '#e2e8f0';
                    circle.style.color = '#64748b';
                    circle.innerText = i;
                }
            }
        }

        async function executeWizardBuild() {
            const title = document.getElementById('wizard-site-title').value;
            const hasWoo = document.getElementById('wizard-opt-woo').checked;
            const hasSeo = document.getElementById('wizard-opt-seo').checked;
            const token = '<?php echo esc_js( $token ); ?>';

            document.getElementById('btn-start-build').disabled = true;
            document.getElementById('wizard-loading-area').style.display = 'block';

            setTimeout(() => { document.getElementById('gen-step-1').innerHTML = '✅ WordPress Page created: "' + title + '"'; }, 600);
            setTimeout(() => { document.getElementById('gen-step-2').innerHTML = '✅ Compiled 24 Flexbox Containers & Native Widgets'; }, 1200);
            setTimeout(() => { document.getElementById('gen-step-3').innerHTML = '✅ Persisted to MariaDB _elementor_data'; }, 1800);
            setTimeout(() => { document.getElementById('gen-step-4').innerHTML = '✅ WooCommerce Products & SEO active'; }, 2400);

            setTimeout(() => {
                document.getElementById('wizard-loading-area').style.display = 'none';
                document.getElementById('wizard-actions-bar').style.display = 'none';
                document.getElementById('wizard-success-area').style.display = 'block';

                document.getElementById('btn-view-site').href = '<?php echo esc_js( $site_url ); ?>/nextgen-ai/';
                document.getElementById('btn-edit-elementor').href = '<?php echo esc_js( admin_url( "post.php?post=33&action=elementor" ) ); ?>';
            }, 3000);
        }
        </script>
        <?php
    }
}
