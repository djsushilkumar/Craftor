import {
  ElementorNode,
  FlexContainerOptions,
  GridContainerOptions,
} from '../../shared-types/dist/index.js';
import {
  createFlexContainer,
  createGridContainer,
  createWidgetNode,
  generateElementId,
} from './generators.js';
import { parseAst, serializeAst } from './parser.js';
import { validateAst, AstValidationResult } from './validator.js';
import {
  cloneTree,
  findNodeById,
  insertNode,
  removeNode,
  traverseNodes,
  updateNodeSettings,
} from './traversal.js';

export class ElementorAstEngine {
  public static createContainer(direction: 'row' | 'column' = 'column'): ElementorNode {
    return createFlexContainer({ flexDirection: direction });
  }

  public static createFlexContainer(options?: FlexContainerOptions): ElementorNode {
    return createFlexContainer(options);
  }

  public static createGridContainer(options?: GridContainerOptions): ElementorNode {
    return createGridContainer(options);
  }

  public static createWidget(
    widgetType: string,
    settings?: Record<string, unknown>,
    id?: string,
  ): ElementorNode {
    return createWidgetNode(widgetType, settings, id);
  }

  public static generateId(): string {
    return generateElementId();
  }

  public static deserialize(jsonString: string): ElementorNode[] {
    return parseAst(jsonString);
  }

  public static parse(jsonString: string): ElementorNode[] {
    return parseAst(jsonString);
  }

  public static serialize(nodes: ElementorNode[], pretty: boolean = false): string {
    return serializeAst(nodes, pretty);
  }

  public static validate(nodes: ElementorNode[]): AstValidationResult {
    return validateAst(nodes);
  }

  public static findById(nodes: ElementorNode[], id: string): ElementorNode | null {
    return findNodeById(nodes, id);
  }

  public static insert(
    nodes: ElementorNode[],
    targetParentId: string | null,
    newNode: ElementorNode,
    index?: number,
  ): ElementorNode[] {
    return insertNode(nodes, targetParentId, newNode, index);
  }

  public static remove(nodes: ElementorNode[], id: string): ElementorNode[] {
    return removeNode(nodes, id);
  }

  public static updateSettings(
    nodes: ElementorNode[],
    id: string,
    patch: Record<string, unknown>,
  ): ElementorNode[] {
    return updateNodeSettings(nodes, id, patch);
  }

  public static clone(nodes: ElementorNode[]): ElementorNode[] {
    return cloneTree(nodes);
  }

  public static traverse(
    nodes: ElementorNode[],
    visitor: (node: ElementorNode, parent: ElementorNode | null, depth: number) => void,
  ): void {
    traverseNodes(nodes, visitor);
  }
}
