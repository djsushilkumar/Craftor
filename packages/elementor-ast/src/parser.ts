import { ElementorNode } from '../../shared-types/dist/index.js';

export function parseAst(jsonString: string): ElementorNode[] {
  if (!jsonString || typeof jsonString !== 'string') {
    return [];
  }
  const parsed: unknown = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('Elementor AST must be a JSON array of root elements.');
  }
  return parsed as ElementorNode[];
}

export function serializeAst(nodes: ElementorNode[], pretty: boolean = false): string {
  return pretty ? JSON.stringify(nodes, null, 2) : JSON.stringify(nodes);
}
