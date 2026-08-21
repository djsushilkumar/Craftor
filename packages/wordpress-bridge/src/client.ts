/**
 * Craftor WordPress Client
 * High-level SDK client connecting AI Agents and MCP Daemons to WordPress, Elementor & WooCommerce.
 */

import {
  WordPressSiteInfo,
  WordPressPost,
  WordPressPage,
  WordPressPlugin,
  WordPressTheme,
  WordPressPostQuery,
  WordPressPageQuery,
  CreateWordPressPagePayload,
  UpdateWordPressPagePayload,
  CreateWordPressPostPayload,
  UpdateWordPressPostPayload,
  WordPressTaxonomyTerm,
  CreateWordPressTermPayload,
  UpdateWordPressTermPayload,
} from '../../shared-types/dist/index.js';
import { logger } from '../../shared-utils/dist/index.js';
import { WordPressAuthConfig, maskAuthCredentials } from './auth.js';
import { WordPressRestClient, RequestOptions } from './rest.js';
import {
  assertPositiveId,
  applyElementorMeta,
  buildQueryParams,
  pickDefined,
  taxonomyEndpoint,
} from './payloads.js';

const POST_QUERY_KEYS = [
  'page',
  'per_page',
  'search',
  'status',
  'order',
  'orderby',
  'categories',
  'tags',
] as const;

const PAGE_QUERY_KEYS = ['page', 'per_page', 'search', 'status', 'parent', 'order', 'orderby'] as const;

const PAGE_BODY_KEYS = ['content', 'slug', 'template', 'parent', 'menu_order'] as const;

const POST_BODY_KEYS = [
  'content',
  'slug',
  'excerpt',
  'author',
  'categories',
  'tags',
  'featured_media',
  'meta',
] as const;

export interface WordPressClientConfig {
  siteUrl: string;
  auth?: WordPressAuthConfig;
  timeoutMs?: number;
  maxRetries?: number;
  customFetch?: typeof fetch;
}

export class WordPressClient {
  private readonly config: WordPressClientConfig;
  private readonly rest: WordPressRestClient;
  private siteInfo: WordPressSiteInfo | null = null;
  private connected: boolean = false;

