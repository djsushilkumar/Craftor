<?php
namespace Craftor\Pro;

use Craftor\Pro\Licensing\LicenseManager;
use Craftor\Pro\LiveSync\LiveSyncEngine;
use Craftor\Pro\WooCommerce\WooCommercePro;
use Craftor\Pro\ThemeBuilder\ThemeBuilderEngine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Plugin {
    private static ?self $instance = null;
    private LicenseManager $license_manager;
    private LiveSyncEngine $livesync_engine;
    private WooCommercePro $woocommerce_pro;
    private ThemeBuilderEngine $theme_builder;

    public static function instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init(): void {
        $this->license_manager = new LicenseManager();
        $this->license_manager->init();

        $this->livesync_engine = new LiveSyncEngine();
        $this->livesync_engine->init();

        $this->woocommerce_pro = new WooCommercePro();
        $this->woocommerce_pro->init();

        $this->theme_builder = new ThemeBuilderEngine();
        $this->theme_builder->init();
    }

    public function get_license_manager(): LicenseManager {
        return $this->license_manager;
    }
}
