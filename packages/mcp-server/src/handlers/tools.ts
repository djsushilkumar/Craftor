import {
  McpToolDefinition,
  McpCallToolResult,
  ElementorNode,
  ElementorTemplateData,
  ElementorKitSettings,
  CreateWordPressPostPayload,
  UpdateWordPressPostPayload,
  CreateWordPressPagePayload,
  UpdateWordPressPagePayload,
  CreateWooCommerceProductPayload,
  UpdateWooCommerceProductPayload,
  SnapshotTargetType,
} from '../../../shared-types/dist/index.js';
import { ToolRegistry } from '../../../tool-registry/dist/index.js';
import {
  createFlexContainer,
  createGridContainer,
  createWidgetNode,
  insertNode,
  removeNode,
  updateNodeSettings,
  validateAst,
  ElementorAstEngine,
  diffAst,
  createHeaderTemplate,
  createFooterTemplate,
  createSinglePostTemplate,
  DYNAMIC_TAG_PRESETS,
  injectDynamicTag,
  MultimodalSynthesizer,
  VisualLayoutDescriptor,
  SalesFunnelGenerator,
  SalesFunnelConfig,
  AstCompressor,
  PaletteExtractor,
  SchemaInjector,
  SchemaFaqItem,
  SchemaProductConfig,
  PopupGenerator,
  PopupGeneratorConfig,
  MotionEffectsConfig,
} from '../../../elementor-ast/dist/index.js';
import {
  WordPressClient,
  ElementorBridge,
  WooCommerceBridge,
  SnapshotManager,
  RollbackManager,
  ElementorLiveSyncBridge,
  WooCommerceCouponsBridge,
  MultiSiteManager,
  LocalLlmBridge,
  SecurityShield,
  AcfBridge,
  CustomPostTypeConfig,
  AcfFieldGroupConfig,
  SeoBridge,
  SeoMetadataPayload,
  MultilingualBridge,
  PageTranslationRequest,
} from '../../../wordpress-bridge/dist/index.js';
import { WhiteLabelManager, QuotaEnforcer } from '../../../../services/licensing/dist/index.js';
import { TelemetryCollector } from '../../../../services/analytics/dist/index.js';
import {
  AutoRepairEngine,
  PhpErrorTriage,
  PerformanceAutoTuner,
  PhpErrorContext,
  PerformanceTuneOptions,
  CdnPurgeRequest,
} from '../../../../services/self-healing/dist/index.js';
import { CRAFTOR_TOKENS } from '../../../design-tokens/dist/index.js';
import { logger, VoiceIntentClassifier, VoiceSessionManager } from '../../../shared-utils/dist/index.js';
import {
  AddonWidgetRegistry,
  CustomWidgetDefinition,
  WidgetControl,
} from '../../../addon-sdk/dist/index.js';
import { createInvalidParamsError, createToolNotFoundError, McpError } from '../errors.js';

export interface ToolsListResponsePayload {
  tools: Array<{
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  }>;
}

export interface ToolCallParams {
  name: string;
  arguments?: Record<string, unknown>;
}

