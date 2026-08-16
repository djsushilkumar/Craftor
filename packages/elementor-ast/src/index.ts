import { ElementorNode } from '../../shared-types/dist/index';
import { generateHexUuid } from '../../shared-utils/dist/index';

export class ElementorAstEngine {
  public static createContainer(direction: 'row' | 'column' = 'column'): ElementorNode {
    return {
      id: generateHexUuid(7),
      elType: 'container',
      settings: {
        flex_direction: direction
      },
      elements: []
    };
  }

  public static deserialize(jsonString: string): ElementorNode[] {
    return JSON.parse(jsonString) as ElementorNode[];
  }

  public static serialize(nodes: ElementorNode[]): string {
    return JSON.stringify(nodes);
  }
}
