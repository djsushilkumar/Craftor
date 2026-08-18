/**
 * Craftor Gutenberg <-> Elementor AST Bi-Directional Bridge
 * Converts Elementor JSON AST nodes to WordPress Gutenberg Block Comments (FSE) and vice versa.
 */

import { ElementorNode } from '../../shared-types/dist/index.js';
import { generateHexUuid } from '../../shared-utils/dist/index.js';

export interface GutenbergBlock {
  blockName: string;
  attrs: Record<string, unknown>;
  innerBlocks: GutenbergBlock[];
  innerHTML: string;
  innerContent: string[];
}

export class GutenbergBridge {
  /**
   * Converts Elementor AST Node tree into native WordPress Block HTML comments.
   */
  public static elementorToGutenberg(nodes: ElementorNode[]): string {
    const blocksHtml: string[] = [];

    for (const node of nodes) {
      if (node.elType === 'container' || node.elType === 'section') {
        const isRow = node.settings?.flex_direction === 'row';
        const children = this.elementorToGutenberg(node.elements || []);
        const blockAttrs = JSON.stringify({
          layout: {
            type: isRow ? 'flex' : 'default',
            flexWrap: 'nowrap',
          },
          style: {
            color: {
              background: node.settings?.background_color || undefined,
            },
          },
        });

        blocksHtml.push(
          `<!-- wp:group ${blockAttrs} -->\n<div class="wp-block-group">\n${children}\n</div>\n<!-- /wp:group -->`
        );
      } else if (node.widgetType === 'heading') {
        const title = String(node.settings?.title || '');
        const level = node.settings?.header_size === 'h1' ? 1 : node.settings?.header_size === 'h3' ? 3 : 2;
        blocksHtml.push(
          `<!-- wp:heading {"level":${level}} -->\n<h${level} class="wp-block-heading">${title}</h${level}>\n<!-- /wp:heading -->`
        );
      } else if (node.widgetType === 'text-editor') {
        const text = String(node.settings?.editor || '');
        blocksHtml.push(
          `<!-- wp:paragraph -->\n<p>${text.replace(/<\/?p[^>]*>/g, '')}</p>\n<!-- /wp:paragraph -->`
        );
      } else if (node.widgetType === 'button') {
        const text = String(node.settings?.text || 'Click Action');
        const url = node.settings?.link && typeof node.settings.link === 'object' && 'url' in node.settings.link
          ? String((node.settings.link as { url: string }).url)
          : '#';
        blocksHtml.push(
          `<!-- wp:buttons -->\n<div class="wp-block-buttons">\n<!-- wp:button -->\n<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${url}">${text}</a></div>\n<!-- /wp:button -->\n</div>\n<!-- /wp:buttons -->`
        );
      } else if (node.widgetType === 'image') {
        const url = node.settings?.image && typeof node.settings.image === 'object' && 'url' in node.settings.image
          ? String((node.settings.image as { url: string }).url)
          : 'https://via.placeholder.com/600x400';
        blocksHtml.push(
          `<!-- wp:image -->\n<figure class="wp-block-image"><img src="${url}" alt="Elementor Image"/></figure>\n<!-- /wp:image -->`
        );
      }
    }

    return blocksHtml.join('\n\n');
  }

  /**
   * Converts Gutenberg Block HTML markup into structured Elementor AST nodes.
   */
  public static gutenbergToElementor(blockHtml: string): ElementorNode[] {
    const nodes: ElementorNode[] = [];

    // Parse Headings
    const headingRegex = /<!--\s*wp:heading(?:\s+\{.*?\})?\s*-->\s*<h([1-6])[^>]*>(.*?)<\/h\1>\s*<!--\s*\/wp:heading\s*-->/gis;
    const headingMatches = Array.from(blockHtml.matchAll(headingRegex));
    for (const match of headingMatches) {
      const level = match[1] || '2';
      const title = (match[2] || '').trim();
      if (title) {
        nodes.push({
          id: generateHexUuid(7),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title,
            header_size: `h${level}`,
          },
          elements: [],
        });
      }
    }

    // Parse Paragraphs
    const paraRegex = /<!--\s*wp:paragraph(?:\s+\{.*?\})?\s*-->\s*<p[^>]*>(.*?)<\/p>\s*<!--\s*\/wp:paragraph\s*-->/gis;
    const paraMatches = Array.from(blockHtml.matchAll(paraRegex));
    for (const match of paraMatches) {
      const text = (match[1] || '').trim();
      if (text) {
        nodes.push({
          id: generateHexUuid(7),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: `<p>${text}</p>`,
          },
          elements: [],
        });
      }
    }

    // Parse Buttons
    const buttonRegex = /<a[^>]*class="[^"]*wp-block-button__link[^"]*"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis;
    const buttonMatches = Array.from(blockHtml.matchAll(buttonRegex));
    for (const match of buttonMatches) {
      const url = match[1] || '#';
      const text = (match[2] || '').trim();
      if (text) {
        nodes.push({
          id: generateHexUuid(7),
          elType: 'widget',
          widgetType: 'button',
          settings: {
            text,
            link: { url },
          },
          elements: [],
        });
      }
    }

    // If root container wrap needed
    if (nodes.length > 0) {
      return [
        {
          id: generateHexUuid(7),
          elType: 'container',
          isInner: false,
          settings: {
            flex_direction: 'column',
            justify_content: 'flex-start',
            align_items: 'stretch',
          },
          elements: nodes,
        },
      ];
    }

    return [];
  }
}
