/**
 * Craftor 3rd-Party Addon Ecosystem SDK Type Definitions
 */

import { ElementorNode } from '@craftor/shared-types';

export type ControlType = 'text' | 'number' | 'select' | 'color' | 'typography' | 'slider' | 'switcher' | 'repeater';

export interface WidgetControl {
  name: string;
  label: string;
  type: ControlType;
  default?: unknown;
  options?: Record<string, string>;
  description?: string;
}

export interface CustomWidgetDefinition {
  addonSlug: string;
  widgetName: string;
  title: string;
  icon?: string;
  category: string;
  controls: WidgetControl[];
  astBuilder: (settings: Record<string, unknown>) => ElementorNode;
}

export interface AddonManifest {
  addonSlug: string;
  name: string;
  author: string;
  version: string;
  widgets: CustomWidgetDefinition[];
}