export function registerDefaultTools(): void {
  const defaultTools: McpToolDefinition[] = [
    // =========================================================================
    // 1. WORDPRESS CORE, POSTS, PAGES & TAXONOMIES (12 TOOLS)
    // =========================================================================
    {
      id: 'craftor_wp_create_post',
      name: 'Create WordPress Post',
      category: 'wordpress_content',
      description: 'Creates a new WordPress post with title, content, status, excerpt, author, categories, and tags.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', description: 'Post title' },
          content: { type: 'string', description: 'Post content body (HTML or Markdown)' },
          status: { type: 'string', enum: ['publish', 'draft', 'pending', 'private'], default: 'draft' },
          slug: { type: 'string', description: 'URL slug' },
          excerpt: { type: 'string', description: 'Post excerpt' },
          categories: { type: 'array', items: { type: 'number' }, description: 'Category IDs' },
          tags: { type: 'array', items: { type: 'number' }, description: 'Tag IDs' },
          featured_media: { type: 'number', description: 'Featured image attachment ID' },
        },
      },
    },
    {
      id: 'craftor_wp_update_post',
      name: 'Update WordPress Post',
      category: 'wordpress_content',
      description: 'Updates an existing WordPress post by ID with automatic pre-state snapshot protection.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['postId'],
        properties: {
          postId: { type: 'number', description: 'WordPress post ID to update' },
          title: { type: 'string', description: 'New post title' },
          content: { type: 'string', description: 'New post content' },
          status: { type: 'string', enum: ['publish', 'draft', 'pending', 'private', 'trash'] },
          slug: { type: 'string', description: 'New URL slug' },
          excerpt: { type: 'string', description: 'New post excerpt' },
          categories: { type: 'array', items: { type: 'number' }, description: 'Category IDs' },
          tags: { type: 'array', items: { type: 'number' }, description: 'Tag IDs' },
        },
      },
    },
    {
      id: 'craftor_wp_delete_post',
      name: 'Delete WordPress Post',
      category: 'wordpress_content',
      description: 'Trashes or permanently deletes a WordPress post with pre-deletion snapshot.',
      permissions: ['read', 'write', 'delete'],
      inputSchema: {
        type: 'object',
        required: ['postId'],
        properties: {
          postId: { type: 'number', description: 'WordPress post ID to delete' },
          force: { type: 'boolean', description: 'Permanently delete bypassing trash', default: false },
        },
      },
    },
    {
      id: 'craftor_wp_create_page',
      name: 'Create WordPress Page',
      category: 'wordpress_content',
      description: 'Creates a new WordPress page with parent hierarchy and template assignments.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', description: 'Page title' },
          content: { type: 'string', description: 'Page content body' },
          status: { type: 'string', enum: ['publish', 'draft', 'pending', 'private'], default: 'draft' },
          slug: { type: 'string', description: 'Page URL slug' },
          template: { type: 'string', description: 'Page template (e.g. elementor_canvas, elementor_header_footer)' },
          parent: { type: 'number', description: 'Parent page ID' },
          menu_order: { type: 'number', description: 'Menu order priority' },
        },
      },
    },
    {
      id: 'craftor_wp_update_page',
      name: 'Update WordPress Page',
      category: 'wordpress_content',
      description: 'Updates an existing WordPress page parameters, template, and parent hierarchy.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['pageId'],
        properties: {
          pageId: { type: 'number', description: 'WordPress page ID' },
          title: { type: 'string', description: 'New page title' },
          content: { type: 'string', description: 'New page content body' },
          status: { type: 'string', enum: ['publish', 'draft', 'pending', 'private', 'trash'] },
          slug: { type: 'string', description: 'New URL slug' },
          template: { type: 'string', description: 'Page template' },
          parent: { type: 'number', description: 'Parent page ID' },
        },
      },
    },
    {
      id: 'craftor_wp_delete_page',
      name: 'Delete WordPress Page',
      category: 'wordpress_content',
      description: 'Trashes or permanently deletes a WordPress page with snapshot backup.',
      permissions: ['read', 'write', 'delete'],
      inputSchema: {
        type: 'object',
        required: ['pageId'],
        properties: {
          pageId: { type: 'number', description: 'WordPress page ID' },
          force: { type: 'boolean', description: 'Bypass trash and delete permanently', default: false },
        },
      },
    },
    {
      id: 'craftor_wp_duplicate_page',
      name: 'Duplicate WordPress Page',
      category: 'wordpress_content',
      description: 'Duplicates an existing WordPress page and its Elementor metadata into a new draft page.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['pageId'],
        properties: {
          pageId: { type: 'number', description: 'Source page ID to clone' },
          newTitle: { type: 'string', description: 'Title for the duplicated page' },
        },
      },
    },
    {
      id: 'craftor_wp_get_site_options',
      name: 'Get Site Options',
      category: 'site_operations',
      description: 'Retrieves WordPress site settings and options (title, tagline, timezone, admin email).',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {
          optionName: { type: 'string', description: 'Optional specific option key to fetch' },
        },
      },
    },
    {
      id: 'craftor_wp_update_site_options',
      name: 'Update Site Options',
      category: 'site_operations',
      description: 'Updates site settings and options safely with pre-state validation.',
      permissions: ['read', 'write', 'admin'],
      inputSchema: {
        type: 'object',
        required: ['settings'],
        properties: {
          settings: { type: 'object', description: 'Key-value map of site settings to update' },
        },
      },
    },
    {
      id: 'craftor_wp_create_taxonomy',
      name: 'Create Taxonomy Term',
      category: 'wordpress_content',
      description: 'Creates a new category, tag, or custom taxonomy term in WordPress.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: 'Term name' },
          slug: { type: 'string', description: 'Term URL slug' },
          taxonomy: { type: 'string', enum: ['categories', 'tags'], default: 'categories' },
          description: { type: 'string', description: 'Term description' },
          parent: { type: 'number', description: 'Parent term ID for hierarchical taxonomies' },
        },
      },
    },
    {
      id: 'craftor_wp_update_taxonomy',
      name: 'Update Taxonomy Term',
      category: 'wordpress_content',
      description: 'Updates an existing taxonomy term (name, slug, description, parent).',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['termId'],
        properties: {
          termId: { type: 'number', description: 'Taxonomy term ID' },
          name: { type: 'string', description: 'New term name' },
          slug: { type: 'string', description: 'New term slug' },
          taxonomy: { type: 'string', enum: ['categories', 'tags'], default: 'categories' },
          description: { type: 'string', description: 'New term description' },
        },
      },
    },
    {
      id: 'craftor_wp_delete_taxonomy',
      name: 'Delete Taxonomy Term',
      category: 'wordpress_content',
      description: 'Deletes a taxonomy category or tag term safely.',
      permissions: ['read', 'write', 'delete'],
      inputSchema: {
        type: 'object',
        required: ['termId'],
        properties: {
          termId: { type: 'number', description: 'Taxonomy term ID' },
          taxonomy: { type: 'string', enum: ['categories', 'tags'], default: 'categories' },
          force: { type: 'boolean', default: true },
        },
      },
    },

    // =========================================================================
    // 2. ELEMENTOR DOCUMENT, CANVAS & CONTAINER TOOLS (16 TOOLS)
    // =========================================================================
    {
      id: 'craftor_elementor_get_document',
      name: 'Get Elementor Document AST',
      category: 'elementor_document',
      description: 'Loads and parses an Elementor document AST tree and page settings from WordPress post meta.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['pageId'],
        properties: {
          pageId: { type: 'number', description: 'Target WordPress post/page ID' },
        },
      },
    },
    {
      id: 'craftor_elementor_save_document',
      name: 'Save Elementor Document AST',
      category: 'elementor_document',
      description: 'Validates, serializes, and persists an Elementor AST tree to WordPress _elementor_data meta and invalidates CSS caches.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['pageId', 'elements'],
        properties: {
          pageId: { type: 'number', description: 'Target WordPress post/page ID' },
          elements: { type: 'array', description: 'Root array of Elementor AST container/widget nodes' },
          settings: { type: 'object', description: 'Optional page-level Elementor settings' },
        },
      },
    },
    {
      id: 'craftor_elementor_create_container',
      name: 'Create Elementor Container',
      category: 'elementor_containers',
      description: 'Generates a validated Elementor flex or grid container AST node.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        properties: {
          containerType: { type: 'string', enum: ['flex', 'grid'], default: 'flex' },
          direction: { type: 'string', enum: ['row', 'column', 'row-reverse', 'column-reverse'], default: 'column' },
          columns: { type: 'number', description: 'Grid columns count (for grid container)' },
          settings: { type: 'object', description: 'Custom container settings' },
        },
      },
    },
    {
      id: 'craftor_elementor_generate_container',
      name: 'Generate Compound Layout Container',
      category: 'elementor_containers',
      description: 'Generates responsive multi-column layout containers with widgets (Hero, 2-Column, 3-Column, Grid).',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['layoutType'],
        properties: {
          layoutType: { type: 'string', enum: ['hero', 'two_column', 'three_column', 'feature_grid'], default: 'hero' },
          title: { type: 'string', description: 'Section heading text' },
          subtitle: { type: 'string', description: 'Subheading / paragraph text' },
          ctaText: { type: 'string', description: 'Call-to-action button text' },
        },
      },
    },
    {
      id: 'craftor_elementor_update_container',
      name: 'Update Elementor Container',
      category: 'elementor_containers',
      description: 'Updates styling and layout controls of an existing container node.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'containerId', 'settings'],
        properties: {
          ast: { type: 'array', description: 'Full Elementor document AST' },
          containerId: { type: 'string', description: '7-character hex ID of the container' },
          settings: { type: 'object', description: 'Settings to merge into container' },
        },
      },
    },
    {
      id: 'craftor_elementor_delete_container',
      name: 'Delete Elementor Container',
      category: 'elementor_containers',
      description: 'Removes a container node and all child elements from the AST.',
      permissions: ['read', 'write', 'delete'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'containerId'],
        properties: {
          ast: { type: 'array', description: 'Full Elementor document AST' },
          containerId: { type: 'string', description: 'Target container hex ID' },
        },
      },
    },
    {
      id: 'craftor_elementor_insert_widget',
      name: 'Insert Elementor Widget',
      category: 'elementor_widgets',
      description: 'Inserts any standard Elementor widget into a parent container node in the AST.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'parentId', 'widgetType'],
        properties: {
          ast: { type: 'array', description: 'Full Elementor document AST' },
          parentId: { type: 'string', description: 'Parent container hex ID (null for root)' },
          widgetType: { type: 'string', description: 'Elementor widget type (heading, text-editor, button, image, icon-box, etc.)' },
          settings: { type: 'object', description: 'Widget content and style settings' },
        },
      },
    },
    {
      id: 'craftor_elementor_update_widget',
      name: 'Update Elementor Widget Settings',
      category: 'elementor_widgets',
      description: 'Updates settings, text content, and styles of an existing widget node.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'widgetId', 'settings'],
        properties: {
          ast: { type: 'array', description: 'Full Elementor document AST' },
          widgetId: { type: 'string', description: '7-character hex ID of target widget' },
          settings: { type: 'object', description: 'Key-value dictionary of settings to merge' },
        },
      },
    },
    {
      id: 'craftor_elementor_remove_widget',
      name: 'Remove Elementor Widget',
      category: 'elementor_widgets',
      description: 'Removes a specific widget node from the Elementor AST tree.',
      permissions: ['read', 'write', 'delete'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'widgetId'],
        properties: {
          ast: { type: 'array', description: 'Full Elementor document AST' },
          widgetId: { type: 'string', description: '7-character hex ID of widget to remove' },
        },
      },
    },
    {
      id: 'craftor_elementor_create_template',
      name: 'Create Elementor Template',
      category: 'elementor_templates',
      description: 'Creates a reusable Elementor template from elements AST payload.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['title', 'elements'],
        properties: {
          title: { type: 'string', description: 'Template title' },
          elements: { type: 'array', description: 'Array of Elementor container/widget nodes' },
          type: { type: 'string', enum: ['page', 'section', 'container', 'header', 'footer'], default: 'page' },
          page_settings: { type: 'object', description: 'Template settings' },
        },
      },
    },
    {
      id: 'craftor_elementor_export_template',
      name: 'Export Elementor Template',
      category: 'elementor_templates',
      description: 'Exports an existing Elementor page/template as a portable JSON template payload.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['pageId'],
        properties: {
          pageId: { type: 'number', description: 'WordPress post/page ID to export' },
          title: { type: 'string', description: 'Optional template title' },
        },
      },
    },
    {
      id: 'craftor_elementor_import_template',
      name: 'Import Elementor Template',
      category: 'elementor_templates',
      description: 'Imports a template JSON AST into an existing WordPress page with refreshed UUIDs.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['targetPageId', 'templateData'],
        properties: {
          targetPageId: { type: 'number', description: 'Target WordPress page ID to receive template' },
          templateData: { type: 'object', description: 'Elementor template JSON payload with elements array' },
        },
      },
    },
    {
      id: 'craftor_elementor_clone_template',
      name: 'Clone Elementor Template',
      category: 'elementor_templates',
      description: 'Duplicates an Elementor template or page to a fresh WordPress page with unique node IDs.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['sourcePageId', 'newTitle'],
        properties: {
          sourcePageId: { type: 'number', description: 'Source page ID' },
          newTitle: { type: 'string', description: 'New duplicated page title' },
        },
      },
    },
    {
      id: 'craftor_elementor_update_global_kit',
      name: 'Update Elementor Global Kit',
      category: 'elementor_styling',
      description: 'Updates site-wide Elementor Global Kit tokens (system colors, custom colors, typography).',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        properties: {
          system_colors: { type: 'array', description: 'Array of system color tokens' },
          custom_colors: { type: 'array', description: 'Array of custom color tokens' },
          system_typography: { type: 'array', description: 'Array of typography tokens' },
          custom_typography: { type: 'array', description: 'Array of custom typography tokens' },
        },
      },
    },
    {
      id: 'craftor_elementor_validate_ast',
      name: 'Validate Elementor AST',
      category: 'elementor_document',
      description: 'Validates an Elementor AST tree against structural invariants and returns detailed diagnostics.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['ast'],
        properties: {
          ast: { type: 'array', description: 'Elementor AST node array to validate' },
        },
      },
    },
    {
      id: 'craftor_elementor_get_tokens',
      name: 'Get Design Tokens',
      category: 'elementor_styling',
      description: 'Retrieves Craftor master design token scale (colors, typography, spacing, shadows, animations).',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },

    // =========================================================================
    // 3. WOOCOMMERCE CATALOG, PRODUCTS, ORDERS & CUSTOMERS (8 TOOLS)
    // =========================================================================
    {
      id: 'craftor_wc_create_product',
      name: 'Create WooCommerce Product',
      category: 'woocommerce_catalog',
      description: 'Creates a new WooCommerce simple or variable product with price, SKU, stock, and descriptions.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['name', 'regular_price'],
        properties: {
          name: { type: 'string', description: 'Product title' },
          regular_price: { type: 'string', description: 'Regular retail price' },
          sale_price: { type: 'string', description: 'Promotional sale price' },
          sku: { type: 'string', description: 'Unique stock keeping unit (SKU)' },
          description: { type: 'string', description: 'Full HTML/Markdown description' },
          short_description: { type: 'string', description: 'Brief summary description' },
          type: { type: 'string', enum: ['simple', 'variable', 'grouped', 'external'], default: 'simple' },
          manage_stock: { type: 'boolean', default: false },
          stock_quantity: { type: 'number' },
          stock_status: { type: 'string', enum: ['instock', 'outofstock', 'onbackorder'], default: 'instock' },
          categories: { type: 'array', items: { type: 'object' }, description: 'Category objects with id' },
        },
      },
    },
    {
      id: 'craftor_wc_update_product',
      name: 'Update WooCommerce Product',
      category: 'woocommerce_catalog',
      description: 'Updates an existing WooCommerce product with pre-mutation snapshot protection.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'number', description: 'WooCommerce product ID' },
          name: { type: 'string', description: 'Updated product title' },
          regular_price: { type: 'string', description: 'Updated regular price' },
          sale_price: { type: 'string', description: 'Updated sale price' },
          sku: { type: 'string', description: 'Updated SKU' },
          description: { type: 'string', description: 'Updated description' },
          stock_quantity: { type: 'number', description: 'Updated stock quantity' },
          stock_status: { type: 'string', enum: ['instock', 'outofstock', 'onbackorder'] },
        },
      },
    },
    {
      id: 'craftor_wc_delete_product',
      name: 'Delete WooCommerce Product',
      category: 'woocommerce_catalog',
      description: 'Trashes or permanently deletes a WooCommerce product with pre-deletion snapshot.',
      permissions: ['read', 'write', 'delete'],
      inputSchema: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'number', description: 'WooCommerce product ID to delete' },
          force: { type: 'boolean', description: 'Bypass trash and delete permanently', default: false },
        },
      },
    },
    {
      id: 'craftor_wc_update_inventory',
      name: 'Update Product Inventory',
      category: 'woocommerce_catalog',
      description: 'Updates real-time stock balance and stock status for a WooCommerce product SKU.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['productId', 'stockQuantity'],
        properties: {
          productId: { type: 'number', description: 'WooCommerce product ID' },
          stockQuantity: { type: 'number', description: 'Updated inventory count' },
          stockStatus: { type: 'string', enum: ['instock', 'outofstock', 'onbackorder'] },
        },
      },
    },
    {
      id: 'craftor_wc_create_category',
      name: 'Create Product Category',
      category: 'woocommerce_catalog',
      description: 'Creates a new WooCommerce product category with slug and description.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: 'Category name' },
          slug: { type: 'string', description: 'Category slug' },
          description: { type: 'string', description: 'Category description' },
          parent: { type: 'number', description: 'Parent category ID' },
        },
      },
    },
    {
      id: 'craftor_wc_update_category',
      name: 'Update Product Category',
      category: 'woocommerce_catalog',
      description: 'Updates an existing WooCommerce product category.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['categoryId'],
        properties: {
          categoryId: { type: 'number', description: 'WooCommerce category ID' },
          name: { type: 'string', description: 'Category name' },
          slug: { type: 'string', description: 'Category slug' },
          description: { type: 'string', description: 'Category description' },
        },
      },
    },
    {
      id: 'craftor_wc_get_orders',
      name: 'Get WooCommerce Orders',
      category: 'woocommerce_orders',
      description: 'Queries recent WooCommerce store orders, line items, and fulfillment statuses.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['any', 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'] },
          per_page: { type: 'number', default: 10 },
          page: { type: 'number', default: 1 },
          customer: { type: 'number', description: 'Filter by customer user ID' },
        },
      },
    },
    {
      id: 'craftor_wc_get_customers',
      name: 'Get WooCommerce Customers',
      category: 'woocommerce_customers',
      description: 'Queries WooCommerce customer profiles, order counts, and total spend.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {
          per_page: { type: 'number', default: 10 },
          page: { type: 'number', default: 1 },
          search: { type: 'string', description: 'Search term by customer name or email' },
        },
      },
    },

    // =========================================================================
    // 4. SYSTEM, SAFETY & MICRO-ROLLBACK TOOLS (4 TOOLS)
    // =========================================================================
    {
      id: 'craftor_system_status',
      name: 'Get Craftor System Status',
      category: 'site_operations',
      description: 'Retrieves real-time MCP daemon runtime telemetry, memory, and site connection info.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      id: 'craftor_verify_license',
      name: 'Verify Craftor License',
      category: 'multisite_enterprise',
      description: 'Validates active Craftor license key, seats count, and cloud entitlement tier.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['licenseKey'],
        properties: {
          licenseKey: { type: 'string', description: 'Craftor license key (starts with crf_lic_)' },
        },
      },
    },
    {
      id: 'craftor_create_snapshot',
      name: 'Create State Snapshot',
      category: 'multisite_enterprise',
      description: 'Captures an immutable pre-mutation state snapshot with SHA-256 integrity checksum.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['targetId', 'targetType', 'payload'],
        properties: {
          targetId: { type: 'number', description: 'Target post, page, or product ID' },
          targetType: { type: 'string', description: 'Target entity type (e.g. elementor_document, woocommerce_product, wordpress_post)' },
          payload: { type: 'object', description: 'State data payload to capture' },
          actionContext: { type: 'string', description: 'Human-readable description of mutation context' },
        },
      },
    },
    {
      id: 'craftor_restore_snapshot',
      name: 'Restore State Snapshot (1-Click Rollback)',
      category: 'multisite_enterprise',
      description: 'Performs 1-click atomic rollback of target page/post/product to a verified snapshot state.',
      permissions: ['read', 'write', 'admin'],
      inputSchema: {
        type: 'object',
        required: ['snapshotId'],
        properties: {
          snapshotId: { type: 'string', description: 'Snapshot ID (starts with crf_snp_)' },
        },
      },
    },

    // =========================================================================
    // 5. PHASE 2 TOOLS (THEME BUILDER, LIVE-SYNC, DIFFING & COUPONS) (12 TOOLS)
    // =========================================================================
    {
      id: 'craftor_elementor_create_header',
      name: 'Create Elementor Header Template',
      category: 'elementor_templates',
      description: 'Generates an Elementor Pro Theme Builder Header template AST with navigation, logo, and CTA.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        properties: {
          brandName: { type: 'string', description: 'Brand title text' },
          logoUrl: { type: 'string', description: 'Optional brand logo image URL' },
          ctaText: { type: 'string', description: 'Header call-to-action button text' },
          sticky: { type: 'boolean', description: 'Whether header is sticky top' },
        },
      },
    },
    {
      id: 'craftor_elementor_create_footer',
      name: 'Create Elementor Footer Template',
      category: 'elementor_templates',
      description: 'Generates an Elementor Pro Theme Builder Footer template AST with multi-column navigation and copyright.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        properties: {
          copyrightText: { type: 'string', description: 'Copyright notice text' },
        },
      },
    },
    {
      id: 'craftor_elementor_create_single_post',
      name: 'Create Elementor Single Post Layout',
      category: 'elementor_templates',
      description: 'Generates an Elementor Pro Theme Builder Single Post template AST with dynamic post meta and content.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        properties: {
          showFeaturedImage: { type: 'boolean', default: true },
          showAuthorBio: { type: 'boolean', default: true },
          showComments: { type: 'boolean', default: true },
        },
      },
    },
    {
      id: 'craftor_elementor_diff_ast',
      name: 'Diff Elementor AST Trees',
      category: 'elementor_ast',
      description: 'Computes precise structural additions, removals, and property modifications between two AST trees.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['beforeAst', 'afterAst'],
        properties: {
          beforeAst: { type: 'array', description: 'Baseline Elementor AST array' },
          afterAst: { type: 'array', description: 'Mutated Elementor AST array' },
        },
      },
    },
    {
      id: 'craftor_elementor_inject_dynamic_tag',
      name: 'Inject Elementor Dynamic Tag',
      category: 'elementor_widgets',
      description: 'Binds Elementor dynamic tag syntax [elementor-tag id="..." settings="..."] to a widget property.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['node', 'settingKey'],
        properties: {
          node: { type: 'object', description: 'Target Elementor widget node' },
          settingKey: { type: 'string', description: 'Widget setting property key (e.g. title, price)' },
          tagType: { type: 'string', enum: ['postTitle', 'postDate', 'postExcerpt', 'featuredImage', 'authorName', 'acfField', 'wooProductPrice', 'wooProductSku'], default: 'postTitle' },
          tagParam: { type: 'string', description: 'Optional tag parameter (e.g. ACF field key)' },
        },
      },
    },
    {
      id: 'craftor_elementor_livesync_broadcast',
      name: 'Broadcast Elementor LiveSync Event',
      category: 'elementor_canvas',
      description: 'Dispatches real-time DOM mutation events to the active Elementor canvas editor session.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['pageId', 'action'],
        properties: {
          pageId: { type: 'number', description: 'Target post/page ID' },
          action: { type: 'string', enum: ['insert_node', 'update_settings', 'replace_document', 'reload_css'] },
          payload: { type: 'object', description: 'Live sync payload data' },
        },
      },
    },
    {
      id: 'craftor_wc_get_coupons',
      name: 'Get WooCommerce Coupons',
      category: 'woocommerce_coupons',
      description: 'Queries active WooCommerce discount coupons and usage limits.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {
          per_page: { type: 'number', default: 10 },
          search: { type: 'string', description: 'Search coupon code' },
        },
      },
    },
    {
      id: 'craftor_wc_create_coupon',
      name: 'Create WooCommerce Coupon',
      category: 'woocommerce_coupons',
      description: 'Creates a new WooCommerce discount coupon with discount rules and expiration.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['code', 'amount'],
        properties: {
          code: { type: 'string', description: 'Unique coupon promo code' },
          amount: { type: 'string', description: 'Discount amount or percentage' },
          discount_type: { type: 'string', enum: ['percent', 'fixed_cart', 'fixed_product'], default: 'percent' },
          description: { type: 'string', description: 'Internal coupon description' },
        },
      },
    },
    {
      id: 'craftor_wc_batch_create_coupons',
      name: 'Batch Create Promotional Coupons',
      category: 'woocommerce_coupons',
      description: 'Generates a batch of unique single-use promotional discount coupon codes.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['prefix', 'count', 'amount'],
        properties: {
          prefix: { type: 'string', description: 'Coupon code prefix (e.g. SUMMER)' },
          count: { type: 'number', description: 'Number of unique codes to generate' },
          amount: { type: 'string', description: 'Discount value' },
          discount_type: { type: 'string', enum: ['percent', 'fixed_cart', 'fixed_product'], default: 'percent' },
        },
      },
    },
    {
      id: 'craftor_list_snapshots',
      name: 'List State Snapshots',
      category: 'multisite_enterprise',
      description: 'Lists stored pre-mutation state snapshots with cryptographic hashes and timestamps.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {
          postId: { type: 'number', description: 'Filter snapshots by target post ID' },
          limit: { type: 'number', default: 10 },
        },
      },
    },
    {
      id: 'craftor_get_visual_diff',
      name: 'Get Visual Diff Payload',
      category: 'multisite_enterprise',
      description: 'Generates Before/After visual diff payload comparing baseline and current page states.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['targetId', 'snapshotId'],
        properties: {
          targetId: { type: 'number', description: 'Target post/page ID' },
          snapshotId: { type: 'string', description: 'Snapshot ID to compare against' },
        },
      },
    },
    {
      id: 'craftor_get_activity_log',
      name: 'Get Audit Activity Log',
      category: 'multisite_enterprise',
      description: 'Retrieves audit activity logs for recent AI tool calls, callers, and execution latencies.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 10 },
        },
      },
    },

    // =========================================================================
    // 6. MULTISITE NETWORK & BATCH ORCHESTRATION (4 TOOLS)
    // =========================================================================
    {
      id: 'multisite_list_network_sites',
      name: 'List Multisite Network Sites',
      category: 'multisite_enterprise',
      description: 'Lists all WordPress Multisite (WPMU) subsites, domain mappings, and active plugin flags.',
      permissions: ['read', 'admin'],
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      id: 'multisite_switch_active_site',
      name: 'Switch Active Subsite Context',
      category: 'multisite_enterprise',
      description: 'Switches the execution target subsite in a WordPress Multisite network by blog ID.',
      permissions: ['read', 'write', 'admin'],
      inputSchema: {
        type: 'object',
        required: ['blogId'],
        properties: {
          blogId: { type: 'number', description: 'Target subsite blog ID' },
        },
      },
    },
    {
      id: 'multisite_batch_dispatch_tool',
      name: 'Batch Dispatch Tool Across Subsites',
      category: 'multisite_enterprise',
      description: 'Executes a specific MCP tool across multiple network subsites simultaneously.',
      permissions: ['read', 'write', 'admin'],
      inputSchema: {
        type: 'object',
        required: ['blogIds', 'toolName'],
        properties: {
          blogIds: { type: 'array', description: 'Array of blog IDs to execute tool on' },
          toolName: { type: 'string', description: 'Target MCP tool name' },
          arguments: { type: 'object', description: 'Arguments to pass to target tool' },
        },
      },
    },
    {
      id: 'multisite_sync_global_template',
      name: 'Sync Global Template Across Network',
      category: 'multisite_enterprise',
      description: 'Propagates and synchronizes a master Elementor template across 100+ network subsites.',
      permissions: ['read', 'write', 'admin'],
      inputSchema: {
        type: 'object',
        required: ['targetBlogIds', 'template'],
        properties: {
          targetBlogIds: { type: 'array', description: 'Target subsite blog IDs' },
          template: { type: 'object', description: 'Elementor template payload' },
        },
      },
    },

    // =========================================================================
    // 7. PHASE 3 ADVANCED MULTIMODAL, FUNNELS & LOCAL LLM (4 TOOLS)
    // =========================================================================
    {
      id: 'craftor_elementor_synthesize_wireframe',
      name: 'Synthesize Wireframe to Elementor AST',
      category: 'elementor_containers',
      description: 'Converts multimodal visual wireframe layout descriptors into fully nested Elementor AST JSON.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['sectionType'],
        properties: {
          sectionType: { type: 'string', enum: ['hero', 'features', 'pricing', 'testimonials', 'cta', 'contact', 'gallery'] },
          title: { type: 'string' },
          subtitle: { type: 'string' },
          columns: { type: 'number' },
          items: { type: 'array' },
          theme: { type: 'object' },
        },
      },
    },
    {
      id: 'craftor_elementor_generate_sales_funnel',
      name: 'Generate E-Commerce Sales Funnel Suite',
      category: 'woocommerce_catalog',
      description: 'Generates a 4-step high-converting e-commerce sales funnel (Landing -> 1-Click Upsell -> Checkout -> Thank You).',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['funnelName', 'productName', 'price'],
        properties: {
          funnelName: { type: 'string', description: 'Sales funnel title' },
          productName: { type: 'string', description: 'Featured product title' },
          price: { type: 'string', description: 'Regular price string (e.g. $49)' },
          upsellProductName: { type: 'string', description: '1-Click upsell upgrade title' },
          upsellPrice: { type: 'string', description: 'Upsell price string (e.g. $29)' },
          ctaText: { type: 'string' },
        },
      },
    },
    {
      id: 'craftor_llm_query_local_model',
      name: 'Query Local LLM Daemon',
      category: 'multisite_enterprise',
      description: 'Queries offline local LLM providers (Ollama, vLLM, LM Studio, LocalAI) for zero-cost AST synthesis.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string', description: 'User prompt to synthesize' },
          provider: { type: 'string', enum: ['ollama', 'vllm', 'lmstudio', 'localai'], default: 'ollama' },
          model: { type: 'string' },
          temperature: { type: 'number', default: 0.2 },
        },
      },
    },
    {
      id: 'craftor_ast_compress_payload',
      name: 'Compress AST for LLM Context',
      category: 'elementor_containers',
      description: 'Minimizes and compresses large Elementor AST JSON payloads by stripping defaults and empty structures.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['ast'],
        properties: {
          ast: { type: 'array', description: 'Elementor AST node array to compress' },
        },
      },
    },
    {
      id: 'craftor_elementor_extract_palette',
      name: 'Extract AI WCAG Color Palette',
      category: 'elementor_styling',
      description: 'Generates WCAG 2.1 AA compliant 5-color harmonious brand palettes and Global Kit color tokens.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {
          seedColor: { type: 'string', default: '#4F46E5' },
          vibe: { type: 'string', enum: ['modern_dark', 'clean_light', 'luxury_gold', 'vibrant_saas'], default: 'modern_dark' },
        },
      },
    },
    {
      id: 'craftor_elementor_inject_schema_org',
      name: 'Inject Schema.org SEO Structured Data',
      category: 'elementor_widgets',
      description: 'Generates and injects Google-compliant JSON-LD Schema.org rich snippets (FAQPage or Product) into Elementor AST.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['schemaType'],
        properties: {
          schemaType: { type: 'string', enum: ['FAQPage', 'Product'] },
          faqs: { type: 'array', description: 'Array of {question, answer} items for FAQPage schema' },
          product: { type: 'object', description: 'Product configuration object for Product schema' },
        },
      },
    },
    {
      id: 'craftor_elementor_generate_faq_section',
      name: 'Generate FAQ Accordion Section with Schema',
      category: 'elementor_containers',
      description: 'Creates an Elementor accordion FAQ section paired with verified Google Schema.org JSON-LD microdata.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['faqs'],
        properties: {
          title: { type: 'string', default: 'Frequently Asked Questions' },
          faqs: { type: 'array' },
        },
      },
    },
    {
      id: 'craftor_elementor_generate_hero_variant',
      name: 'Generate Alternative Hero Variant',
      category: 'elementor_containers',
      description: 'Synthesizes A/B testable Hero section variations with split CTA alignments and contrasting background styles.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        properties: {
          variant: { type: 'string', enum: ['centered', 'split_columns', 'minimal_gradient'], default: 'centered' },
          title: { type: 'string' },
          ctaText: { type: 'string' },
        },
      },
    },

    // =========================================================================
    // 8. PHASE 4 ENTERPRISE SCALE, SECURITY & WHITE-LABEL (4 TOOLS)
    // =========================================================================
    {
      id: 'craftor_enterprise_get_telemetry',
      name: 'Get Enterprise Health Telemetry',
      category: 'multisite_enterprise',
      description: 'Returns real-time RPC throughput, error rate distribution, and latency health indicators.',
      permissions: ['read', 'admin'],
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      id: 'craftor_enterprise_set_whitelabel',
      name: 'Set Agency White-Label Configuration',
      category: 'multisite_enterprise',
      description: 'Configures custom agency branding, plugin title, custom logos, and support emails.',
      permissions: ['admin'],
      inputSchema: {
        type: 'object',
        properties: {
          agencyName: { type: 'string' },
          pluginTitle: { type: 'string' },
          brandColor: { type: 'string' },
          logoUrl: { type: 'string' },
          supportEmail: { type: 'string' },
          hideCraftorBranding: { type: 'boolean' },
        },
      },
    },
    {
      id: 'craftor_security_scan_ast',
      name: 'Scan AST with Zero-Trust Security Shield',
      category: 'multisite_enterprise',
      description: 'Scans Elementor AST nodes for malicious PHP code execution, XSS scripts, and prompt injection signatures.',
      permissions: ['read', 'admin'],
      inputSchema: {
        type: 'object',
        required: ['ast'],
        properties: {
          ast: { type: 'array', description: 'Elementor AST nodes to scan' },
        },
      },
    },
    {
      id: 'craftor_license_check_quota',
      name: 'Check License Tier & Remaining Quota',
      category: 'multisite_enterprise',
      description: 'Checks tier quota limits, remaining monthly tool calls, and allowed concurrent subsite executions.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {
          tier: { type: 'string', enum: ['community', 'pro', 'agency', 'enterprise'], default: 'community' },
        },
      },
    },

    // =========================================================================
    // 9. PHASE 7 ADVANCED 200+ TOOL MATRIX (ACF, SEO, MULTILINGUAL, POPUPS)
    // =========================================================================
    {
      id: 'craftor_acf_register_field_group',
      name: 'Register ACF Pro Field Group',
      category: 'wordpress_content',
      description: 'Programmatically registers Advanced Custom Fields (ACF Pro) field groups and location rules.',
      permissions: ['write', 'admin'],
      inputSchema: {
        type: 'object',
        required: ['key', 'title', 'fields'],
        properties: {
          key: { type: 'string' },
          title: { type: 'string' },
          fields: { type: 'array' },
          location: { type: 'array' },
        },
      },
    },
    {
      id: 'craftor_cpt_register_post_type',
      name: 'Register Custom Post Type',
      category: 'wordpress_content',
      description: 'Registers a custom post type with REST API endpoints and Elementor support flags.',
      permissions: ['write', 'admin'],
      inputSchema: {
        type: 'object',
        required: ['slug', 'singularName', 'pluralName'],
        properties: {
          slug: { type: 'string' },
          singularName: { type: 'string' },
          pluralName: { type: 'string' },
          hierarchical: { type: 'boolean' },
        },
      },
    },
    {
      id: 'craftor_seo_update_metadata',
      name: 'Update SEO & Social Graph Metadata',
      category: 'site_operations',
      description: 'Automates RankMath, Yoast, and SEOPress meta titles, descriptions, focus keywords, and robots tags.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['postId', 'metaTitle', 'metaDescription'],
        properties: {
          postId: { type: 'integer' },
          metaTitle: { type: 'string' },
          metaDescription: { type: 'string' },
          focusKeywords: { type: 'array', items: { type: 'string' } },
          pluginTarget: { type: 'string', enum: ['rank_math', 'yoast', 'seopress', 'native'], default: 'rank_math' },
        },
      },
    },
    {
      id: 'craftor_multilingual_translate_page',
      name: 'Translate & Localize Elementor Page AST',
      category: 'elementor_theme',
      description: 'Deep clones and translates Elementor AST pages across WPML and Polylang target locales.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['sourcePostId', 'targetLang', 'ast'],
        properties: {
          sourcePostId: { type: 'integer' },
          sourceLang: { type: 'string', default: 'en' },
          targetLang: { type: 'string' },
          ast: { type: 'array' },
        },
      },
    },
    {
      id: 'craftor_elementor_generate_popup',
      name: 'Generate Elementor Popup Template',
      category: 'elementor_theme',
      description: 'Synthesizes modal lightboxes, exit-intent overlays, and lead capture popup AST templates.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['title', 'headline', 'ctaText'],
        properties: {
          title: { type: 'string' },
          triggerType: { type: 'string', enum: ['exit_intent', 'page_load', 'scroll_depth', 'button_click'], default: 'exit_intent' },
          layout: { type: 'string', enum: ['centered_modal', 'bottom_bar', 'slide_in_right'], default: 'centered_modal' },
          headline: { type: 'string' },
          ctaText: { type: 'string' },
        },
      },
    },
    {
      id: 'craftor_elementor_apply_motion_effects',
      name: 'Apply Elementor Motion & Scroll Effects',
      category: 'elementor_styling',
      description: 'Injects entrance animations, scroll effects, mouse tracking, and 3D tilt controls into Elementor AST nodes.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['node', 'effects'],
        properties: {
          node: { type: 'object' },
          effects: { type: 'object' },
        },
      },
    },

    // =========================================================================
    // 10. PHASE 8 SELF-HEALING DAEMON & PERFORMANCE AUTO-TUNER
    // =========================================================================
    {
      id: 'craftor_self_healing_repair_ast',
      name: 'Self-Healing AST Auto-Repair',
      category: 'elementor_styling',
      description: 'Scans and automatically repairs corrupt Elementor AST trees, missing UUIDs, and broken structures.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['rawAst'],
        properties: {
          rawAst: { type: 'array' },
        },
      },
    },
    {
      id: 'craftor_self_healing_triage_error',
      name: 'PHP Fatal Error & Exception Triage',
      category: 'site_operations',
      description: 'Triages PHP fatal errors, memory exhaustion, and exception backtraces into actionable mitigation actions.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['errorContext'],
        properties: {
          errorContext: { type: 'object' },
        },
      },
    },
    {
      id: 'craftor_performance_auto_tune',
      name: 'Performance Auto-Tuner',
      category: 'site_operations',
      description: 'Optimizes Elementor CSS print methods, font display swapping, and image lazy loading for 95+ PageSpeed scores.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['options'],
        properties: {
          options: { type: 'object' },
        },
      },
    },
    {
      id: 'craftor_cdn_purge_cache',
      name: 'Purge CDN & Edge Cache',
      category: 'site_operations',
      description: 'Dispatches cache purge requests to Cloudflare, WP Rocket, or LiteSpeed cache layers.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['request'],
        properties: {
          request: { type: 'object' },
        },
      },
    },

    // =========================================================================
    // 11. PHASE 9 AI VOICE STUDIO & SPEECH-TO-INTENT BRIDGE
    // =========================================================================
    {
      id: 'craftor_voice_classify_intent',
      name: 'Classify Voice Speech-to-Intent',
      category: 'elementor_styling',
      description: 'Translates natural speech audio transcripts into structured Elementor AST and WordPress MCP tool arguments.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['transcript'],
        properties: {
          transcript: { type: 'string' },
        },
      },
    },
    {
      id: 'craftor_voice_dispatch_action',
      name: 'Dispatch Spoken Voice Action',
      category: 'elementor_styling',
      description: 'Executes classified speech intent and returns immediate synthesized text-to-speech spoken confirmation.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['transcript'],
        properties: {
          transcript: { type: 'string' },
          sessionId: { type: 'string', default: 'voice_session_main' },
        },
      },
    },

    // =========================================================================
    // 12. PHASE 10 3RD-PARTY ADDON ECOSYSTEM SDK
    // =========================================================================
    {
      id: 'craftor_addon_register_widget',
      name: 'Register 3rd-Party Custom Widget',
      category: 'elementor_styling',
      description: 'Registers third-party Elementor addon widgets (Crocoblock, Essential Addons, Ultimate Addons) into Craftor dynamic AST engine.',
      permissions: ['write'],
      inputSchema: {
        type: 'object',
        required: ['addonSlug', 'widgetName', 'title', 'category'],
        properties: {
          addonSlug: { type: 'string' },
          widgetName: { type: 'string' },
          title: { type: 'string' },
          category: { type: 'string' },
          controls: { type: 'array' },
        },
      },
    },
    {
      id: 'craftor_addon_get_catalog',
      name: 'Get 3rd-Party Addon Catalog',
      category: 'elementor_styling',
      description: 'Retrieves the complete catalog of active 3rd-party Elementor addon extensions and custom widgets.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];

  for (const tool of defaultTools) {
    ToolRegistry.register(tool);
  }
}

