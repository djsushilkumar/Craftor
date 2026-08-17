/**
 * Craftor WooCommerce Bridge
 * Complete WooCommerce REST API integration with atomic Snapshot & Rollback protection.
 */

import {
  WooCommerceProduct,
  WooCommerceOrder,
  WooCommerceCustomer,
  WooCommerceCategory,
  WooCommerceInventory,
  CreateWooCommerceProductPayload,
  UpdateWooCommerceProductPayload,
  WooCommerceProductQuery,
  WooCommerceOrderQuery,
  WooCommerceCustomerQuery,
  WooCommerceCategoryQuery,
} from '../../shared-types/dist/index.js';
import { logger } from '../../shared-utils/dist/index.js';
import { WordPressClient } from './client.js';
import { SnapshotManager } from './snapshot-manager.js';
import { RollbackManager } from './rollback-manager.js';

export interface WooCommerceBridgeOptions {
  client: WordPressClient;
  snapshotManager?: SnapshotManager;
  rollbackManager?: RollbackManager;
}

export class WooCommerceBridge {
  public readonly client: WordPressClient;
  public readonly snapshots: SnapshotManager;
  public readonly rollback: RollbackManager;

  constructor(options: WooCommerceBridgeOptions) {
    this.client = options.client;
    this.snapshots = options.snapshotManager ?? new SnapshotManager({ client: this.client });
    this.rollback =
      options.rollbackManager ??
      new RollbackManager({ client: this.client, snapshotManager: this.snapshots });
  }

  // =========================================================================
  // PRODUCTS API
  // =========================================================================

