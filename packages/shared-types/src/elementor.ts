export type ElementorNodeType = 'container' | 'widget' | 'section' | 'column';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type FlexJustifyContent =
  | 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';

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

export interface ElementorDocument {
  pageId: number;
  title: string;
  status: string;
  version: string;
  elements: ElementorNode[];
  settings: Record<string, unknown>;
  css?: string;
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

export interface ElementorGlobalColor {
  _id: string;
  title: string;
  color: string;
}

export interface ElementorGlobalTypography {
  _id: string;
  title: string;
  typography_font_family?: string;
  typography_font_size?: { unit?: string; size?: number };
  typography_font_weight?: string | number;
  typography_line_height?: { unit?: string; size?: number };
  typography_letter_spacing?: { unit?: string; size?: number };
}

export interface ElementorKitSettings {
  id: number;
  title: string;
  custom_colors?: ElementorGlobalColor[];
  custom_typography?: ElementorGlobalTypography[];
  system_colors?: ElementorGlobalColor[];
  system_typography?: ElementorGlobalTypography[];
  settings: Record<string, unknown>;
}

export interface ElementorTemplateData {
  id?: number | string;
  title: string;
  type: 'page' | 'section' | 'container' | 'header' | 'footer' | 'single' | 'archive';
  version: string;
  elements: ElementorNode[];
  page_settings?: Record<string, unknown>;
}
