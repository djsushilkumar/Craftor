export type ElementorNodeType = 'container' | 'widget' | 'section' | 'column';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type FlexJustifyContent =
  'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';

export type FlexAlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch';

export interface ElementorNode {
  id: string;
  elType: ElementorNodeType;
  isInner?: boolean;
  widgetType?: string;
  settings: Record<string, unknown>;
  elements: ElementorNode[];
}

export interface ElementorDocumentAST {
  page_id: number;
  version: string;
  elements: ElementorNode[];
}

export interface FlexContainerOptions {
  id?: string;
  flexDirection?: FlexDirection;
  justifyContent?: FlexJustifyContent;
  alignItems?: FlexAlignItems;
  settings?: Record<string, unknown>;
  elements?: ElementorNode[];
}

export interface GridContainerOptions {
  id?: string;
  columns?: number | string;
  rows?: number | string;
  gap?: number | string;
  settings?: Record<string, unknown>;
  elements?: ElementorNode[];
}