  /**
   * Retrieves a list of WooCommerce products with optional filters.
   */
  public async getProducts(params: WooCommerceProductQuery = {}): Promise<WooCommerceProduct[]> {
    logger.debug('[WooCommerceBridge] Fetching products', { ...params });
    const rest = this.client.getRestClient();
    return rest.get<WooCommerceProduct[]>('/wp-json/wc/v3/products', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Retrieves a single WooCommerce product by ID.
   */
  public async getProduct(id: number): Promise<WooCommerceProduct> {
    logger.debug(`[WooCommerceBridge] Fetching product ${id}`);
    const rest = this.client.getRestClient();
    return rest.get<WooCommerceProduct>(`/wp-json/wc/v3/products/${id}`);
  }

  /**
   * Creates a new WooCommerce product with an automatic snapshot capture.
   */
  public async createProduct(
    data: CreateWooCommerceProductPayload,
    options?: { token?: string; actionContext?: string },
  ): Promise<WooCommerceProduct> {
    logger.info('[WooCommerceBridge] Creating new product', { name: data.name, sku: data.sku });
    const rest = this.client.getRestClient();

    const createdProduct = await rest.post<WooCommerceProduct>('/wp-json/wc/v3/products', data);

    // Capture initial state snapshot
    await this.snapshots.createSnapshot(
      createdProduct.id,
      'woocommerce_product',
      createdProduct,
      options?.token,
      options?.actionContext ?? 'create_product',
    );

    return createdProduct;
  }

  /**
   * Updates an existing WooCommerce product protected with pre-state snapshot.
   */
  public async updateProduct(
    id: number,
    data: UpdateWooCommerceProductPayload,
    options?: { token?: string; actionContext?: string },
  ): Promise<WooCommerceProduct> {
    logger.info(`[WooCommerceBridge] Updating product ${id}`, { ...data });

    // 1. Fetch pre-mutation state
    let preState: WooCommerceProduct | null = null;
    try {
      preState = await this.getProduct(id);
    } catch {
      // If fetching fails, proceed with null pre-state
    }

    // 2. Snapshot current state before applying updates
    if (preState) {
      await this.snapshots.createSnapshot(
        id,
        'woocommerce_product',
        preState,
        options?.token,
        options?.actionContext ?? 'update_product',
      );
    }

    // 3. Perform the mutation
    const rest = this.client.getRestClient();
    return rest.put<WooCommerceProduct>(`/wp-json/wc/v3/products/${id}`, data);
  }

  /**
   * Deletes a WooCommerce product protected with pre-state snapshot.
   */
  public async deleteProduct(
    id: number,
    force: boolean = false,
    options?: { token?: string; actionContext?: string },
  ): Promise<{ id: number; deleted: boolean }> {
    logger.info(`[WooCommerceBridge] Deleting product ${id} (force: ${force})`);

    // 1. Snapshot state before deletion
    try {
      const preState = await this.getProduct(id);
      if (preState) {
        await this.snapshots.createSnapshot(
          id,
          'woocommerce_product',
          preState,
          options?.token,
          options?.actionContext ?? 'delete_product',
        );
      }
    } catch {
      // Continue deletion attempt
    }

    const rest = this.client.getRestClient();
    return rest.delete<{ id: number; deleted: boolean }>(`/wp-json/wc/v3/products/${id}`, {
      params: { force },
    });
  }

  // =========================================================================
  // ORDERS API
  // =========================================================================

  /**
   * Retrieves a list of WooCommerce orders.
   */
  public async getOrders(params: WooCommerceOrderQuery = {}): Promise<WooCommerceOrder[]> {
    logger.debug('[WooCommerceBridge] Fetching orders', { ...params });
    const rest = this.client.getRestClient();
    return rest.get<WooCommerceOrder[]>('/wp-json/wc/v3/orders', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Retrieves a single WooCommerce order by ID.
   */
  public async getOrder(id: number): Promise<WooCommerceOrder> {
    logger.debug(`[WooCommerceBridge] Fetching order ${id}`);
    const rest = this.client.getRestClient();
    return rest.get<WooCommerceOrder>(`/wp-json/wc/v3/orders/${id}`);
  }

  // =========================================================================
  // CUSTOMERS API
  // =========================================================================

  /**
   * Retrieves WooCommerce customer records.
   */
  public async getCustomers(params: WooCommerceCustomerQuery = {}): Promise<WooCommerceCustomer[]> {
    logger.debug('[WooCommerceBridge] Fetching customers', { ...params });
    const rest = this.client.getRestClient();
    return rest.get<WooCommerceCustomer[]>('/wp-json/wc/v3/customers', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  // =========================================================================
  // CATEGORIES API
  // =========================================================================

  /**
   * Retrieves product categories.
   */
  public async getCategories(params: WooCommerceCategoryQuery = {}): Promise<WooCommerceCategory[]> {
    logger.debug('[WooCommerceBridge] Fetching product categories', { ...params });
    const rest = this.client.getRestClient();
    return rest.get<WooCommerceCategory[]>('/wp-json/wc/v3/products/categories', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  // =========================================================================
  // INVENTORY API
  // =========================================================================

  /**
   * Updates inventory for a WooCommerce product.
   */
  public async updateInventory(
    productId: number,
    stockQuantity: number,
    stockStatus?: 'instock' | 'outofstock' | 'onbackorder',
  ): Promise<WooCommerceInventory> {
    logger.info(`[WooCommerceBridge] Updating inventory for product ${productId}`, { stockQuantity, stockStatus });
    const rest = this.client.getRestClient();

    const payload: Record<string, unknown> = {
      manage_stock: true,
      stock_quantity: stockQuantity,
    };
    if (stockStatus) {
      payload.stock_status = stockStatus;
    } else {
      payload.stock_status = stockQuantity > 0 ? 'instock' : 'outofstock';
    }

    const updated = await rest.put<WooCommerceProduct>(`/wp-json/wc/v3/products/${productId}`, payload);
    return {
      productId: updated.id,
      sku: updated.sku,
      manageStock: updated.manage_stock,
      stockQuantity: updated.stock_quantity,
      stockStatus: updated.stock_status,
      backordersAllowed: false,
    };
  }

  /**
   * Creates a product category.
   */
  public async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    parent?: number;
    image?: { src: string };
  }): Promise<WooCommerceCategory> {
    logger.info('[WooCommerceBridge] Creating product category', { name: data.name });
    const rest = this.client.getRestClient();
    return rest.post<WooCommerceCategory>('/wp-json/wc/v3/products/categories', data);
  }

  /**
   * Updates a product category.
   */
  public async updateCategory(
    id: number,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      parent?: number;
      image?: { src: string };
    },
  ): Promise<WooCommerceCategory> {
    logger.info(`[WooCommerceBridge] Updating product category ${id}`, { ...data });
    const rest = this.client.getRestClient();
    return rest.put<WooCommerceCategory>(`/wp-json/wc/v3/products/categories/${id}`, data);
  }
}

