/**
 * Craftor Elementor Pro Theme Builder Template Generators
 * Generates standards-compliant AST trees for Header, Footer, Single Post, Archive, and Popup templates.
 */

import { ElementorNode, ElementorTemplateData } from '../../shared-types/dist/index.js';
import { createFlexContainer, createGridContainer, createWidgetNode } from './generators.js';

export interface HeaderTemplateOptions {
  brandName?: string;
  logoUrl?: string;
  navItems?: Array<{ label: string; url: string }>;
  ctaText?: string;
  sticky?: boolean;
}

export function createHeaderTemplate(options: HeaderTemplateOptions = {}): ElementorTemplateData {
  const {
    brandName = 'Craftor AI',
    logoUrl,
    navItems = [
      { label: 'Features', url: '#features' },
      { label: 'Docs', url: '#docs' },
      { label: 'Pricing', url: '#pricing' },
    ],
    ctaText = 'Get Started',
    sticky = true,
  } = options;

  const brandNode = logoUrl
    ? createWidgetNode('image', { image: { url: logoUrl } })
    : createWidgetNode('heading', { title: brandName, header_size: 'h3' });

  const navHtml = `<nav class="craftor-nav">${navItems
    .map((item) => `<a href="${item.url}" style="margin: 0 12px; text-decoration: none;">${item.label}</a>`)
    .join('')}</nav>`;

  const navNode = createWidgetNode('html', { html: navHtml });
  const ctaNode = createWidgetNode('button', { text: ctaText, button_type: 'primary', size: 'sm' });

  const headerContainer = createFlexContainer({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    settings: {
      sticky: sticky ? 'top' : '',
      padding: { top: '16px', bottom: '16px', left: '32px', right: '32px' },
      background_background: 'classic',
      background_color: 'rgba(15, 23, 42, 0.9)',
    },
    elements: [brandNode, navNode, ctaNode],
  });

  return {
    title: `${brandName} Header`,
    type: 'header',
    version: '3.24.0',
    elements: [headerContainer],
    page_settings: {
      template: 'elementor_header',
      conditions: [{ type: 'include', name: 'entire_site' }],
    },
  };
}

export interface FooterTemplateOptions {
  copyrightText?: string;
  columns?: Array<{ title: string; links: Array<{ label: string; url: string }> }>;
}

export function createFooterTemplate(options: FooterTemplateOptions = {}): ElementorTemplateData {
  const {
    copyrightText = `© ${new Date().getFullYear()} Craftor Inc. All rights reserved.`,
    columns = [
      {
        title: 'Product',
        links: [
          { label: 'MCP Server', url: '/mcp' },
          { label: 'Elementor Bridge', url: '/elementor' },
          { label: 'WooCommerce SDK', url: '/woocommerce' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Documentation', url: '/docs' },
          { label: 'API Reference', url: '/api' },
          { label: 'Community', url: '/community' },
        ],
      },
    ],
  } = options;

  const colContainers = columns.map((col) => {
    const listHtml = `<ul style="list-style: none; padding: 0;">${col.links
      .map((l) => `<li style="margin-bottom: 8px;"><a href="${l.url}" style="color: #94a3b8; text-decoration: none;">${l.label}</a></li>`)
      .join('')}</ul>`;

    return createFlexContainer({
      flexDirection: 'column',
      elements: [
        createWidgetNode('heading', { title: col.title, header_size: 'h5' }),
        createWidgetNode('html', { html: listHtml }),
      ],
    });
  });

  const footerGrid = createGridContainer({
    columns: columns.length,
    gap: 32,
    elements: colContainers,
  });

  const copyrightNode = createWidgetNode('text-editor', {
    editor: `<p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 32px;">${copyrightText}</p>`,
  });

  const footerWrapper = createFlexContainer({
    flexDirection: 'column',
    settings: {
      padding: { top: '64px', bottom: '32px', left: '32px', right: '32px' },
      background_color: '#0b0f19',
    },
    elements: [footerGrid, copyrightNode],
  });

  return {
    title: 'Site Footer',
    type: 'footer',
    version: '3.24.0',
    elements: [footerWrapper],
    page_settings: {
      template: 'elementor_footer',
      conditions: [{ type: 'include', name: 'entire_site' }],
    },
  };
}

export interface SinglePostTemplateOptions {
  showFeaturedImage?: boolean;
  showAuthorBio?: boolean;
  showComments?: boolean;
}

export function createSinglePostTemplate(options: SinglePostTemplateOptions = {}): ElementorTemplateData {
  const { showFeaturedImage = true, showAuthorBio = true, showComments = true } = options;

  const elements: ElementorNode[] = [];

  // Title & Meta
  elements.push(
    createWidgetNode('theme-post-title', { title: '[Dynamic: Post Title]', header_size: 'h1' }),
    createWidgetNode('post-info', { meta_data: ['author', 'date', 'comments'] }),
  );

  if (showFeaturedImage) {
    elements.push(createWidgetNode('theme-post-featured-image', { size: 'full' }));
  }

  // Content
  elements.push(createWidgetNode('theme-post-content', {}));

  if (showAuthorBio) {
    elements.push(createWidgetNode('author-box', { source: 'current' }));
  }

  if (showComments) {
    elements.push(createWidgetNode('post-comments', { source: 'current' }));
  }

  const postContainer = createFlexContainer({
    flexDirection: 'column',
    settings: {
      max_width: { unit: 'px', size: 840 },
      margin: { top: '40px', bottom: '60px', left: 'auto', right: 'auto' },
    },
    elements,
  });

  return {
    title: 'Single Post Layout',
    type: 'single',
    version: '3.24.0',
    elements: [postContainer],
    page_settings: {
      template: 'elementor_single_post',
      conditions: [{ type: 'include', name: 'singular', sub_name: 'post' }],
    },
  };
}
