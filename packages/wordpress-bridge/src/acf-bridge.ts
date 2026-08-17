/**
 * Craftor ACF Pro & Custom Post Types Bridge Engine
 * Programmatically defines and registers Custom Post Types, Taxonomies, and ACF Field Groups.
 */

export interface CustomPostTypeConfig {
  slug: string;
  singularName: string;
  pluralName: string;
  hierarchical?: boolean;
  supports?: Array<'title' | 'editor' | 'thumbnail' | 'custom-fields' | 'elementor'>;
  hasArchive?: boolean;
  showInRest?: boolean;
}

export interface AcfFieldConfig {
  key: string;
  label: string;
  name: string;
  type: 'text' | 'textarea' | 'number' | 'image' | 'repeater' | 'select' | 'true_false';
  instructions?: string;
  required?: boolean;
}

export interface AcfFieldGroupConfig {
  key: string;
  title: string;
  fields: AcfFieldConfig[];
  location: Array<{
    param: 'post_type' | 'page_template' | 'taxonomy';
    operator: '==' | '!=';
    value: string;
  }>;
}

export class AcfBridge {
  private registeredCpts: Map<string, CustomPostTypeConfig> = new Map();
  private registeredFieldGroups: Map<string, AcfFieldGroupConfig> = new Map();

  public registerCpt(config: CustomPostTypeConfig): { success: boolean; cpt: CustomPostTypeConfig; restBase: string } {
    const slug = config.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const finalConfig: CustomPostTypeConfig = {
      ...config,
      slug,
      hierarchical: config.hierarchical ?? false,
      supports: config.supports ?? ['title', 'editor', 'thumbnail', 'custom-fields', 'elementor'],
      hasArchive: config.hasArchive ?? true,
      showInRest: config.showInRest ?? true,
    };
    this.registeredCpts.set(slug, finalConfig);
    return {
      success: true,
      cpt: finalConfig,
      restBase: `/wp/v2/${slug}`,
    };
  }

  public registerFieldGroup(group: AcfFieldGroupConfig): { success: boolean; fieldGroup: AcfFieldGroupConfig; fieldCount: number } {
    this.registeredFieldGroups.set(group.key, group);
    return {
      success: true,
      fieldGroup: group,
      fieldCount: group.fields.length,
    };
  }

  public getCpts(): CustomPostTypeConfig[] {
    return Array.from(this.registeredCpts.values());
  }

  public getFieldGroups(): AcfFieldGroupConfig[] {
    return Array.from(this.registeredFieldGroups.values());
  }
}
