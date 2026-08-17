/**
 * Craftor Visual AST Canvas Interactive Renderer
 * Translates Elementor Flex containers and widgets into responsive HTML5 visual layouts.
 */

import { ElementorNode } from '@craftor/shared-types';

export class AstCanvasRenderer {
  /**
   * Recursively renders Elementor AST nodes into styled visual HTML blocks.
   */
  public renderNode(node: ElementorNode): string {
    const isContainer = node.elType === 'container' || node.elType === 'section' || node.elType === 'column';
    const settings = node.settings || {};

    if (isContainer) {
      const flexDirection = String(settings.flex_direction || 'column');
      const justifyContent = String(settings.justify_content || 'flex-start');
      const alignItems = String(settings.align_items || 'stretch');
      const bg = settings.background_background === 'classic' && settings.background_color ? String(settings.background_color) : 'transparent';
      const padding = settings.padding ? '1.5rem' : '1rem';

      const childrenHtml = (node.elements || []).map((child) => this.renderNode(child)).join('');

      return `
        <div class="elementor-container-preview" id="node-${node.id}" style="display: flex; flex-direction: ${flexDirection}; justify-content: ${justifyContent}; align-items: ${alignItems}; background: ${bg}; padding: ${padding}; border: 1px dashed rgba(99, 102, 241, 0.4); border-radius: 8px; margin: 0.5rem 0; width: 100%; box-sizing: border-box; position: relative;">
          <span style="position: absolute; top: 4px; right: 6px; font-size: 0.65rem; font-family: monospace; color: #818CF8; background: rgba(30, 27, 75, 0.7); padding: 1px 4px; border-radius: 4px;">${node.id} (${node.elType})</span>
          ${childrenHtml}
        </div>
      `;
    }

    // Widgets
    const widgetType = node.widgetType || 'widget';
    switch (widgetType) {
      case 'heading': {
        const title = String(settings.title || 'Sample Heading');
        const align = String(settings.align || 'left');
        return `<h2 class="elementor-heading-preview" id="node-${node.id}" style="text-align: ${align}; margin: 0.5rem 0; color: #F3F4F6; font-family: 'Outfit', sans-serif;">${title}</h2>`;
      }

      case 'text-editor': {
        const editorContent = String(settings.editor || 'AI-generated dynamic content block.');
        return `<div class="elementor-text-preview" id="node-${node.id}" style="color: #9CA3AF; line-height: 1.6; margin: 0.5rem 0;">${editorContent}</div>`;
      }

      case 'button': {
        const text = String(settings.text || 'Click Action');
        const align = String(settings.align || 'left');
        return `
          <div style="text-align: ${align}; margin: 0.5rem 0;">
            <button class="elementor-button-preview" id="node-${node.id}" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #FFFFFF; font-weight: 600; padding: 0.6rem 1.4rem; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
              ${text}
            </button>
          </div>
        `;
      }

      case 'image': {
        const url = settings.image && typeof settings.image === 'object' && 'url' in settings.image ? String((settings.image as { url: string }).url) : 'https://placehold.co/600x300/1e1b4b/818cf8?text=Elementor+Image';
        return `
          <div class="elementor-image-preview" id="node-${node.id}" style="margin: 0.5rem 0; border-radius: 8px; overflow: hidden;">
            <img src="${url}" alt="Preview" style="max-width: 100%; height: auto; display: block; border-radius: 8px;" />
          </div>
        `;
      }

      default: {
        return `
          <div class="elementor-generic-widget-preview" id="node-${node.id}" style="background: rgba(31, 41, 55, 0.5); padding: 0.75rem; border-radius: 6px; margin: 0.4rem 0; font-size: 0.85rem; color: #D1D5DB;">
            [Widget: <strong>${widgetType}</strong> | ID: <code>${node.id}</code>]
          </div>
        `;
      }
    }
  }

  /**
   * Renders the complete canvas wrapper with interactive viewport switcher (Desktop, Tablet, Mobile).
   */
  public renderCanvas(nodes: ElementorNode[], viewport: 'desktop' | 'tablet' | 'mobile' = 'desktop'): string {
    const maxWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px';
    const innerHtml = nodes.map((n) => this.renderNode(n)).join('');

    return `
      <div class="ast-canvas-viewport-wrapper" style="display: flex; justify-content: center; background: #0B0F17; padding: 2rem 1rem; border-radius: 12px; border: 1px solid #1F2937; min-height: 400px;">
        <div class="ast-canvas-frame" style="width: 100%; max-width: ${maxWidth}; background: #111827; padding: 1.5rem; border-radius: 10px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); transition: max-width 0.3s ease;">
          ${innerHtml || '<div style="color: #6B7280; text-align: center; padding: 3rem;">AST canvas empty. Enter a prompt in the Playground to synthesize a layout.</div>'}
        </div>
      </div>
    `;
  }
}
