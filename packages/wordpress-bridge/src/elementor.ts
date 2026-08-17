/**
 * Craftor Elementor Bridge
 * Unified bridge connecting the Elementor AST Engine to the WordPress REST API runtime.
 */

import {
  ElementorNode,
  ElementorDocument,
  ElementorTemplateData,
  ElementorKitSettings,
  FlexContainerOptions,
  GridContainerOptions,
} from '../../shared-types/dist/index.js';
import { ElementorAstEngine, AstValidationResult } from '../../elementor-ast/dist/index.js';
import { WordPressClient } from './client.js';
import { ElementorDocumentManager } from './document-manager.js';
import { ElementorTemplateManager } from './template-manager.js';
import { ElementorKitManager } from './kit-manager.js';

export interface ElementorBridgeOptions {
  client: WordPressClient;
}

export class ElementorBridge {
  public readonly client: WordPressClient;
  public readonly documents: ElementorDocumentManager;
  public readonly templates: ElementorTemplateManager;
  public readonly kits: ElementorKitManager;

  constructor(options: ElementorBridgeOptions) {
    this.client = options.client;
    this.documents = new ElementorDocumentManager({ client: this.client });
    this.templates = new ElementorTemplateManager({
      client: this.client,
      documentManager: this.documents,
    });
    this.kits = new ElementorKitManager({ client: this.client });
  }

  // --- Shortcut Document Methods ---

  public async getDocument(pageId: number): Promise<ElementorDocument> {
    return this.documents.getDocument(pageId);
  }

  public async saveDocument(
    pageId: number,
    elements: ElementorNode[],
    settings?: Record<string, unknown>,
  ): Promise<ElementorDocument> {
    return this.documents.saveDocument(pageId, elements, settings);
  }

  public parseDocument(rawData: string | unknown[]): ElementorNode[] {
    return this.documents.parseDocument(rawData);
  }

  public validateDocument(elements: ElementorNode[]): AstValidationResult {
    return this.documents.validateDocument(elements);
  }

  // --- Shortcut Container Methods ---

  public createContainer(direction: 'row' | 'column' = 'column', options?: FlexContainerOptions): ElementorNode {
    return this.documents.createContainer(direction, options);
  }

  public createGridContainer(options?: GridContainerOptions): ElementorNode {
    return this.documents.createGridContainer(options);
  }

  public updateContainer(
    doc: ElementorDocument,
    containerId: string,
    settingsPatch: Record<string, unknown>,
  ): ElementorDocument {
    return this.documents.updateContainer(doc, containerId, settingsPatch);
  }

  public deleteContainer(doc: ElementorDocument, containerId: string): ElementorDocument {
    return this.documents.deleteContainer(doc, containerId);
  }

  public duplicateContainer(
    doc: ElementorDocument,
    containerId: string,
  ): { document: ElementorDocument; duplicatedNode: ElementorNode } {
    return this.documents.duplicateContainer(doc, containerId);
  }

  // --- Shortcut Widget Methods ---

  public insertWidget(
    doc: ElementorDocument,
    targetParentId: string | null,
    widgetType: string,
    settings: Record<string, unknown> = {},
    index?: number,
  ): { document: ElementorDocument; widget: ElementorNode } {
    return this.documents.insertWidget(doc, targetParentId, widgetType, settings, index);
  }

  public updateWidget(
    doc: ElementorDocument,
    widgetId: string,
    settingsPatch: Record<string, unknown>,
  ): ElementorDocument {
    return this.documents.updateWidget(doc, widgetId, settingsPatch);
  }

  public removeWidget(doc: ElementorDocument, widgetId: string): ElementorDocument {
    return this.documents.removeWidget(doc, widgetId);
  }

  public moveWidget(
    doc: ElementorDocument,
    widgetId: string,
    newParentId: string | null,
    targetIndex?: number,
  ): ElementorDocument {
    return this.documents.moveWidget(doc, widgetId, newParentId, targetIndex);
  }

  // --- Shortcut Template Methods ---

  public async exportTemplate(pageId: number, title?: string): Promise<ElementorTemplateData> {
    return this.templates.exportTemplate(pageId, title);
  }

  public async importTemplate(targetPageId: number, template: ElementorTemplateData): Promise<ElementorDocument> {
    return this.templates.importTemplate(targetPageId, template);
  }

  public async duplicateTemplate(sourcePageId: number, newTitle: string): Promise<ElementorDocument> {
    return this.templates.duplicateTemplate(sourcePageId, newTitle);
  }

  // --- Shortcut Kit Methods ---

  public async getActiveKit(): Promise<ElementorKitSettings> {
    return this.kits.getActiveKit();
  }

  public async getGlobalColors() {
    return this.kits.getGlobalColors();
  }

  public async getGlobalTypography() {
    return this.kits.getGlobalTypography();
  }

  public async updateGlobalKit(kitUpdates: Partial<ElementorKitSettings>): Promise<ElementorKitSettings> {
    return this.kits.updateGlobalKit(kitUpdates);
  }

  // --- Shortcut Cache Invalidation ---

  public async invalidateCache(pageId: number) {
    return this.documents.invalidateCache(pageId);
  }

  // Direct access to static AST Engine
  public static readonly AST = ElementorAstEngine;
}