  constructor(config: WordPressClientConfig) {
    if (!config.siteUrl || !config.siteUrl.trim()) {
      throw new Error('WordPressClient requires a valid siteUrl.');
    }

    this.config = {
      ...config,
      siteUrl: config.siteUrl.trim().replace(/\/+$/, ''),
    };

    this.rest = new WordPressRestClient({
      baseUrl: this.config.siteUrl,
      auth: this.config.auth,
      timeoutMs: this.config.timeoutMs,
      maxRetries: this.config.maxRetries,
      customFetch: this.config.customFetch,
    });
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getSiteUrl(): string {
    return this.config.siteUrl;
  }

  public getRestClient(): WordPressRestClient {
    return this.rest;
  }

  /**
   * Connects to the WordPress site, discovers REST namespaces, and caches site metadata.
   */
  public async connect(): Promise<WordPressSiteInfo> {
    logger.info(`Connecting WordPressClient to ${this.config.siteUrl}`, {
      siteUrl: this.config.siteUrl,
      auth: this.config.auth ? maskAuthCredentials(this.config.auth) : 'none',
    });

    try {
      const rootDiscovery = await this.rest.get<{
        name?: string;
        description?: string;
        url?: string;
        home?: string;
        namespaces?: string[];
        timezone_string?: string;
      }>('/wp-json');

      const namespaces = Array.isArray(rootDiscovery.namespaces) ? rootDiscovery.namespaces : [];
      const hasElementorNamespace = namespaces.some((ns) => ns.toLowerCase().includes('elementor'));
      const hasWooNamespace = namespaces.some((ns) => ns.toLowerCase().includes('wc/') || ns.toLowerCase().includes('woocommerce'));

      this.siteInfo = {
        name: rootDiscovery.name ?? 'WordPress Site',
        description: rootDiscovery.description ?? '',
        url: rootDiscovery.url ?? this.config.siteUrl,
        home: rootDiscovery.home ?? this.config.siteUrl,
        namespaces,
        elementorActive: hasElementorNamespace,
        woocommerceActive: hasWooNamespace,
        timezone: rootDiscovery.timezone_string ?? 'UTC',
      };

      this.connected = true;
      logger.info(`WordPressClient successfully connected to "${this.siteInfo.name}" (${this.config.siteUrl})`, {
        elementorActive: this.siteInfo.elementorActive,
        woocommerceActive: this.siteInfo.woocommerceActive,
      });

      return { ...this.siteInfo };
    } catch (err) {
      this.connected = false;
      this.siteInfo = null;
      logger.error(`WordPressClient connection failed for ${this.config.siteUrl}`, err);
      throw err;
    }
  }

  /**
   * Disconnects from the WordPress site and resets cached state.
   */
  public async disconnect(): Promise<void> {
    this.connected = false;
    this.siteInfo = null;
    logger.info(`WordPressClient disconnected from ${this.config.siteUrl}`);
  }

  /**
   * Retrieves site metadata, connecting automatically if not already connected.
   */
  public async getSite(): Promise<WordPressSiteInfo> {
    if (this.siteInfo && this.connected) {
      return { ...this.siteInfo };
    }
    return this.connect();
  }

  /**
   * Retrieves a list of posts matching optional query criteria.
   */
  public async getPosts(query?: WordPressPostQuery, options?: RequestOptions): Promise<WordPressPost[]> {
    return this.rest.get<WordPressPost[]>('/wp-json/wp/v2/posts', {
      ...options,
      params: buildQueryParams(query, POST_QUERY_KEYS, options?.params),
    });
  }

  /**
   * Retrieves a single post by ID.
   */
  public async getPost(id: number, options?: RequestOptions): Promise<WordPressPost> {
    assertPositiveId(id, 'post');
    return this.rest.get<WordPressPost>(`/wp-json/wp/v2/posts/${id}`, options);
  }

  /**
   * Retrieves a list of pages matching optional query criteria.
   */
  public async getPages(query?: WordPressPageQuery, options?: RequestOptions): Promise<WordPressPage[]> {
    return this.rest.get<WordPressPage[]>('/wp-json/wp/v2/pages', {
      ...options,
      params: buildQueryParams(query, PAGE_QUERY_KEYS, options?.params),
    });
  }

  /**
   * Retrieves a single page by ID.
   */
  public async getPage(id: number, options?: RequestOptions): Promise<WordPressPage> {
    assertPositiveId(id, 'page');
    return this.rest.get<WordPressPage>(`/wp-json/wp/v2/pages/${id}`, options);
  }

  /**
   * Creates a new WordPress page (with optional Elementor AST data and templates).
   */
  public async createPage(
    payload: CreateWordPressPagePayload,
    options?: RequestOptions,
  ): Promise<WordPressPage> {
    if (!payload.title || !payload.title.trim()) {
      throw new Error('Page creation requires a non-empty title.');
    }

    const requestBody: Record<string, unknown> = {
      title: payload.title.trim(),
      status: payload.status ?? 'draft',
      ...pickDefined(payload, PAGE_BODY_KEYS),
    };

    applyElementorMeta(requestBody, payload);

    try {
      return await this.rest.post<WordPressPage>('/wp-json/wp/v2/pages', requestBody, options);
    } catch {
      // Fallback to Craftor content endpoint
      const res = await this.rest.post<{ success: boolean; postId: number; title: string; slug: string; link: string }>(
        '/wp-json/craftor/v1/content/posts',
        {
          title: payload.title.trim(),
          postType: 'page',
          slug: payload.slug,
        },
        options,
      );

      return {
        id: res.postId,
        date: new Date().toISOString(),
        slug: res.slug,
        status: 'publish',
        type: 'page',
        link: res.link,
        title: { rendered: res.title },
        content: { rendered: '' },
        template: 'elementor_header_footer',
      };
    }
  }

  /**
   * Updates an existing page by ID.
   */
  public async updatePage(
    id: number,
    payload: UpdateWordPressPagePayload,
    options?: RequestOptions,
  ): Promise<WordPressPage> {
    assertPositiveId(id, 'page');

    const requestBody = pickDefined(payload, ['title', 'status', ...PAGE_BODY_KEYS] as const);
    applyElementorMeta(requestBody, payload);

    return this.rest.post<WordPressPage>(`/wp-json/wp/v2/pages/${id}`, requestBody, options);
  }

  /**
   * Deletes a page by ID (optionally bypassing trash with force: true).
   */
  public async deletePage(
    id: number,
    force: boolean = false,
    options?: RequestOptions,
  ): Promise<{ deleted: boolean; previous: WordPressPage }> {
    assertPositiveId(id, 'page');

    return this.rest.delete<{ deleted: boolean; previous: WordPressPage }>(
      `/wp-json/wp/v2/pages/${id}`,
      {
        ...options,
        params: { force, ...(options?.params ?? {}) },
      },
    );
  }

  /**
   * Retrieves installed plugins list.
   */
  public async getPlugins(options?: RequestOptions): Promise<WordPressPlugin[]> {
    try {
      return await this.rest.get<WordPressPlugin[]>('/wp-json/wp/v2/plugins', options);
    } catch {
      // Fallback for custom or minimal environments
      return [];
    }
  }

  /**
   * Retrieves installed themes list.
   */
  public async getThemes(options?: RequestOptions): Promise<WordPressTheme[]> {
    try {
      return await this.rest.get<WordPressTheme[]>('/wp-json/wp/v2/themes', options);
    } catch {
      // Fallback for custom or minimal environments
      return [];
    }
  }

  /**
   * Retrieves a WordPress site setting/option value.
   */
  public async getOption<T = unknown>(optionName: string, options?: RequestOptions): Promise<T | null> {
    try {
      const settings = await this.rest.get<Record<string, unknown>>('/wp-json/wp/v2/settings', options);
      return (settings[optionName] as T) ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Updates WordPress site settings/options.
   */
  public async updateOption(settings: Record<string, unknown>, options?: RequestOptions): Promise<Record<string, unknown>> {
    return this.rest.post<Record<string, unknown>>('/wp-json/wp/v2/settings', settings, options);
  }

  /**
   * Creates a new WordPress post.
   */
  public async createPost(
    payload: CreateWordPressPostPayload,
    options?: RequestOptions,
  ): Promise<WordPressPost> {
    if (!payload.title || !payload.title.trim()) {
      throw new Error('Post creation requires a non-empty title.');
    }

    const requestBody: Record<string, unknown> = {
      title: payload.title.trim(),
      status: payload.status ?? 'draft',
      ...pickDefined(payload, POST_BODY_KEYS),
    };

    return this.rest.post<WordPressPost>('/wp-json/wp/v2/posts', requestBody, options);
  }

  /**
   * Updates an existing WordPress post by ID.
   */
  public async updatePost(
    id: number,
    payload: UpdateWordPressPostPayload,
    options?: RequestOptions,
  ): Promise<WordPressPost> {
    assertPositiveId(id, 'post');

    const requestBody = pickDefined(payload, ['title', 'status', ...POST_BODY_KEYS] as const);

    return this.rest.post<WordPressPost>(`/wp-json/wp/v2/posts/${id}`, requestBody, options);
  }

  /**
   * Deletes a WordPress post by ID.
   */
  public async deletePost(
    id: number,
    force: boolean = false,
    options?: RequestOptions,
  ): Promise<{ deleted: boolean; previous: WordPressPost }> {
    assertPositiveId(id, 'post');

    return this.rest.delete<{ deleted: boolean; previous: WordPressPost }>(
      `/wp-json/wp/v2/posts/${id}`,
      {
        ...options,
        params: { force, ...(options?.params ?? {}) },
      },
    );
  }

  /**
   * Duplicates an existing WordPress page into a new draft page.
   */
  public async duplicatePage(
    pageId: number,
    newTitle?: string,
    options?: RequestOptions,
  ): Promise<WordPressPage> {
    const original = await this.getPage(pageId, options);
    const title = newTitle ?? `${original.title?.rendered ?? 'Page'} (Copy)`;

    return this.createPage(
      {
        title,
        content: original.content?.raw ?? original.content?.rendered ?? '',
        status: 'draft',
        template: original.template,
        parent: original.parent,
        meta: original.meta,
        elementor_data: original.meta?._elementor_data as string | undefined,
      },
      options,
    );
  }

  /**
   * Retrieves taxonomy terms (categories or tags).
   */
  public async getTaxonomyTerms(
    taxonomy: string = 'categories',
    options?: RequestOptions,
  ): Promise<WordPressTaxonomyTerm[]> {
    const endpoint = taxonomyEndpoint(taxonomy);
    try {
      return await this.rest.get<WordPressTaxonomyTerm[]>(endpoint, options);
    } catch {
      return [];
    }
  }

  /**
   * Creates a taxonomy term (category or tag).
   */
  public async createTaxonomyTerm(
    payload: CreateWordPressTermPayload,
    options?: RequestOptions,
  ): Promise<WordPressTaxonomyTerm> {
    const endpoint = taxonomyEndpoint(payload.taxonomy);

    return this.rest.post<WordPressTaxonomyTerm>(
      endpoint,
      {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        parent: payload.parent,
      },
      options,
    );
  }

  /**
   * Updates a taxonomy term by ID.
   */
  public async updateTaxonomyTerm(
    id: number,
    payload: UpdateWordPressTermPayload,
    options?: RequestOptions,
  ): Promise<WordPressTaxonomyTerm> {
    const endpoint = taxonomyEndpoint(payload.taxonomy, id);

    return this.rest.post<WordPressTaxonomyTerm>(
      endpoint,
      {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        parent: payload.parent,
      },
      options,
    );
  }

  /**
   * Deletes a taxonomy term by ID.
   */
  public async deleteTaxonomyTerm(
    id: number,
    taxonomy: string = 'categories',
    force: boolean = true,
    options?: RequestOptions,
  ): Promise<{ deleted: boolean; previous: WordPressTaxonomyTerm }> {
    const endpoint = taxonomyEndpoint(taxonomy, id);

    return this.rest.delete<{ deleted: boolean; previous: WordPressTaxonomyTerm }>(
      endpoint,
      {
        ...options,
        params: { force, ...(options?.params ?? {}) },
      },
    );
  }
}


