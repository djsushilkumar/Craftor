/**
 * Craftor Elementor Dynamic Tags & Custom Field Bindings
 * Generates and parses Elementor dynamic tag syntax [elementor-tag id="..." settings="..."]
 */

import { ElementorNode } from '../../shared-types/dist/index.js';

export interface DynamicTagDefinition {
  name: string;
  tag: string;
  settings?: Record<string, unknown>;
}

export function createDynamicTag(tag: string, settings: Record<string, unknown> = {}): string {
  const encodedSettings = encodeURIComponent(JSON.stringify(settings));
  return `[elementor-tag id="${tag}" settings="${encodedSettings}"]`;
}

export const DYNAMIC_TAG_PRESETS = {
  postTitle: () => createDynamicTag('post-title'),
  postDate: (format = 'F j, Y') => createDynamicTag('post-date', { format }),
  postExcerpt: (length = 25) => createDynamicTag('post-excerpt', { max_length: length }),
  featuredImage: () => createDynamicTag('post-featured-image'),
  authorName: () => createDynamicTag('author-name'),
  authorBio: () => createDynamicTag('author-bio'),
  acfField: (key: string) => createDynamicTag('acf-key', { key }),
  wooProductPrice: () => createDynamicTag('woocommerce-product-price-tag'),
  wooProductSku: () => createDynamicTag('woocommerce-product-sku-tag'),
  wooProductStock: () => createDynamicTag('woocommerce-product-stock-tag'),
  siteTitle: () => createDynamicTag('site-title'),
  siteTagline: () => createDynamicTag('site-tagline'),
} as const;

export function injectDynamicTag(
  node: ElementorNode,
  settingKey: string,
  tagString: string,
): ElementorNode {
  return {
    ...node,
    settings: {
      ...node.settings,
      __dynamic__: {
        ...((node.settings.__dynamic__ as Record<string, string>) || {}),
        [settingKey]: tagString,
      },
      [settingKey]: tagString,
    },
  };
}
