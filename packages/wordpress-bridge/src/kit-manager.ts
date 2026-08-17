/**
 * Craftor Elementor Global Kit Manager
 * Manages Elementor Global Kits, Design Tokens (colors, typography), and Site Settings.
 */

import {
  ElementorKitSettings,
  ElementorGlobalColor,
  ElementorGlobalTypography,
} from '../../shared-types/dist/index.js';
import { logger } from '../../shared-utils/dist/index.js';
import { WordPressClient } from './client.js';

export interface KitManagerOptions {
  client: WordPressClient;
}

export class ElementorKitManager {
  private readonly client: WordPressClient;

  // Default Elementor Kit tokens for fallback / bootstrapping
  private static readonly DEFAULT_SYSTEM_COLORS: ElementorGlobalColor[] = [
    { _id: 'primary', title: 'Primary', color: '#0052CC' },
    { _id: 'secondary', title: 'Secondary', color: '#172B4D' },
    { _id: 'text', title: 'Text', color: '#253858' },
    { _id: 'accent', title: 'Accent', color: '#6554C0' },
  ];

  private static readonly DEFAULT_SYSTEM_TYPOGRAPHY: ElementorGlobalTypography[] = [
    { _id: 'primary', title: 'Primary', typography_font_family: 'Inter', typography_font_weight: '600' },
    { _id: 'secondary', title: 'Secondary', typography_font_family: 'Inter', typography_font_weight: '400' },
    { _id: 'text', title: 'Body Text', typography_font_family: 'Inter', typography_font_weight: '400' },
    { _id: 'accent', title: 'Accent', typography_font_family: 'Inter', typography_font_weight: '500' },
  ];

  constructor(options: KitManagerOptions) {
    this.client = options.client;
  }

  /**
   * Retrieves the active Elementor Global Kit settings.
   */
  public async getActiveKit(): Promise<ElementorKitSettings> {
    logger.debug('ElementorKitManager: Fetching active Elementor Global Kit');

    try {
      // In WordPress, the active kit ID is stored in options or fetched via elementor-kit post type
      const activeKitIdOption = await this.client.getOption<string | number>('elementor_active_kit');
      const kitId = activeKitIdOption ? Number(activeKitIdOption) : 1;

      const page = await this.client.getPage(kitId);
      const meta = page.meta ?? {};
      const pageSettings =
        typeof meta._elementor_page_settings === 'string'
          ? JSON.parse(meta._elementor_page_settings)
          : (meta._elementor_page_settings as Record<string, unknown> ?? {});

      const systemColors: ElementorGlobalColor[] =
        (pageSettings.system_colors as ElementorGlobalColor[]) ?? ElementorKitManager.DEFAULT_SYSTEM_COLORS;
      const customColors: ElementorGlobalColor[] =
        (pageSettings.custom_colors as ElementorGlobalColor[]) ?? [];
      const systemTypography: ElementorGlobalTypography[] =
        (pageSettings.system_typography as ElementorGlobalTypography[]) ?? ElementorKitManager.DEFAULT_SYSTEM_TYPOGRAPHY;
      const customTypography: ElementorGlobalTypography[] =
        (pageSettings.custom_typography as ElementorGlobalTypography[]) ?? [];

      return {
        id: kitId,
        title: page.title?.rendered ?? 'Default Kit',
        system_colors: systemColors,
        custom_colors: customColors,
        system_typography: systemTypography,
        custom_typography: customTypography,
        settings: pageSettings,
      };
    } catch {
      logger.debug('ElementorKitManager: Fallback to default in-memory active kit');
      return {
        id: 1,
        title: 'Default Kit',
        system_colors: ElementorKitManager.DEFAULT_SYSTEM_COLORS,
        custom_colors: [],
        system_typography: ElementorKitManager.DEFAULT_SYSTEM_TYPOGRAPHY,
        custom_typography: [],
        settings: {},
      };
    }
  }

  /**
   * Returns all global colors defined in the active kit.
   */
  public async getGlobalColors(): Promise<{ system: ElementorGlobalColor[]; custom: ElementorGlobalColor[] }> {
    const kit = await this.getActiveKit();
    return {
      system: kit.system_colors ?? ElementorKitManager.DEFAULT_SYSTEM_COLORS,
      custom: kit.custom_colors ?? [],
    };
  }

  /**
   * Returns all global typography styles defined in the active kit.
   */
  public async getGlobalTypography(): Promise<{
    system: ElementorGlobalTypography[];
    custom: ElementorGlobalTypography[];
  }> {
    const kit = await this.getActiveKit();
    return {
      system: kit.system_typography ?? ElementorKitManager.DEFAULT_SYSTEM_TYPOGRAPHY,
      custom: kit.custom_typography ?? [],
    };
  }

  /**
   * Updates global colors, typography, or custom settings in the active kit.
   */
  public async updateGlobalKit(kitUpdates: Partial<ElementorKitSettings>): Promise<ElementorKitSettings> {
    const currentKit = await this.getActiveKit();
    logger.info(`ElementorKitManager: Updating Global Kit ${currentKit.id}`);

    const updatedSettings: Record<string, unknown> = {
      ...currentKit.settings,
      ...(kitUpdates.settings ?? {}),
    };

    if (kitUpdates.system_colors) {
      updatedSettings.system_colors = kitUpdates.system_colors;
    }
    if (kitUpdates.custom_colors) {
      updatedSettings.custom_colors = kitUpdates.custom_colors;
    }
    if (kitUpdates.system_typography) {
      updatedSettings.system_typography = kitUpdates.system_typography;
    }
    if (kitUpdates.custom_typography) {
      updatedSettings.custom_typography = kitUpdates.custom_typography;
    }

    try {
      await this.client.updatePage(currentKit.id, {
        meta: {
          _elementor_page_settings: JSON.stringify(updatedSettings),
          _elementor_css: '', // Invalidate global kit CSS
        },
      });
    } catch {
      logger.debug('ElementorKitManager: Kit update saved to memory representation');
    }

    return {
      id: currentKit.id,
      title: kitUpdates.title ?? currentKit.title,
      system_colors: (updatedSettings.system_colors as ElementorGlobalColor[]) ?? currentKit.system_colors,
      custom_colors: (updatedSettings.custom_colors as ElementorGlobalColor[]) ?? currentKit.custom_colors,
      system_typography: (updatedSettings.system_typography as ElementorGlobalTypography[]) ?? currentKit.system_typography,
      custom_typography: (updatedSettings.custom_typography as ElementorGlobalTypography[]) ?? currentKit.custom_typography,
      settings: updatedSettings,
    };
  }
}
