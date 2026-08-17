/**
 * WordPress REST API & Bridge Schema Types
 */

export interface WordPressSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  namespaces: string[];
  elementorActive?: boolean;
  woocommerceActive?: boolean;
  craftorPluginVersion?: string;
  timezone?: string;
  version?: string;
}

export interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private' | 'trash';
  type: string;
  link: string;
  title: {
    rendered: string;
    raw?: string;
  };
  content: {
    rendered: string;
    raw?: string;
    protected?: boolean;
  };
  excerpt?: {
    rendered: string;
    raw?: string;
  };
  author?: number;
  featured_media?: number;
  meta?: Record<string, unknown>;
  elementor_data?: unknown;
}

export interface WordPressPage extends WordPressPost {
  parent?: number;
  menu_order?: number;
  template?: string;
}

export interface WordPressPlugin {
  plugin: string;
  status: 'active' | 'inactive';
  name: string;
  plugin_uri?: string;
  author?: string;
  version: string;
  description?: {
    rendered: string;
  };
  network_only?: boolean;
}

export interface WordPressTheme {
  theme: string;
  name: string;
  status: 'active' | 'inactive';
  version: string;
  author?: string;
  theme_uri?: string;
  is_block_theme?: boolean;
}

export interface WordPressPostQuery {
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  before?: string;
  author?: number[];
  status?: string;
  categories?: number[];
  tags?: number[];
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'id' | 'title' | 'slug' | 'modified';
}

export interface WordPressPageQuery extends WordPressPostQuery {
  parent?: number;
  parent_exclude?: number[];
}

export interface CreateWordPressPagePayload {
  title: string;
  content?: string;
  status?: 'publish' | 'draft' | 'pending' | 'private';
  slug?: string;
  template?: string;
  parent?: number;
  menu_order?: number;
  meta?: Record<string, unknown>;
  elementor_data?: string | Record<string, unknown>[];
}

export interface UpdateWordPressPagePayload {
  title?: string;
  content?: string;
  status?: 'publish' | 'draft' | 'pending' | 'private' | 'trash';
  slug?: string;
  template?: string;
  parent?: number;
  menu_order?: number;
  meta?: Record<string, unknown>;
  elementor_data?: string | Record<string, unknown>[];
}

export interface CreateWordPressPostPayload {
  title: string;
  content?: string;
  status?: 'publish' | 'draft' | 'pending' | 'private';
  slug?: string;
  excerpt?: string;
  author?: number;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  meta?: Record<string, unknown>;
}

export interface UpdateWordPressPostPayload {
  title?: string;
  content?: string;
  status?: 'publish' | 'draft' | 'pending' | 'private' | 'trash';
  slug?: string;
  excerpt?: string;
  author?: number;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  meta?: Record<string, unknown>;
}

export interface WordPressTaxonomyTerm {
  id: number;
  count?: number;
  description?: string;
  link?: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent?: number;
}

export interface CreateWordPressTermPayload {
  name: string;
  slug?: string;
  description?: string;
  taxonomy?: string;
  parent?: number;
}

export interface UpdateWordPressTermPayload {
  name?: string;
  slug?: string;
  description?: string;
  taxonomy?: string;
  parent?: number;
}

