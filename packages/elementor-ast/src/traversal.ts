import { ElementorNode } from '../../shared-types/dist/index.js';

export function cloneTree(nodes: ElementorNode[]): ElementorNode[] {
  return JSON.parse(JSON.stringify(nodes)) as ElementorNode[];
}

export function findNodeById(nodes: ElementorNode[], id: string): ElementorNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.elements && node.elements.length > 0) {
      const found = findNodeById(node.elements, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function traverseNodes(
  nodes: ElementorNode[],
  visitor: (node: ElementorNode, parent: ElementorNode | null, depth: number) => void,
  parent: ElementorNode | null = null,
  depth: number = 0,
): void {
  for (const node of nodes) {
    visitor(node, parent, depth);
    if (node.elements && node.elements.length > 0) {
      traverseNodes(node.elements, visitor, node, depth + 1);
    }
  }
}

export function insertNode(
  nodes: ElementorNode[],
  targetParentId: string | null,
  newNode: ElementorNode,
  index?: number,
): ElementorNode[] {
  const tree = cloneTree(nodes);

  if (targetParentId === null) {
    if (index !== undefined && index >= 0 && index <= tree.length) {
      tree.splice(index, 0, newNode);
    } else {
      tree.push(newNode);
    }
    return tree;
  }

  function insertRecursive(currentNodes: ElementorNode[]): boolean {
    for (const node of currentNodes) {
      if (node.id === targetParentId) {
        if (!node.elements) {
          node.elements = [];
        }
        if (index !== undefined && index >= 0 && index <= node.elements.length) {
          node.elements.splice(index, 0, newNode);
        } else {
          node.elements.push(newNode);
        }
        return true;
      }
      if (node.elements && node.elements.length > 0) {
        if (insertRecursive(node.elements)) {
          return true;
        }
      }
    }
    return false;
  }

  const inserted = insertRecursive(tree);
  if (!inserted) {
    throw new Error(`Target parent container with ID '${targetParentId}' not found in AST tree.`);
  }

  return tree;
}

export function removeNode(nodes: ElementorNode[], id: string): ElementorNode[] {
  const tree = cloneTree(nodes);

  function removeRecursive(currentNodes: ElementorNode[]): boolean {
    const idx = currentNodes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      currentNodes.splice(idx, 1);
      return true;
    }
    for (const node of currentNodes) {
      if (node.elements && node.elements.length > 0) {
        if (removeRecursive(node.elements)) {
          return true;
        }
      }
    }
    return false;
  }

  removeRecursive(tree);
  return tree;
}

export function updateNodeSettings(
  nodes: ElementorNode[],
  id: string,
  settingsPatch: Record<string, unknown>,
): ElementorNode[] {
  const tree = cloneTree(nodes);

  function updateRecursive(currentNodes: ElementorNode[]): boolean {
    for (const node of currentNodes) {
      if (node.id === id) {
        node.settings = {
          ...node.settings,
          ...settingsPatch,
        };
        return true;
      }
      if (node.elements && node.elements.length > 0) {
        if (updateRecursive(node.elements)) {
          return true;
        }
      }
    }
    return false;
  }

  const updated = updateRecursive(tree);
  if (!updated) {
    throw new Error(`Node with ID '${id}' not found for settings update.`);
  }

  return tree;
}
