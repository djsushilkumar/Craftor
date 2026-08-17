/**
 * Craftor AST Token Compression Engine v2
 * Minimizes Elementor AST payloads for LLM context windows by pruning redundant defaults and optimizing keys.
 */

import { ElementorNode } from '../../shared-types/dist/index.js';

export interface CompressionResult {
  compressedAst: ElementorNode[];
  originalBytes: number;
  compressedBytes: number;
  savingsPercentage: string;
}

export class AstCompressor {
  /**
   * Compresses an Elementor AST by pruning empty settings, empty arrays, and stripping default keys.
   */
  public compress(nodes: ElementorNode[]): CompressionResult {
    const encoder = new TextEncoder();
    const originalJson = JSON.stringify(nodes);
    const originalBytes = encoder.encode(originalJson).length;

    const cleanNodes = this.cleanNodeList(nodes);
    const compressedJson = JSON.stringify(cleanNodes);
    const compressedBytes = encoder.encode(compressedJson).length;

    const savings = originalBytes > 0
      ? (((originalBytes - compressedBytes) / originalBytes) * 100).toFixed(1) + '%'
      : '0.0%';

    return {
      compressedAst: cleanNodes,
      originalBytes,
      compressedBytes,
      savingsPercentage: savings,
    };
  }

  private cleanNodeList(nodes: ElementorNode[]): ElementorNode[] {
    return nodes.map((node) => {
      const cloned: ElementorNode = {
        id: node.id,
        elType: node.elType,
        settings: this.pruneEmptyValues(node.settings || {}),
        elements: node.elements && node.elements.length > 0 ? this.cleanNodeList(node.elements) : [],
        isInner: node.isInner,
        widgetType: node.widgetType,
      };

      // Remove undefined properties
      if (!cloned.isInner) delete cloned.isInner;
      if (!cloned.widgetType) delete cloned.widgetType;
      if (cloned.elements.length === 0) delete (cloned as unknown as Record<string, unknown>).elements;
      if (Object.keys(cloned.settings).length === 0) delete (cloned as unknown as Record<string, unknown>).settings;

      return cloned;
    });
  }

  private pruneEmptyValues(obj: Record<string, unknown>): Record<string, unknown> {
    const pruned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '' && value !== false) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nested = this.pruneEmptyValues(value as Record<string, unknown>);
          if (Object.keys(nested).length > 0) {
            pruned[key] = nested;
          }
        } else {
          pruned[key] = value;
        }
      }
    }
    return pruned;
  }
}
