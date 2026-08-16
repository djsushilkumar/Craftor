import { ElementorNode } from '../../shared-types/dist/index.js';

export interface AstValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_EL_TYPES = new Set(['container', 'widget', 'section', 'column']);
const ID_PATTERN = /^[a-zA-Z0-9_-]{1,16}$/;

export function validateAst(nodes: ElementorNode[]): AstValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  if (!Array.isArray(nodes)) {
    return {
      valid: false,
      errors: ['AST root must be an array of ElementorNode elements.'],
    };
  }

  function validateNode(node: unknown, path: string): void {
    if (typeof node !== 'object' || node === null) {
      errors.push(`${path}: Node must be a non-null object.`);
      return;
    }

    const element = node as Record<string, unknown>;

    if (typeof element['id'] !== 'string' || !element['id']) {
      errors.push(`${path}: Node is missing a valid string 'id'.`);
    } else {
      const id = element['id'];
      if (!ID_PATTERN.test(id)) {
        errors.push(`${path}: Node ID '${id}' does not match expected alphanumeric pattern.`);
      }
      if (seenIds.has(id)) {
        errors.push(`${path}: Duplicate Node ID '${id}' detected in AST tree.`);
      }
      seenIds.add(id);
    }

    if (typeof element['elType'] !== 'string' || !VALID_EL_TYPES.has(element['elType'])) {
      errors.push(
        `${path}: Invalid or missing 'elType'. Must be one of: ${Array.from(VALID_EL_TYPES).join(', ')}.`,
      );
    }

    if (element['elType'] === 'widget') {
      if (typeof element['widgetType'] !== 'string' || !element['widgetType']) {
        errors.push(`${path}: Widget element requires a non-empty 'widgetType' string.`);
      }
    }

    if (typeof element['settings'] !== 'object' || element['settings'] === null) {
      errors.push(`${path}: 'settings' must be a valid object.`);
    }

    if (!Array.isArray(element['elements'])) {
      errors.push(`${path}: 'elements' must be an array.`);
    } else {
      const children = element['elements'] as unknown[];
      children.forEach((child, index) => {
        validateNode(child, `${path}.elements[${index}]`);
      });
    }
  }

  nodes.forEach((node, index) => {
    validateNode(node, `root[${index}]`);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
