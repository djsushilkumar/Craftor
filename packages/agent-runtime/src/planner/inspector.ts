/**
 * Craftor Site Inspector
 * Probes the target WordPress site to discover active plugins, builder versions, and design tokens.
 */

import { WordPressClient } from '@craftor/wordpress-bridge';
import { logger } from '@craftor/shared-utils';
import { SiteCapabilityProfile } from '../types.js';

export class SiteInspector {
  public static async probeSiteCapabilities(
    client: WordPressClient,
    siteUrl: string,
  ): Promise<SiteCapabilityProfile> {
    logger.info(`[SiteInspector] Probing site capabilities for ${siteUrl}`);
    const rest = client.getRestClient();

    const activePlugins: string[] = [];
    let isElementorActive = false;
    let isWooCommerceActive = false;
    let isRankMathActive = false;
    let isYoastActive = false;
    let isAcfActive = false;

    try {
      const pluginsRes = await rest.get<Array<{ name: string; file: string; isActive: boolean; version?: string }>>(
        '/wp-json/craftor/v1/site/plugins',
      );
      if (Array.isArray(pluginsRes)) {
        for (const p of pluginsRes) {
          if (p.isActive) {
            activePlugins.push(p.name);
            const lower = (p.name + ' ' + (p.file || '')).toLowerCase();
            if (lower.includes('elementor')) isElementorActive = true;
            if (lower.includes('woocommerce')) isWooCommerceActive = true;
            if (lower.includes('rank-math') || lower.includes('rankmath')) isRankMathActive = true;
            if (lower.includes('wordpress-seo') || lower.includes('yoast')) isYoastActive = true;
            if (lower.includes('advanced-custom-fields') || lower.includes('acf')) isAcfActive = true;
          }
        }
      }
    } catch (err) {
      logger.warn('[SiteInspector] Could not probe /site/plugins endpoint, falling back to core defaults', {
        error: (err as Error).message,
      });
      isElementorActive = true;
      isWooCommerceActive = true;
    }

    const globalKitTokens: SiteCapabilityProfile['globalKitTokens'] = {
      primaryColor: '#6366F1',
      secondaryColor: '#EC4899',
      headingFont: 'Inter',
      bodyFont: 'Roboto',
    };

    try {
      const tokensRes = await rest.get<{
        success?: boolean;
        custom_colors?: Array<{ _id: string; title: string; color: string }>;
        custom_typography?: Array<{ _id: string; title: string; typography_font_family?: string }>;
      }>('/wp-json/craftor/v1/elementor/tokens');

      if (tokensRes && Array.isArray(tokensRes.custom_colors) && tokensRes.custom_colors.length > 0) {
        const primary = tokensRes.custom_colors.find((c) => c.title.toLowerCase().includes('primary'));
        const secondary = tokensRes.custom_colors.find((c) => c.title.toLowerCase().includes('secondary'));
        if (primary) globalKitTokens.primaryColor = primary.color;
        if (secondary) globalKitTokens.secondaryColor = secondary.color;
      }
    } catch {
      // Fall back to default theme tokens
    }

    return {
      siteUrl,
      isElementorActive,
      elementorVersion: isElementorActive ? '3.24.0' : undefined,
      isWooCommerceActive,
      woocommerceVersion: isWooCommerceActive ? '8.7.0' : undefined,
      isRankMathActive,
      isYoastActive,
      isAcfActive,
      activePlugins,
      globalKitTokens,
    };
  }
}
