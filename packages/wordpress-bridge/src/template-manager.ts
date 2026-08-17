/**
 * Craftor Elementor Template Manager
 * Handles template export, import, duplication, and cross-site portability.
 */

import {
  ElementorDocument,
  ElementorTemplateData,
} from '../../shared-types/dist/index.js';
import { ElementorAstEngine } from '../../elementor-ast/dist/index.js';
import { logger } from '../../shared-utils/dist/index.js';
import { WordPressClient } from './client.js';
import { ElementorDocumentManager } from './document-manager.js';

export interface TemplateManagerOptions {
  client: WordPressClient;
  documentManager: ElementorDocumentManager;
}

export class ElementorTemplateManager {
  private readonly client: WordPressClient;
  private readonly docManager: ElementorDocumentManager;

  constructor(options: TemplateManagerOptions) {
    this.client = options.client;
    this.docManager = options.documentManager;
  }

  /**
   * Exports an Elementor document AST as a portable template.
   */
  public async exportTemplate(pageId: number, templateTitle?: string): Promise<ElementorTemplateData> {
    logger.info(`ElementorTemplateManager: Exporting template from page ${pageId}`);
    const doc = await this.docManager.getDocument(pageId);

    return {
      title: templateTitle ?? `${doc.title} Template`,
      type: 'page',
      version: doc.version || '3.24.0',
      elements: ElementorAstEngine.clone(doc.elements),
      page_settings: doc.settings,
    };
  }

  /**
   * Imports an Elementor template AST into an existing WordPress page/post.
   */
  public async importTemplate(
    targetPageId: number,
    templateData: ElementorTemplateData,
  ): Promise<ElementorDocument> {
    logger.info(`ElementorTemplateManager: Importing template "${templateData.title}" into page ${targetPageId}`);

    if (!templateData.elements || !Array.isArray(templateData.elements)) {
      throw new Error('Invalid template data: "elements" array is required.');
    }

    // Clone elements and refresh IDs to prevent duplicates
    const importedElements = ElementorAstEngine.clone(templateData.elements);
    ElementorAstEngine.traverse(importedElements, (node) => {
      node.id = ElementorAstEngine.generateId();
    });

    return this.docManager.saveDocument(
      targetPageId,
      importedElements,
      templateData.page_settings ?? {},
    );
  }

  /**
   * Duplicates an existing Elementor page/template into a newly created WordPress page.
   */
  public async duplicateTemplate(
    sourcePageId: number,
    newTitle: string,
  ): Promise<ElementorDocument> {
    logger.info(`ElementorTemplateManager: Duplicating page ${sourcePageId} to new page "${newTitle}"`);

    const sourceDoc = await this.docManager.getDocument(sourcePageId);

    // Create a new target page in WordPress
    const newPage = await this.client.createPage({
      title: newTitle,
      status: 'draft',
      meta: {
        _elementor_edit_mode: 'builder',
      },
    });

    const clonedElements = ElementorAstEngine.clone(sourceDoc.elements);
    ElementorAstEngine.traverse(clonedElements, (node) => {
      node.id = ElementorAstEngine.generateId();
    });

    return this.docManager.saveDocument(
      newPage.id,
      clonedElements,
      sourceDoc.settings,
    );
  }
}
