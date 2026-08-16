import {
  ElementorNode,
  FlexContainerOptions,
  GridContainerOptions,
} from '../../shared-types/dist/index.js';
import { generateHexUuid } from '../../shared-utils/dist/index.js';

export function generateElementId(): string {
  return generateHexUuid(7);
}

export function createFlexContainer(options: FlexContainerOptions = {}): ElementorNode {
  const {
    id = generateElementId(),
    flexDirection = 'column',
    justifyContent = 'flex-start',
    alignItems = 'stretch',
    settings = {},
    elements = [],
  } = options;

  return {
    id,
    elType: 'container',
    isInner: false,
    settings: {
      flex_direction: flexDirection,
      flex_justify_content: justifyContent,
      flex_align_items: alignItems,
      ...settings,
    },
    elements: [...elements],
  };
}

export function createGridContainer(options: GridContainerOptions = {}): ElementorNode {
  const {
    id = generateElementId(),
    columns = 2,
    rows = 1,
    gap = 20,
    settings = {},
    elements = [],
  } = options;

  return {
    id,
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'grid',
      grid_columns_grid: {
        unit: 'fr',
        size: columns,
      },
      grid_rows_grid: {
        unit: 'fr',
        size: rows,
      },
      grid_gaps: {
        unit: 'px',
        column: gap,
        row: gap,
      },
      ...settings,
    },
    elements: [...elements],
  };
}

export function createWidgetNode(
  widgetType: string,
  settings: Record<string, unknown> = {},
  id: string = generateElementId(),
): ElementorNode {
  return {
    id,
    elType: 'widget',
    widgetType,
    settings: { ...settings },
    elements: [],
  };
}
