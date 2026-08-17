/**
 * Craftor Addon Widget Registry & Discovery Engine
 */

import { ElementorNode } from '@craftor/shared-types';
import { CustomWidgetDefinition, AddonManifest } from './types.js';

export class AddonWidgetRegistry {
  private static instance: AddonWidgetRegistry;
  private registeredAddons: Map<string, AddonManifest> = new Map();
  private registeredWidgets: Map<string, CustomWidgetDefinition> = new Map();

  public static getInstance(): AddonWidgetRegistry {
    if (!AddonWidgetRegistry.instance) {
      AddonWidgetRegistry.instance = new AddonWidgetRegistry();
    }
    return AddonWidgetRegistry.instance;
  }

  public registerAddon(manifest: AddonManifest): { success: boolean; widgetCount: number } {
    this.registeredAddons.set(manifest.addonSlug, manifest);
    for (const widget of manifest.widgets) {
      this.registeredWidgets.set(widget.widgetName, widget);
    }
    return {
      success: true,
      widgetCount: manifest.widgets.length,
    };
  }

  public registerWidget(widget: CustomWidgetDefinition): { success: boolean; widgetName: string } {
    this.registeredWidgets.set(widget.widgetName, widget);
    return {
      success: true,
      widgetName: widget.widgetName,
    };
  }

  public instantiateWidget(widgetName: string, settings: Record<string, unknown>): ElementorNode {
    const def = this.registeredWidgets.get(widgetName);
    if (!def) {
      // Fallback default node
      return {
        id: `custom_${Math.random().toString(36).substring(2, 9)}`,
        elType: 'widget',
        widgetType: widgetName,
        settings,
        elements: [],
      };
    }
    return def.astBuilder(settings);
  }

  public getCatalog(): { addons: AddonManifest[]; totalWidgets: number } {
    return {
      addons: Array.from(this.registeredAddons.values()),
      totalWidgets: this.registeredWidgets.size,
    };
  }
}
