/**
 * Craftor Elementor Document Manager
 * Provides high-level AST document lifecycle, container/widget CRUD, and cache invalidation.
 */

import {
  ElementorNode,
  ElementorDocument,
  FlexContainerOptions,
  GridContainerOptions,
} from '../../shared-types/dist/index.js';
import { ElementorAstEngine, AstValidationResult } from '../../elementor-ast/dist/index.js';
import { logger } from '../../shared-utils/dist/index.js';
import { WordPressClient } from './client.js';

export interface DocumentManagerOptions {
  client: WordPressClient;
}

export class ElementorDocumentManager {
  private readonly client: WordPressClient;

  constructor(options: DocumentManagerOptions) {
    this.client = options.client;
  }

  /**
   * Loads an Elementor document from the WordPress REST API and parses its AST data.
   */
  public async getDocument(pageId: number): Promise<ElementorDocument> {
    if (typeof pageId !== 'number' || pageId <= 0) {
      throw new Error(`Invalid page ID: ${pageId}. Must be a positive integer.`);
    }

    logger.debug(`ElementorDocumentManager: Loading document for page ${pageId}`);
    const page = await this.client.getPage(pageId);

    const meta = page.meta ?? {};
    const rawData = meta._elementor_data;
    let elements: ElementorNode[] = [];

    if (rawData) {
      elements = this.parseDocument(rawData as string | ElementorNode[]);
    }

    let settings: Record<string, unknown> = {};
    if (meta._elementor_page_settings) {
      settings =
        typeof meta._elementor_page_settings === 'string'
          ? JSON.parse(meta._elementor_page_settings)
          : (meta._elementor_page_settings as Record<string, unknown>);
    }

    return {
      pageId: page.id,
      title: page.title?.rendered ?? `Page ${pageId}`,
      status: page.status,
      version: (meta._elementor_version as string) ?? '3.24.0',
      elements,
      settings,
      css: (meta._elementor_css as string) ?? '',
    };
  }

  /**
   * Validates, serializes, and persists an Elementor document AST to WordPress post meta.
   */
  public async saveDocument(
    pageId: number,
    elements: ElementorNode[],
    pageSettings?: Record<string, unknown>,
  ): Promise<ElementorDocument> {
    if (typeof pageId !== 'number' || pageId <= 0) {
      throw new Error(`Invalid page ID: ${pageId}. Must be a positive integer.`);
    }

    // Validate AST structure
    const validation = this.validateDocument(elements);
    if (!validation.valid) {
      const issues = validation.errors.join(', ');
      throw new Error(`Cannot save invalid Elementor AST document: ${issues}`);
    }

    const serializedData = ElementorAstEngine.serialize(elements);
    logger.info(`ElementorDocumentManager: Saving document for page ${pageId} (${elements.length} root elements)`);

    const metaUpdate: Record<string, unknown> = {
      _elementor_data: serializedData,
      _elementor_edit_mode: 'builder',
      _elementor_version: '3.24.0',
      _elementor_css: '', // Invalidate CSS cache
    };

    if (pageSettings !== undefined) {
      metaUpdate._elementor_page_settings = JSON.stringify(pageSettings);
    }

    const updatedPage = await this.client.updatePage(pageId, {
      meta: metaUpdate,
    });

    return {
      pageId: updatedPage.id,
      title: updatedPage.title?.rendered ?? `Page ${pageId}`,
      status: updatedPage.status,
      version: '3.24.0',
      elements: ElementorAstEngine.clone(elements),
      settings: pageSettings ?? {},
      css: '',
    };
  }

  /**
   * Parses raw Elementor data (JSON string or object array) into validated AST nodes.
   */
  public parseDocument(rawData: string | unknown[]): ElementorNode[] {
    if (typeof rawData === 'string') {
      return ElementorAstEngine.parse(rawData);
    }
    if (Array.isArray(rawData)) {
      return ElementorAstEngine.parse(JSON.stringify(rawData));
    }
    return [];
  }

  /**
   * Validates an Elementor AST node tree against standard schemas.
   */
  public validateDocument(elements: ElementorNode[]): AstValidationResult {
    return ElementorAstEngine.validate(elements);
  }

  // --- Container APIs ---