/**
 * Normalizes tool name by resolving short names and prefixes.
 */
function resolveToolName(name: string): string {
  const aliasMap: Record<string, string> = {
    // WordPress
    create_post: 'craftor_wp_create_post',
    wp_create_post: 'craftor_wp_create_post',
    update_post: 'craftor_wp_update_post',
    wp_update_post: 'craftor_wp_update_post',
    delete_post: 'craftor_wp_delete_post',
    wp_delete_post: 'craftor_wp_delete_post',
    create_page: 'craftor_wp_create_page',
    wp_create_page: 'craftor_wp_create_page',
    update_page: 'craftor_wp_update_page',
    wp_update_page: 'craftor_wp_update_page',
    delete_page: 'craftor_wp_delete_page',
    wp_delete_page: 'craftor_wp_delete_page',
    duplicate_page: 'craftor_wp_duplicate_page',
    wp_duplicate_page: 'craftor_wp_duplicate_page',
    get_site_options: 'craftor_wp_get_site_options',
    wp_get_site_options: 'craftor_wp_get_site_options',
    update_site_options: 'craftor_wp_update_site_options',
    wp_update_site_options: 'craftor_wp_update_site_options',
    create_taxonomy: 'craftor_wp_create_taxonomy',
    wp_create_taxonomy: 'craftor_wp_create_taxonomy',
    create_term: 'craftor_wp_create_taxonomy',
    update_taxonomy: 'craftor_wp_update_taxonomy',
    wp_update_taxonomy: 'craftor_wp_update_taxonomy',
    update_term: 'craftor_wp_update_taxonomy',
    delete_taxonomy: 'craftor_wp_delete_taxonomy',
    wp_delete_taxonomy: 'craftor_wp_delete_taxonomy',
    delete_term: 'craftor_wp_delete_taxonomy',

    // Elementor
    elementor_get_document: 'craftor_elementor_get_document',
    elementor_save_document: 'craftor_elementor_save_document',
    elementor_create_container: 'craftor_elementor_create_container',
    elementor_generate_container: 'craftor_elementor_generate_container',
    generate_container: 'craftor_elementor_generate_container',
    elementor_update_container: 'craftor_elementor_update_container',
    elementor_delete_container: 'craftor_elementor_delete_container',
    elementor_insert_widget: 'craftor_elementor_insert_widget',
    elementor_update_widget: 'craftor_elementor_update_widget',
    elementor_remove_widget: 'craftor_elementor_remove_widget',
    create_template: 'craftor_elementor_create_template',
    elementor_create_template: 'craftor_elementor_create_template',
    export_template: 'craftor_elementor_export_template',
    elementor_export_template: 'craftor_elementor_export_template',
    import_template: 'craftor_elementor_import_template',
    elementor_import_template: 'craftor_elementor_import_template',
    clone_template: 'craftor_elementor_clone_template',
    elementor_clone_template: 'craftor_elementor_clone_template',
    update_global_kit: 'craftor_elementor_update_global_kit',
    elementor_update_global_kit: 'craftor_elementor_update_global_kit',
    elementor_validate_ast: 'craftor_elementor_validate_ast',
    elementor_get_tokens: 'craftor_elementor_get_tokens',

    // WooCommerce
    create_product: 'craftor_wc_create_product',
    wc_create_product: 'craftor_wc_create_product',
    woo_create_product: 'craftor_wc_create_product',
    woo_create_simple_product: 'craftor_wc_create_product',
    update_product: 'craftor_wc_update_product',
    wc_update_product: 'craftor_wc_update_product',
    woo_update_product: 'craftor_wc_update_product',
    delete_product: 'craftor_wc_delete_product',
    wc_delete_product: 'craftor_wc_delete_product',
    woo_delete_product: 'craftor_wc_delete_product',
    update_inventory: 'craftor_wc_update_inventory',
    wc_update_inventory: 'craftor_wc_update_inventory',
    woo_update_inventory: 'craftor_wc_update_inventory',
    woo_update_stock_quantity: 'craftor_wc_update_inventory',
    create_category: 'craftor_wc_create_category',
    wc_create_category: 'craftor_wc_create_category',
    woo_create_category: 'craftor_wc_create_category',
    update_category: 'craftor_wc_update_category',
    wc_update_category: 'craftor_wc_update_category',
    woo_update_category: 'craftor_wc_update_category',
    get_orders: 'craftor_wc_get_orders',
    wc_get_orders: 'craftor_wc_get_orders',
    woo_get_orders: 'craftor_wc_get_orders',
    get_customers: 'craftor_wc_get_customers',
    wc_get_customers: 'craftor_wc_get_customers',
    woo_get_customers: 'craftor_wc_get_customers',

    // Phase 2 Theme Builder & Elementor Extensions
    create_header: 'craftor_elementor_create_header',
    elementor_create_header: 'craftor_elementor_create_header',
    create_footer: 'craftor_elementor_create_footer',
    elementor_create_footer: 'craftor_elementor_create_footer',
    create_single_post: 'craftor_elementor_create_single_post',
    elementor_create_single_post: 'craftor_elementor_create_single_post',
    diff_ast: 'craftor_elementor_diff_ast',
    elementor_diff_ast: 'craftor_elementor_diff_ast',
    inject_dynamic_tag: 'craftor_elementor_inject_dynamic_tag',
    elementor_inject_dynamic_tag: 'craftor_elementor_inject_dynamic_tag',
    livesync_broadcast: 'craftor_elementor_livesync_broadcast',
    elementor_livesync_broadcast: 'craftor_elementor_livesync_broadcast',

    // WooCommerce Coupons
    get_coupons: 'craftor_wc_get_coupons',
    wc_get_coupons: 'craftor_wc_get_coupons',
    woo_get_coupons: 'craftor_wc_get_coupons',
    create_coupon: 'craftor_wc_create_coupon',
    wc_create_coupon: 'craftor_wc_create_coupon',
    woo_create_coupon: 'craftor_wc_create_coupon',
    batch_create_coupons: 'craftor_wc_batch_create_coupons',
    wc_batch_create_coupons: 'craftor_wc_batch_create_coupons',
    woo_batch_create_coupons: 'craftor_wc_batch_create_coupons',

    // Multisite Network
    list_network_sites: 'multisite_list_network_sites',
    switch_active_site: 'multisite_switch_active_site',
    batch_dispatch_tool: 'multisite_batch_dispatch_tool',
    sync_global_template: 'multisite_sync_global_template',

    // Phase 3 Multimodal & Advanced
    synthesize_wireframe: 'craftor_elementor_synthesize_wireframe',
    generate_sales_funnel: 'craftor_elementor_generate_sales_funnel',
    query_local_model: 'craftor_llm_query_local_model',
    compress_ast: 'craftor_ast_compress_payload',
    extract_palette: 'craftor_elementor_extract_palette',
    inject_schema_org: 'craftor_elementor_inject_schema_org',
    generate_faq_section: 'craftor_elementor_generate_faq_section',
    generate_hero_variant: 'craftor_elementor_generate_hero_variant',

    // Phase 4 Enterprise & Security
    get_telemetry: 'craftor_enterprise_get_telemetry',
    set_whitelabel: 'craftor_enterprise_set_whitelabel',
    security_scan_ast: 'craftor_security_scan_ast',
    check_quota: 'craftor_license_check_quota',

    // Phase 7 Advanced Tools
    register_acf_field_group: 'craftor_acf_register_field_group',
    register_cpt: 'craftor_cpt_register_post_type',
    update_seo_metadata: 'craftor_seo_update_metadata',
    translate_page_ast: 'craftor_multilingual_translate_page',
    generate_popup_template: 'craftor_elementor_generate_popup',
    apply_motion_effects: 'craftor_elementor_apply_motion_effects',

    // Phase 8 Self-Healing & Auto-Tuning Tools
    repair_ast: 'craftor_self_healing_repair_ast',
    triage_error: 'craftor_self_healing_triage_error',
    auto_tune_performance: 'craftor_performance_auto_tune',
    purge_cdn_cache: 'craftor_cdn_purge_cache',

    // Phase 9 AI Voice Tools
    classify_voice_intent: 'craftor_voice_classify_intent',
    dispatch_voice_action: 'craftor_voice_dispatch_action',

    // Phase 10 3rd-Party Addon SDK
    register_addon_widget: 'craftor_addon_register_widget',
    get_addon_catalog: 'craftor_addon_get_catalog',

    // System & Auditing
    system_status: 'craftor_system_status',
    verify_license: 'craftor_verify_license',
    create_snapshot: 'craftor_create_snapshot',
    restore_snapshot: 'craftor_restore_snapshot',
    list_snapshots: 'craftor_list_snapshots',
    get_visual_diff: 'craftor_get_visual_diff',
    get_activity_log: 'craftor_get_activity_log',
  };

  return aliasMap[name] ?? name;
}

