/**
 * Craftor Enterprise White-Label & Agency Customization Engine
 * Manages custom branding, agency logos, plugin title rebranding, and namespace isolation.
 */

export interface WhiteLabelConfig {
  agencyName: string;
  pluginTitle: string;
  brandColor?: string;
  logoUrl?: string;
  supportEmail?: string;
  hideCraftorBranding?: boolean;
  customMenuSlug?: string;
}

export class WhiteLabelManager {
  private config: WhiteLabelConfig;

  constructor(config?: Partial<WhiteLabelConfig>) {
    this.config = {
      agencyName: config?.agencyName ?? 'Craftor AI',
      pluginTitle: config?.pluginTitle ?? 'Craftor Autonomous Engine',
      brandColor: config?.brandColor ?? '#4F46E5',
      logoUrl: config?.logoUrl ?? 'https://assets.craftor.local/logo.svg',
      supportEmail: config?.supportEmail ?? 'support@craftor.local',
      hideCraftorBranding: config?.hideCraftorBranding ?? false,
      customMenuSlug: config?.customMenuSlug ?? 'craftor-settings',
    };
  }

  public getConfig(): WhiteLabelConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<WhiteLabelConfig>): WhiteLabelConfig {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    return this.getConfig();
  }

  /**
   * Generates localized WordPress PHP constant overrides for plugin rebranding.
   */
  public generatePhpOverrides(): Record<string, string> {
    return {
      CRAFTOR_PLUGIN_NAME: this.config.pluginTitle,
      CRAFTOR_AGENCY_NAME: this.config.agencyName,
      CRAFTOR_SUPPORT_EMAIL: this.config.supportEmail ?? 'support@craftor.local',
      CRAFTOR_HIDE_BRANDING: this.config.hideCraftorBranding ? 'true' : 'false',
    };
  }
}