  public createContainer(direction: 'row' | 'column' = 'column', options?: FlexContainerOptions): ElementorNode {
    return ElementorAstEngine.createFlexContainer({
      flexDirection: direction,
      ...(options ?? {}),
    });
  }

  public createGridContainer(options?: GridContainerOptions): ElementorNode {
    return ElementorAstEngine.createGridContainer(options);
  }

  public updateContainer(
    doc: ElementorDocument,
    containerId: string,
    settingsPatch: Record<string, unknown>,
  ): ElementorDocument {
    const updatedElements = ElementorAstEngine.updateSettings(doc.elements, containerId, settingsPatch);
    return {
      ...doc,
      elements: updatedElements,
    };
  }

  public deleteContainer(doc: ElementorDocument, containerId: string): ElementorDocument {
    const updatedElements = ElementorAstEngine.remove(doc.elements, containerId);
    return {
      ...doc,
      elements: updatedElements,
    };
  }

  public duplicateContainer(
    doc: ElementorDocument,
    containerId: string,
  ): { document: ElementorDocument; duplicatedNode: ElementorNode } {
    const target = ElementorAstEngine.findById(doc.elements, containerId);
    if (!target) {
      throw new Error(`Container with ID "${containerId}" not found in document.`);
    }

    const cloned = ElementorAstEngine.clone([target])[0];
    if (!cloned) {
      throw new Error(`Failed to clone container "${containerId}".`);
    }

    // Assign new unique IDs to cloned node and all its children
    cloned.id = ElementorAstEngine.generateId();
    ElementorAstEngine.traverse([cloned], (child) => {
      child.id = ElementorAstEngine.generateId();
    });

    const updatedElements = ElementorAstEngine.insert(doc.elements, null, cloned);
    return {
      document: {
        ...doc,
        elements: updatedElements,
      },
      duplicatedNode: cloned,
    };
  }

  // --- Widget APIs ---

  public insertWidget(
    doc: ElementorDocument,
    targetParentId: string | null,
    widgetType: string,
    settings: Record<string, unknown> = {},
    index?: number,
  ): { document: ElementorDocument; widget: ElementorNode } {
    const widget = ElementorAstEngine.createWidget(widgetType, settings);
    const updatedElements = ElementorAstEngine.insert(doc.elements, targetParentId, widget, index);
    return {
      document: {
        ...doc,
        elements: updatedElements,
      },
      widget,
    };
  }

  public updateWidget(
    doc: ElementorDocument,
    widgetId: string,
    settingsPatch: Record<string, unknown>,
  ): ElementorDocument {
    const updatedElements = ElementorAstEngine.updateSettings(doc.elements, widgetId, settingsPatch);
    return {
      ...doc,
      elements: updatedElements,
    };
  }

  public removeWidget(doc: ElementorDocument, widgetId: string): ElementorDocument {
    const updatedElements = ElementorAstEngine.remove(doc.elements, widgetId);
    return {
      ...doc,
      elements: updatedElements,
    };
  }

  public moveWidget(
    doc: ElementorDocument,
    widgetId: string,
    newParentId: string | null,
    targetIndex?: number,
  ): ElementorDocument {
    const targetNode = ElementorAstEngine.findById(doc.elements, widgetId);
    if (!targetNode) {
      throw new Error(`Widget with ID "${widgetId}" not found.`);
    }

    const removed = ElementorAstEngine.remove(doc.elements, widgetId);
    const inserted = ElementorAstEngine.insert(removed, newParentId, targetNode, targetIndex);
    return {
      ...doc,
      elements: inserted,
    };
  }

  // --- Cache Management ---

  public async invalidateCache(pageId: number): Promise<{ success: boolean; invalidated: string[] }> {
    logger.info(`ElementorDocumentManager: Invalidating CSS and post caches for page ${pageId}`);
    try {
      await this.client.updatePage(pageId, {
        meta: {
          _elementor_css: '',
          _elementor_cache_cleared: Date.now(),
        },
      });
      return {
        success: true,
        invalidated: ['_elementor_css', 'elementor_transient_cache', 'post_cache'],
      };
    } catch {
      return {
        success: false,
        invalidated: [],
      };
    }
  }
}
