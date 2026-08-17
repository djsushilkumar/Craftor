/**
 * Craftor Elementor AST Diffing Engine
 * Calculates precise structural and property changes between two Elementor AST trees.
 */

import { ElementorNode } from '../../shared-types/dist/index.js';

export type DiffChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface PropertyDiff {
  path: string;
  beforeValue?: unknown;
  afterValue?: unknown;
}

export interface NodeDiff {
  id: string;
  elType: string;
  changeType: DiffChangeType;
  widgetType?: string;
  propertyChanges?: PropertyDiff[];
  childrenChanges?: NodeDiff[];
}

export interface AstDiffResult {
  hasChanges: boolean;
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  unchangedCount: number;
  rootDiffs: NodeDiff[];
}

function compareSettings(
  beforeSettings: Record<string, unknown> = {},
  afterSettings: Record<string, unknown> = {},
): PropertyDiff[] {
  const diffs: PropertyDiff[] = [];
  const allKeys = new Set([...Object.keys(beforeSettings), ...Object.keys(afterSettings)]);

  for (const key of allKeys) {
    const valA = beforeSettings[key];
    const valB = afterSettings[key];
    const strA = JSON.stringify(valA);
    const strB = JSON.stringify(valB);

    if (strA !== strB) {
      diffs.push({
        path: `settings.${key}`,
        beforeValue: valA,
        afterValue: valB,
      });
    }
  }

  return diffs;
}

export function diffAst(beforeNodes: ElementorNode[], afterNodes: ElementorNode[]): AstDiffResult {
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  function diffNode(beforeNode?: ElementorNode, afterNode?: ElementorNode): NodeDiff {
    if (!beforeNode && afterNode) {
      addedCount++;
      return {
        id: afterNode.id,
        elType: afterNode.elType,
        widgetType: afterNode.widgetType,
        changeType: 'added',
        childrenChanges: (afterNode.elements || []).map((child) => diffNode(undefined, child)),
      };
    }

    if (beforeNode && !afterNode) {
      removedCount++;
      return {
        id: beforeNode.id,
        elType: beforeNode.elType,
        widgetType: beforeNode.widgetType,
        changeType: 'removed',
        childrenChanges: (beforeNode.elements || []).map((child) => diffNode(child, undefined)),
      };
    }

    if (beforeNode && afterNode) {
      const propDiffs = compareSettings(beforeNode.settings, afterNode.settings);
      const isModified = propDiffs.length > 0;

      if (isModified) {
        modifiedCount++;
      } else {
        unchangedCount++;
      }

      const maxChildren = Math.max(
        (beforeNode.elements || []).length,
        (afterNode.elements || []).length,
      );
      const childrenChanges: NodeDiff[] = [];

      for (let i = 0; i < maxChildren; i++) {
        const childBefore = beforeNode.elements?.[i];
        const childAfter = afterNode.elements?.[i];
        childrenChanges.push(diffNode(childBefore, childAfter));
      }

      return {
        id: afterNode.id,
        elType: afterNode.elType,
        widgetType: afterNode.widgetType,
        changeType: isModified ? 'modified' : 'unchanged',
        propertyChanges: propDiffs.length > 0 ? propDiffs : undefined,
        childrenChanges: childrenChanges.length > 0 ? childrenChanges : undefined,
      };
    }

    throw new Error('diffNode called with both before and after undefined');
  }

  const maxRoots = Math.max((beforeNodes || []).length, (afterNodes || []).length);
  const rootDiffs: NodeDiff[] = [];

  for (let i = 0; i < maxRoots; i++) {
    const rootBefore = beforeNodes?.[i];
    const rootAfter = afterNodes?.[i];
    rootDiffs.push(diffNode(rootBefore, rootAfter));
  }

  const hasChanges = addedCount > 0 || removedCount > 0 || modifiedCount > 0;

  return {
    hasChanges,
    addedCount,
    removedCount,
    modifiedCount,
    unchangedCount,
    rootDiffs,
  };
}