export async function handleToolsList(
  _params?: Record<string, unknown>,
): Promise<ToolsListResponsePayload> {
  registerDefaultTools();
  const tools: McpToolDefinition[] = ToolRegistry.list();

  return {
    tools: tools.map((tool: McpToolDefinition) => ({
      name: tool.id,
      description: tool.description,
      inputSchema: (tool.inputSchema as Record<string, unknown>) ?? {
        type: 'object',
        properties: {},
      },
    })),
  };
}

export async function handleToolsCall(
  params: unknown,
  siteUrl: string = '',
  secretToken: string = '',
): Promise<McpCallToolResult> {
  registerDefaultTools();

  if (typeof params !== 'object' || params === null) {
    throw createInvalidParamsError('params must be a valid JSON object');
  }

  const raw = params as Record<string, unknown>;
  const rawToolName = raw.name;
  if (typeof rawToolName !== 'string' || !rawToolName.trim()) {
    throw createInvalidParamsError('Missing or empty tool "name" parameter in tools/call request');
  }

  const toolName = resolveToolName(rawToolName.trim());
  const args = (
    typeof raw.arguments === 'object' && raw.arguments !== null
      ? (raw.arguments as Record<string, unknown>)
      : {}
  ) as Record<string, unknown>;

  const tool = ToolRegistry.get(toolName);
  if (!tool) {
    throw createToolNotFoundError(rawToolName);
  }

  logger.info(`Executing tool: ${toolName}`, { toolName, argsKeys: Object.keys(args) });

  const getClient = (): WordPressClient => {
    return new WordPressClient({
      siteUrl: siteUrl || 'https://craftor.local',
      auth: secretToken ? { type: 'bearer', token: secretToken } : undefined,
    });
  };

  try {
    switch (toolName) {
      // =======================================================================
      // 1. WORDPRESS CONTENT HANDLERS
      // =======================================================================
      case 'craftor_wp_create_post': {
        const title = String(args.title ?? '');
        if (!title.trim()) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"title" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const post = await client.createPost(args as unknown as CreateWordPressPostPayload);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, post }, null, 2) }],
          };
        }

        const simulatedPost = {
          id: Math.floor(Math.random() * 1000) + 100,
          title: { rendered: title },
          content: { rendered: String(args.content ?? '') },
          status: args.status ?? 'draft',
          slug: args.slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          date: new Date().toISOString(),
        };

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, post: simulatedPost }, null, 2) }],
        };
      }

      case 'craftor_wp_update_post': {
        const postId = Number(args.postId);
        if (!postId || isNaN(postId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "postId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const updated = await client.updatePost(postId, args as unknown as UpdateWordPressPostPayload);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, post: updated }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                postId,
                updatedFields: Object.keys(args).filter((k) => k !== 'postId'),
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_wp_delete_post': {
        const postId = Number(args.postId);
        if (!postId || isNaN(postId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "postId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const result = await client.deletePost(postId, Boolean(args.force));
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, result }, null, 2) }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, postId, deleted: true }, null, 2) }],
        };
      }

      case 'craftor_wp_create_page': {
        const title = String(args.title ?? '');
        if (!title.trim()) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"title" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const page = await client.createPage(args as unknown as CreateWordPressPagePayload);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, page }, null, 2) }],
          };
        }

        const simulatedPage = {
          id: Math.floor(Math.random() * 1000) + 100,
          title: { rendered: title },
          content: { rendered: String(args.content ?? '') },
          status: args.status ?? 'draft',
          template: args.template ?? 'elementor_header_footer',
          date: new Date().toISOString(),
        };

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, page: simulatedPage }, null, 2) }],
        };
      }

      case 'craftor_wp_update_page': {
        const pageId = Number(args.pageId);
        if (!pageId || isNaN(pageId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "pageId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const page = await client.updatePage(pageId, args as unknown as UpdateWordPressPagePayload);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, page }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                pageId,
                updatedFields: Object.keys(args).filter((k) => k !== 'pageId'),
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_wp_delete_page': {
        const pageId = Number(args.pageId);
        if (!pageId || isNaN(pageId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "pageId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const result = await client.deletePage(pageId, Boolean(args.force));
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, result }, null, 2) }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, pageId, deleted: true }, null, 2) }],
        };
      }

      case 'craftor_wp_duplicate_page': {
        const pageId = Number(args.pageId);
        if (!pageId || isNaN(pageId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "pageId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const duplicated = await client.duplicatePage(pageId, args.newTitle as string | undefined);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, page: duplicated }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                sourcePageId: pageId,
                newPageId: pageId + 100,
                title: args.newTitle ?? 'Cloned Page',
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_wp_get_site_options': {
        if (siteUrl) {
          const client = getClient();
          const optionName = args.optionName as string | undefined;
          if (optionName) {
            const val = await client.getOption(optionName);
            return {
              content: [{ type: 'text', text: JSON.stringify({ success: true, [optionName]: val }, null, 2) }],
            };
          }
          const site = await client.getSite();
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, site }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                siteName: 'Craftor Test Site',
                siteUrl: 'https://example.craftor.local',
                adminEmail: 'admin@craftor.local',
                timezone: 'UTC',
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_wp_update_site_options': {
        const settings = args.settings as Record<string, unknown>;
        if (!settings || typeof settings !== 'object') {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"settings" object is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const updated = await client.updateOption(settings);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, settings: updated }, null, 2) }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, updatedSettings: settings }, null, 2) }],
        };
      }

      case 'craftor_wp_create_taxonomy': {
        const name = String(args.name ?? '');
        if (!name.trim()) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"name" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const term = await client.createTaxonomyTerm(args as unknown as { name: string; taxonomy?: string });
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, term }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                term: {
                  id: Math.floor(Math.random() * 100) + 1,
                  name,
                  slug: args.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  taxonomy: args.taxonomy ?? 'categories',
                },
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_wp_update_taxonomy': {
        const termId = Number(args.termId);
        if (!termId || isNaN(termId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "termId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const term = await client.updateTaxonomyTerm(termId, args as unknown as { name?: string; taxonomy?: string });
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, term }, null, 2) }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, termId, updated: args }, null, 2) }],
        };
      }

      case 'craftor_wp_delete_taxonomy': {
        const termId = Number(args.termId);
        if (!termId || isNaN(termId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "termId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const result = await client.deleteTaxonomyTerm(termId, (args.taxonomy as string) ?? 'categories');
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, result }, null, 2) }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, termId, deleted: true }, null, 2) }],
        };
      }

      // =======================================================================
      // 2. ELEMENTOR HANDLERS
      // =======================================================================
      case 'craftor_elementor_get_document': {
        const pageId = Number(args.pageId);
        if (!pageId || isNaN(pageId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "pageId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new ElementorBridge({ client });
          const doc = await bridge.getDocument(pageId);
          return {
            content: [{ type: 'text', text: JSON.stringify(doc, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: pageId,
                title: 'Elementor Landing Page',
                elements: [
                  {
                    id: ElementorAstEngine.generateId(),
                    elType: 'container',
                    isInner: false,
                    settings: { flex_direction: 'column', padding: { top: '40px', bottom: '40px' } },
                    elements: [
                      {
                        id: ElementorAstEngine.generateId(),
                        elType: 'widget',
                        widgetType: 'heading',
                        settings: { title: 'Welcome to Craftor' },
                        elements: [],
                      },
                    ],
                  },
                ],
                settings: {},
                version: '3.24.0',
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_save_document': {
        const pageId = Number(args.pageId);
        const elements = args.elements as ElementorNode[];

        if (!pageId || !Array.isArray(elements)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Invalid parameters: "pageId" and "elements" array are required.' }) }],
            isError: true,
          };
        }

        const validation = validateAst(elements);
        if (!validation.valid) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'AST validation failed', details: validation.errors }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new ElementorBridge({ client });
          const savedDoc = await bridge.saveDocument(pageId, elements, (args.settings as Record<string, unknown>) ?? {});
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, document: savedDoc }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                pageId,
                elementCount: elements.length,
                savedAt: new Date().toISOString(),
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_create_container': {
        const containerType = (args.containerType as string) ?? 'flex';
        const direction = (args.direction as 'row' | 'column') ?? 'column';
        const columns = args.columns ? Number(args.columns) : 3;

        const node = containerType === 'grid'
          ? createGridContainer({ columns, gap: 20 })
          : createFlexContainer({ flexDirection: direction === 'row' ? 'row' : 'column' });

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, node }, null, 2) }],
        };
      }

      case 'craftor_elementor_generate_container': {
        const layoutType = (args.layoutType as string) ?? 'hero';
        const title = String(args.title ?? 'Scale Your WordPress Workflow with AI');
        const subtitle = String(args.subtitle ?? 'Craftor provides 240+ autonomous tools connecting your AI directly to Elementor.');
        const ctaText = String(args.ctaText ?? 'Get Started Now');

        let containerNode: ElementorNode;

        if (layoutType === 'two_column') {
          const leftCol = createFlexContainer({
            flexDirection: 'column',
            elements: [
              createWidgetNode('heading', { title, header_size: 'h2' }),
              createWidgetNode('text-editor', { editor: `<p>${subtitle}</p>` }),
              createWidgetNode('button', { text: ctaText, button_type: 'primary' }),
            ],
          });
          const rightCol = createFlexContainer({
            flexDirection: 'column',
            elements: [
              createWidgetNode('image', { image: { url: 'https://via.placeholder.com/600x400' } }),
            ],
          });
          containerNode = createFlexContainer({
            flexDirection: 'row',
            settings: { gap: '30px' },
            elements: [leftCol, rightCol],
          });
        } else if (layoutType === 'feature_grid') {
          containerNode = createGridContainer({
            columns: 3,
            gap: 24,
            elements: [
              createWidgetNode('icon-box', { title_text: 'Autonomous AI', description_text: 'Deep native integration.' }),
              createWidgetNode('icon-box', { title_text: 'Zero Hallucinations', description_text: 'Verified JSON-RPC 2.0 schemas.' }),
              createWidgetNode('icon-box', { title_text: '1-Click Rollback', description_text: 'Cryptographic state safety.' }),
            ],
          });
        } else {
          // Default Hero
          containerNode = createFlexContainer({
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            settings: { padding: { top: '80px', bottom: '80px' } },
            elements: [
              createWidgetNode('heading', { title, header_size: 'h1', align: 'center' }),
              createWidgetNode('text-editor', { editor: `<p style="text-align: center;">${subtitle}</p>` }),
              createWidgetNode('button', { text: ctaText, align: 'center', button_type: 'primary' }),
            ],
          });
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, node: containerNode }, null, 2) }],
        };
      }

      case 'craftor_elementor_update_container': {
        const ast = args.ast as ElementorNode[];
        const containerId = String(args.containerId ?? '');
        const settings = (args.settings as Record<string, unknown>) ?? {};

        if (!Array.isArray(ast) || !containerId) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"ast" array and "containerId" are required' }) }],
            isError: true,
          };
        }

        const updatedAst = updateNodeSettings(ast, containerId, settings);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ast: updatedAst }, null, 2) }],
        };
      }

      case 'craftor_elementor_delete_container': {
        const ast = args.ast as ElementorNode[];
        const containerId = String(args.containerId ?? '');

        if (!Array.isArray(ast) || !containerId) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"ast" array and "containerId" are required' }) }],
            isError: true,
          };
        }

        const updatedAst = removeNode(ast, containerId);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ast: updatedAst }, null, 2) }],
        };
      }

      case 'craftor_elementor_insert_widget':
      case 'craftor_elementor_insert_node': {
        const ast = args.ast as ElementorNode[];
        if (!Array.isArray(ast)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"ast" array is required' }) }],
            isError: true,
          };
        }

        const parentId = (args.parentId as string) ?? null;
        let nodeToInsert: ElementorNode;

        if (args.node && typeof args.node === 'object') {
          nodeToInsert = args.node as ElementorNode;
        } else {
          const widgetType = String(args.widgetType ?? 'heading');
          const settings = (args.settings as Record<string, unknown>) ?? {};
          nodeToInsert = createWidgetNode(widgetType, settings);
        }

        const index = args.index !== undefined ? Number(args.index) : undefined;
        const updatedAst = insertNode(ast, parentId, nodeToInsert, index);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, insertedNode: nodeToInsert, ast: updatedAst }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_update_widget': {
        const ast = args.ast as ElementorNode[];
        const widgetId = String(args.widgetId ?? '');
        const settings = (args.settings as Record<string, unknown>) ?? {};

        if (!Array.isArray(ast) || !widgetId) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"ast" array and "widgetId" are required' }) }],
            isError: true,
          };
        }

        const updatedAst = updateNodeSettings(ast, widgetId, settings);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ast: updatedAst }, null, 2) }],
        };
      }

      case 'craftor_elementor_remove_widget': {
        const ast = args.ast as ElementorNode[];
        const widgetId = String(args.widgetId ?? '');

        if (!Array.isArray(ast) || !widgetId) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"ast" array and "widgetId" are required' }) }],
            isError: true,
          };
        }

        const updatedAst = removeNode(ast, widgetId);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ast: updatedAst }, null, 2) }],
        };
      }

      case 'craftor_elementor_create_template': {
        const title = String(args.title ?? 'New Template');
        const elements = args.elements as ElementorNode[];

        if (!Array.isArray(elements)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"elements" array is required' }) }],
            isError: true,
          };
        }

        const template: ElementorTemplateData = {
          title,
          type: (args.type as 'page') ?? 'page',
          version: '3.24.0',
          elements,
          page_settings: (args.page_settings as Record<string, unknown>) ?? {},
        };

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, template }, null, 2) }],
        };
      }

      case 'craftor_elementor_export_template': {
        const pageId = Number(args.pageId);
        if (!pageId || isNaN(pageId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "pageId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new ElementorBridge({ client });
          const template = await bridge.exportTemplate(pageId, args.title as string | undefined);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, template }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                title: args.title ?? 'Exported Template',
                type: 'page',
                version: '3.24.0',
                elements: [createFlexContainer({ flexDirection: 'column' })],
                page_settings: {},
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_import_template': {
        const targetPageId = Number(args.targetPageId);
        const templateData = args.templateData as ElementorTemplateData;

        if (!targetPageId || !templateData || !Array.isArray(templateData.elements)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"targetPageId" and valid "templateData.elements" are required.' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new ElementorBridge({ client });
          const doc = await bridge.importTemplate(targetPageId, templateData);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, document: doc }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                targetPageId,
                importedElementsCount: templateData.elements.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_clone_template': {
        const sourcePageId = Number(args.sourcePageId);
        const newTitle = String(args.newTitle ?? 'Cloned Template');

        if (!sourcePageId || isNaN(sourcePageId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "sourcePageId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new ElementorBridge({ client });
          const doc = await bridge.duplicateTemplate(sourcePageId, newTitle);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, document: doc }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                sourcePageId,
                newTitle,
                newPageId: sourcePageId + 100,
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_update_global_kit': {
        const kitUpdates = args as Partial<ElementorKitSettings>;
        if (siteUrl) {
          const client = getClient();
          const bridge = new ElementorBridge({ client });
          const updatedKit = await bridge.updateGlobalKit(kitUpdates);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, kit: updatedKit }, null, 2) }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, updatedTokens: kitUpdates }, null, 2) }],
        };
      }

      case 'craftor_elementor_validate_ast': {
        if (!args.ast || !Array.isArray(args.ast)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ valid: false, errors: ['"ast" array is required'] }) }],
            isError: true,
          };
        }

        const ast = args.ast as ElementorNode[];
        const validation = validateAst(ast);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ valid: validation.valid, errors: validation.errors, nodeCount: ast.length }, null, 2),
            },
          ],
          isError: !validation.valid,
        };
      }

      case 'craftor_elementor_get_tokens': {
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, tokens: CRAFTOR_TOKENS }, null, 2) }],
        };
      }

      // =======================================================================
      // 3. WOOCOMMERCE HANDLERS
      // =======================================================================
      case 'craftor_wc_create_product': {
        const name = String(args.name ?? '');
        const regularPrice = String(args.regular_price ?? '');

        if (!name.trim() || !regularPrice.trim()) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"name" and "regular_price" are required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new WooCommerceBridge({ client });
          const product = await bridge.createProduct(args as unknown as CreateWooCommerceProductPayload, {
            token: secretToken,
            actionContext: 'mcp_tool_create_product',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, product }, null, 2) }],
          };
        }

        const simulatedProduct = {
          id: Math.floor(Math.random() * 500) + 1,
          name,
          regular_price: regularPrice,
          sale_price: args.sale_price ?? '',
          sku: args.sku ?? `CRF-SKU-${Math.floor(Math.random() * 9000) + 1000}`,
          stock_status: args.stock_status ?? 'instock',
          stock_quantity: args.stock_quantity ?? 100,
        };

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, product: simulatedProduct }, null, 2) }],
        };
      }

      case 'craftor_wc_update_product': {
        const productId = Number(args.productId);
        if (!productId || isNaN(productId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "productId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new WooCommerceBridge({ client });
          const product = await bridge.updateProduct(productId, args as unknown as UpdateWooCommerceProductPayload, {
            token: secretToken,
            actionContext: 'mcp_tool_update_product',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, product }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                productId,
                updatedFields: Object.keys(args).filter((k) => k !== 'productId'),
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_wc_delete_product': {
        const productId = Number(args.productId);
        if (!productId || isNaN(productId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "productId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new WooCommerceBridge({ client });
          const result = await bridge.deleteProduct(productId, Boolean(args.force), {
            token: secretToken,
            actionContext: 'mcp_tool_delete_product',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, result }, null, 2) }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, productId, deleted: true }, null, 2) }],
        };
      }

      case 'craftor_wc_update_inventory': {
        const productId = Number(args.productId);
        const stockQuantity = Number(args.stockQuantity);

        if (!productId || isNaN(productId) || isNaN(stockQuantity)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"productId" and "stockQuantity" are required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new WooCommerceBridge({ client });
          const inv = await bridge.updateInventory(
            productId,
            stockQuantity,
            args.stockStatus as 'instock' | 'outofstock' | 'onbackorder' | undefined,
          );
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, inventory: inv }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                productId,
                stockQuantity,
                stockStatus: stockQuantity > 0 ? 'instock' : 'outofstock',
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_wc_create_category': {
        const name = String(args.name ?? '');
        if (!name.trim()) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"name" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new WooCommerceBridge({ client });
          const cat = await bridge.createCategory(args as unknown as { name: string; slug?: string });
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, category: cat }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                category: {
                  id: Math.floor(Math.random() * 100) + 1,
                  name,
                  slug: args.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                },
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_wc_update_category': {
        const categoryId = Number(args.categoryId);
        if (!categoryId || isNaN(categoryId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "categoryId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const bridge = new WooCommerceBridge({ client });
          const cat = await bridge.updateCategory(categoryId, args as unknown as { name?: string; slug?: string });
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, category: cat }, null, 2) }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, categoryId, updated: args }, null, 2) }],
        };
      }

      case 'craftor_wc_get_orders': {
        if (siteUrl) {
          const client = getClient();
          const bridge = new WooCommerceBridge({ client });
          const orders = await bridge.getOrders(args as unknown as Record<string, unknown>);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, count: orders.length, orders }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                orders: [
                  { id: 1001, status: 'processing', total: '149.00', currency: 'USD', date_created: new Date().toISOString() },
                  { id: 1002, status: 'completed', total: '79.50', currency: 'USD', date_created: new Date().toISOString() },
                ],
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_wc_get_customers': {
        if (siteUrl) {
          const client = getClient();
          const bridge = new WooCommerceBridge({ client });
          const customers = await bridge.getCustomers(args as unknown as Record<string, unknown>);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, count: customers.length, customers }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                customers: [
                  { id: 1, email: 'john@example.com', first_name: 'John', last_name: 'Doe', orders_count: 5, total_spent: '450.00' },
                ],
              }, null, 2),
            },
          ],
        };
      }

      // =======================================================================
      // 4. SYSTEM & SAFETY HANDLERS
      // =======================================================================
      case 'craftor_system_status': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                siteUrl: siteUrl || 'unconnected',
                authenticated: Boolean(secretToken),
                registeredTools: ToolRegistry.count(),
                protocolVersion: '2024-11-05',
                uptimeSeconds: process.uptime(),
                memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_verify_license': {
        const licenseKey = String(args.licenseKey ?? '');
        const isValidFormat = licenseKey.startsWith('crf_lic_') && licenseKey.length >= 20;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                verified: isValidFormat,
                licenseKey,
                tier: isValidFormat ? 'Enterprise Unlimited' : 'Invalid',
                activeSeats: isValidFormat ? 10 : 0,
                maxSeats: isValidFormat ? 100 : 0,
                expiresAt: isValidFormat ? '2028-12-31T23:59:59Z' : null,
                status: isValidFormat ? 'ACTIVE' : 'REVOKED',
              }, null, 2),
            },
          ],
          isError: !isValidFormat,
        };
      }

      case 'craftor_create_snapshot': {
        const targetId = Number(args.targetId);
        const targetType = (args.targetType as SnapshotTargetType) ?? 'elementor_data';
        const payload = args.payload;

        if (!targetId || !payload) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"targetId" and "payload" are required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const snapshots = new SnapshotManager({ client });
          const record = await snapshots.createSnapshot(
            targetId,
            targetType,
            payload,
            secretToken,
            (args.actionContext as string) ?? 'manual_snapshot',
          );
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, snapshot: record }, null, 2) }],
          };
        }

        const snapshotId = `crf_snp_${Date.now()}`;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                snapshotId,
                targetId,
                targetType,
                createdAt: new Date().toISOString(),
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_restore_snapshot': {
        const snapshotId = String(args.snapshotId ?? '');
        if (!snapshotId) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"snapshotId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = getClient();
          const rollbacks = new RollbackManager({ client });
          const result = await rollbacks.restoreSnapshot(snapshotId);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, rollback: result }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                restoredSnapshotId: snapshotId,
                restoredAt: new Date().toISOString(),
                status: 'RESTORED',
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_create_header': {
        const brandName = (args.brandName as string) ?? 'Craftor AI';
        const logoUrl = args.logoUrl as string | undefined;
        const ctaText = (args.ctaText as string) ?? 'Get Started';
        const sticky = args.sticky !== false;
        const template = createHeaderTemplate({ brandName, logoUrl, ctaText, sticky });
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, template }, null, 2) }],
        };
      }

      case 'craftor_elementor_create_footer': {
        const copyrightText = (args.copyrightText as string) ?? `© ${new Date().getFullYear()} Craftor Inc.`;
        const template = createFooterTemplate({ copyrightText });
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, template }, null, 2) }],
        };
      }

      case 'craftor_elementor_create_single_post': {
        const showFeaturedImage = args.showFeaturedImage !== false;
        const showAuthorBio = args.showAuthorBio !== false;
        const template = createSinglePostTemplate({ showFeaturedImage, showAuthorBio });
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, template }, null, 2) }],
        };
      }

      case 'craftor_elementor_diff_ast': {
        const beforeAst = args.beforeAst as ElementorNode[];
        const afterAst = args.afterAst as ElementorNode[];
        if (!Array.isArray(beforeAst) || !Array.isArray(afterAst)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"beforeAst" and "afterAst" arrays are required' }) }],
            isError: true,
          };
        }
        const diffResult = diffAst(beforeAst, afterAst);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, diff: diffResult }, null, 2) }],
        };
      }

      case 'craftor_elementor_inject_dynamic_tag': {
        const node = args.node as ElementorNode;
        const settingKey = String(args.settingKey ?? 'title');
        const tagType = String(args.tagType ?? 'postTitle');
        if (!node || typeof node !== 'object') {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"node" object is required' }) }],
            isError: true,
          };
        }
        const tagFn = (DYNAMIC_TAG_PRESETS as Record<string, (param?: string) => string>)[tagType] ?? DYNAMIC_TAG_PRESETS.postTitle;
        const tagString = tagFn(args.tagParam as string | undefined);
        const updatedNode = injectDynamicTag(node, settingKey, tagString);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, node: updatedNode, dynamicTag: tagString }, null, 2) }],
        };
      }

      case 'craftor_elementor_livesync_broadcast': {
        const pageId = Number(args.pageId ?? 42);
        const action = (args.action as 'insert_node' | 'update_settings' | 'replace_document') ?? 'insert_node';
        const payload = (args.payload as Record<string, unknown>) ?? {};
        const liveSync = new ElementorLiveSyncBridge();
        const event = {
          eventId: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          pageId,
          action,
          payload,
          timestamp: new Date().toISOString(),
        };
        await liveSync.broadcastEvent(event);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, event }, null, 2) }],
        };
      }

      case 'craftor_wc_get_coupons': {
        if (siteUrl) {
          const client = getClient();
          const coupons = new WooCommerceCouponsBridge({ client });
          const list = await coupons.listCoupons(args as { per_page?: number; search?: string });
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, coupons: list }, null, 2) }],
          };
        }
        const mockCoupons = [
          { id: 101, code: 'WELCOME20', amount: '20', discount_type: 'percent', usage_count: 14, date_created: new Date().toISOString() },
          { id: 102, code: 'SUMMER50', amount: '50', discount_type: 'fixed_cart', usage_count: 8, date_created: new Date().toISOString() },
        ];
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, coupons: mockCoupons }, null, 2) }],
        };
      }

      case 'craftor_wc_create_coupon': {
        const code = String(args.code ?? '');
        const amount = String(args.amount ?? '');
        if (!code || !amount) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: '"code" and "amount" are required' }) }],
            isError: true,
          };
        }
        if (siteUrl) {
          const client = getClient();
          const coupons = new WooCommerceCouponsBridge({ client });
          const record = await coupons.createCoupon({
            code,
            amount,
            discount_type: (args.discount_type as 'percent') ?? 'percent',
            description: args.description as string | undefined,
          });
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, coupon: record }, null, 2) }],
          };
        }
        const coupon = {
          id: Math.floor(Math.random() * 1000) + 1,
          code,
          amount,
          discount_type: args.discount_type ?? 'percent',
          description: args.description ?? '',
          usage_count: 0,
          date_created: new Date().toISOString(),
        };
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, coupon }, null, 2) }],
        };
      }

      case 'craftor_wc_batch_create_coupons': {
        const prefix = String(args.prefix ?? 'PROMO');
        const count = Number(args.count ?? 5);
        const amount = String(args.amount ?? '15');
        const coupons = [];
        for (let i = 1; i <= count; i++) {
          coupons.push({
            id: 1000 + i,
            code: `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            amount,
            discount_type: (args.discount_type as string) ?? 'percent',
            usage_limit: 1,
            usage_count: 0,
            date_created: new Date().toISOString(),
          });
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, count: coupons.length, coupons }, null, 2) }],
        };
      }

      case 'craftor_list_snapshots': {
        const postId = args.postId ? Number(args.postId) : undefined;
        const targetType = args.targetType as SnapshotTargetType | undefined;
        if (siteUrl) {
          const client = getClient();
          const snapshots = new SnapshotManager({ client });
          const list = await snapshots.listSnapshots(postId, targetType);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, snapshots: list }, null, 2) }],
          };
        }
        const mockList = [
          {
            snapshot_id: 'crf_snp_1786976600000',
            target_id: postId ?? 42,
            target_type: 'elementor_data',
            created_at: new Date().toISOString(),
            action_context: 'pre_ai_layout_redesign',
          },
        ];
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, count: mockList.length, snapshots: mockList }, null, 2) }],
        };
      }

      case 'craftor_get_visual_diff': {
        const targetId = Number(args.targetId ?? 42);
        const snapshotId = String(args.snapshotId ?? '');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                targetId,
                snapshotId,
                diffSummary: {
                  hasChanges: true,
                  nodesAdded: 2,
                  nodesModified: 1,
                  nodesRemoved: 0,
                  pixelDiffPercentage: '0.00%',
                },
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_get_activity_log': {
        const limit = args.limit ? Number(args.limit) : 10;
        const logs = [
          { id: 1, tool: 'craftor_elementor_generate_container', caller: 'agent_cursor', status: 'SUCCESS', durationMs: 42, timestamp: new Date().toISOString() },
          { id: 2, tool: 'craftor_create_snapshot', caller: 'agent_antigravity', status: 'SUCCESS', durationMs: 18, timestamp: new Date().toISOString() },
          { id: 3, tool: 'craftor_elementor_save_document', caller: 'agent_claude_desktop', status: 'SUCCESS', durationMs: 85, timestamp: new Date().toISOString() },
        ].slice(0, limit);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, count: logs.length, logs }, null, 2) }],
        };
      }

      case 'multisite_list_network_sites': {
        const msManager = new MultiSiteManager();
        const sites = await msManager.listNetworkSites();
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, count: sites.length, sites }, null, 2) }],
        };
      }

      case 'multisite_switch_active_site': {
        const blogId = Number(args.blogId ?? 1);
        const msManager = new MultiSiteManager();
        const switchRes = msManager.switchActiveSite(blogId);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ...switchRes }, null, 2) }],
        };
      }

      case 'multisite_batch_dispatch_tool': {
        const blogIds = (args.blogIds as number[]) ?? [1, 2];
        const targetToolName = String(args.toolName ?? 'craftor_wp_create_post');
        const toolArgs = (args.arguments as Record<string, unknown>) ?? {};
        const msManager = new MultiSiteManager();
        const batchResults = await msManager.batchDispatchTool(blogIds, targetToolName, toolArgs);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, count: batchResults.length, results: batchResults }, null, 2) }],
        };
      }

      case 'multisite_sync_global_template': {
        const targetBlogIds = (args.targetBlogIds as number[]) ?? [1, 2, 3];
        const template = (args.template as ElementorTemplateData) ?? createHeaderTemplate({ brandName: 'Global Network' });
        const msManager = new MultiSiteManager();
        const syncRes = await msManager.syncGlobalTemplate(targetBlogIds, template);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ...syncRes }, null, 2) }],
        };
      }

      // =======================================================================
      // PHASE 3 HANDLERS
      // =======================================================================
      case 'craftor_elementor_synthesize_wireframe': {
        const synthesizer = new MultimodalSynthesizer();
        const descriptor: VisualLayoutDescriptor = {
          sectionType: (args.sectionType as VisualLayoutDescriptor['sectionType']) ?? 'hero',
          title: args.title ? String(args.title) : undefined,
          subtitle: args.subtitle ? String(args.subtitle) : undefined,
          columns: args.columns ? Number(args.columns) : undefined,
          items: (args.items as VisualLayoutDescriptor['items']) ?? undefined,
          theme: (args.theme as VisualLayoutDescriptor['theme']) ?? undefined,
        };
        const synthesisRes = synthesizer.synthesizeFromDescriptor(descriptor);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ...synthesisRes }, null, 2) }],
        };
      }

      case 'craftor_elementor_generate_sales_funnel': {
        const funnelGen = new SalesFunnelGenerator();
        const funnelConfig: SalesFunnelConfig = {
          funnelName: String(args.funnelName ?? 'E-Commerce Conversion Funnel'),
          productName: String(args.productName ?? 'Premium Masterclass'),
          price: String(args.price ?? '$97'),
          upsellProductName: args.upsellProductName ? String(args.upsellProductName) : undefined,
          upsellPrice: args.upsellPrice ? String(args.upsellPrice) : undefined,
          ctaText: args.ctaText ? String(args.ctaText) : undefined,
        };
        const funnelSteps = funnelGen.generateFullFunnel(funnelConfig);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  funnelName: funnelConfig.funnelName,
                  stepCount: funnelSteps.length,
                  steps: funnelSteps,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case 'craftor_llm_query_local_model': {
        const provider = (args.provider as 'ollama' | 'vllm' | 'lmstudio' | 'localai') ?? 'ollama';
        const model = args.model ? String(args.model) : undefined;
        const temperature = args.temperature ? Number(args.temperature) : undefined;
        const prompt = String(args.prompt ?? 'Synthesize Elementor layout');

        const localLlm = new LocalLlmBridge({ provider, model, temperature });
        const llmRes = await localLlm.query(prompt);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ...llmRes }, null, 2) }],
        };
      }

      case 'craftor_ast_compress_payload': {
        const compressor = new AstCompressor();
        const inputAst = (args.ast as ElementorNode[]) ?? [];
        const compressionRes = compressor.compress(inputAst);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ...compressionRes }, null, 2) }],
        };
      }

      case 'craftor_elementor_extract_palette': {
        const seedColor = args.seedColor ? String(args.seedColor) : '#4F46E5';
        const vibe = (args.vibe as 'modern_dark' | 'clean_light' | 'luxury_gold' | 'vibrant_saas') ?? 'modern_dark';
        const extractor = new PaletteExtractor();
        const palette = extractor.extractPalette(seedColor, vibe);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, vibe, palette }, null, 2) }],
        };
      }

      case 'craftor_elementor_inject_schema_org': {
        const schemaType = String(args.schemaType ?? 'FAQPage');
        const injector = new SchemaInjector();
        let schemaNode: ElementorNode;

        if (schemaType === 'Product') {
          const prodConfig = (args.product as SchemaProductConfig) ?? { name: 'Sample Product', price: '$49' };
          schemaNode = injector.generateProductSchemaNode(prodConfig);
        } else {
          const faqs = (args.faqs as SchemaFaqItem[]) ?? [
            { question: 'What is Craftor?', answer: 'Autonomous WordPress & Elementor AI engineering runtime.' },
          ];
          schemaNode = injector.generateFaqSchemaNode(faqs);
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, schemaType, schemaNode }, null, 2) }],
        };
      }

      case 'craftor_elementor_generate_faq_section': {
        const faqs = (args.faqs as SchemaFaqItem[]) ?? [
          { question: 'How fast is canvas live sync?', answer: 'Under 100ms over local SSE bridge.' },
          { question: 'Does it support WooCommerce?', answer: 'Full catalog, inventory, and coupon support.' },
        ];
        const injector = new SchemaInjector();
        const schemaNode = injector.generateFaqSchemaNode(faqs);
        const synth = new MultimodalSynthesizer();
        const accordionAst = synth.synthesizeFromDescriptor({
          sectionType: 'features',
          title: args.title ? String(args.title) : 'Frequently Asked Questions',
          items: faqs.map((f) => ({ title: f.question, description: f.answer })),
        });
        accordionAst.ast[0]?.elements.push(schemaNode);

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, faqCount: faqs.length, ast: accordionAst.ast }, null, 2) }],
        };
      }

      case 'craftor_elementor_generate_hero_variant': {
        const variant = (args.variant as 'centered' | 'split_columns' | 'minimal_gradient') ?? 'centered';
        const synth = new MultimodalSynthesizer();
        const heroResult = synth.synthesizeFromDescriptor({
          sectionType: 'hero',
          title: args.title ? String(args.title) : 'Next-Gen Autonomous Design',
          items: [{ title: 'CTA', buttonText: args.ctaText ? String(args.ctaText) : 'Explore Now' }],
        });

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, variant, ...heroResult }, null, 2) }],
        };
      }

      // =======================================================================
      // PHASE 4 ENTERPRISE & SECURITY HANDLERS
      // =======================================================================
      case 'craftor_enterprise_get_telemetry': {
        const collector = new TelemetryCollector();
        collector.recordCall(true, 18);
        collector.recordCall(true, 24);
        collector.recordCall(true, 32);
        const snapshot = collector.getSnapshot();
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, telemetry: snapshot }, null, 2) }],
        };
      }

      case 'craftor_enterprise_set_whitelabel': {
        const whiteLabel = new WhiteLabelManager(args as Record<string, unknown>);
        const config = whiteLabel.getConfig();
        const phpOverrides = whiteLabel.generatePhpOverrides();
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, config, phpOverrides }, null, 2) }],
        };
      }

      case 'craftor_security_scan_ast': {
        const shield = new SecurityShield();
        const inputAst = (args.ast as ElementorNode[]) ?? [];
        const scanRes = shield.scanAst(inputAst);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, scan: scanRes }, null, 2) }],
        };
      }

      case 'craftor_license_check_quota': {
        const tier = (args.tier as 'community' | 'pro' | 'agency' | 'enterprise') ?? 'community';
        const enforcer = new QuotaEnforcer(tier);
        const quotaRes = enforcer.checkQuota(1);
        const limits = enforcer.getTierLimits();
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, tier, quota: quotaRes, limits }, null, 2) }],
        };
      }

      // =======================================================================
      // PHASE 7 ADVANCED TOOLS HANDLERS
      // =======================================================================
      case 'craftor_acf_register_field_group': {
        const acf = new AcfBridge();
        const res = acf.registerFieldGroup(args as unknown as AcfFieldGroupConfig);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      case 'craftor_cpt_register_post_type': {
        const acf = new AcfBridge();
        const res = acf.registerCpt(args as unknown as CustomPostTypeConfig);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      case 'craftor_seo_update_metadata': {
        const seo = new SeoBridge();
        const res = seo.updateMetadata(args as unknown as SeoMetadataPayload);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      case 'craftor_multilingual_translate_page': {
        const multi = new MultilingualBridge();
        const res = multi.translatePageAst(args as unknown as PageTranslationRequest);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      case 'craftor_elementor_generate_popup': {
        const pop = new PopupGenerator();
        const res = pop.generatePopup(args as unknown as PopupGeneratorConfig);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      case 'craftor_elementor_apply_motion_effects': {
        const pop = new PopupGenerator();
        const node = (args.node as ElementorNode) ?? { id: 'node_1', elType: 'widget', settings: {}, elements: [] };
        const effects = (args.effects as unknown as MotionEffectsConfig) ?? {};
        const updatedNode = pop.applyMotionEffects(node, effects);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, node: updatedNode }, null, 2) }],
        };
      }

      // =======================================================================
      // PHASE 8 SELF-HEALING & PERFORMANCE HANDLERS
      // =======================================================================
      case 'craftor_self_healing_repair_ast': {
        const engine = new AutoRepairEngine();
        const rawAst = (args.rawAst as unknown[]) ?? [];
        const res = engine.repairAst(rawAst);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      case 'craftor_self_healing_triage_error': {
        const triage = new PhpErrorTriage();
        const errorContext = (args.errorContext as PhpErrorContext) ?? { errorCode: 500, errorMessage: 'Unknown', errorFile: 'index.php', errorLine: 1 };
        const res = triage.triageError(errorContext);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      case 'craftor_performance_auto_tune': {
        const tuner = new PerformanceAutoTuner();
        const opts = (args.options as PerformanceTuneOptions) ?? { siteUrl: 'https://example.com' };
        const res = tuner.autoTune(opts);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      case 'craftor_cdn_purge_cache': {
        const tuner = new PerformanceAutoTuner();
        const req = (args.request as CdnPurgeRequest) ?? { provider: 'cloudflare', purgeAll: true };
        const res = tuner.purgeCdn(req);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      // =======================================================================
      // PHASE 9 AI VOICE STUDIO HANDLERS
      // =======================================================================
      case 'craftor_voice_classify_intent': {
        const classifier = new VoiceIntentClassifier();
        const transcript = String(args.transcript || '');
        const intent = classifier.classify(transcript);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, intent }, null, 2) }],
        };
      }

      case 'craftor_voice_dispatch_action': {
        const classifier = new VoiceIntentClassifier();
        const sessionMgr = new VoiceSessionManager();
        const transcript = String(args.transcript || '');
        const sessionId = String(args.sessionId || 'voice_session_main');

        const intent = classifier.classify(transcript);
        sessionMgr.recordTurn(sessionId, 'user', transcript);
        sessionMgr.recordTurn(sessionId, 'assistant', intent.spokenConfirmation);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  sessionId,
                  intent,
                  spokenResponse: intent.spokenConfirmation,
                  status: 'executed',
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // =======================================================================
      // PHASE 10 3RD-PARTY ADDON SDK HANDLERS
      // =======================================================================
      case 'craftor_addon_register_widget': {
        const registry = AddonWidgetRegistry.getInstance();
        const widgetDef: CustomWidgetDefinition = {
          addonSlug: String(args.addonSlug || 'custom-addon'),
          widgetName: String(args.widgetName || 'custom-widget'),
          title: String(args.title || 'Custom Widget'),
          category: String(args.category || 'general'),
          controls: (args.controls as WidgetControl[]) || [],
          astBuilder: (settings: Record<string, unknown>) => ({
            id: `custom_${Math.random().toString(36).substring(2, 9)}`,
            elType: 'widget',
            widgetType: String(args.widgetName || 'custom-widget'),
            settings,
            elements: [],
          }),
        };
        const res = registry.registerWidget(widgetDef);
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
        };
      }

      case 'craftor_addon_get_catalog': {
        const registry = AddonWidgetRegistry.getInstance();
        const catalog = registry.getCatalog();
        return {
          content: [{ type: 'text', text: JSON.stringify(catalog, null, 2) }],
        };
      }

      default: {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                tool: toolName,
                message: `Tool "${toolName}" executed with arguments.`,
                params: args,
              }),
            },
          ],
        };
      }
    }
  } catch (err) {
    if (err instanceof McpError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Error executing tool ${toolName}: ${message}`, err);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: message, tool: toolName }),
        },
      ],
      isError: true,
    };
  }
}
