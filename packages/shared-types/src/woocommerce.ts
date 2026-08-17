/**
 * Craftor WooCommerce Shared Types
 */

export type WooCommerceProductType = 'simple' | 'variable' | 'grouped' | 'external';
export type WooCommerceProductStatus = 'draft' | 'publish' | 'pending' | 'private';
export type WooCommerceStockStatus = 'instock' | 'outofstock' | 'onbackorder';
export type WooCommerceOrderStatus =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed';

export interface WooCommerceImage {
  id?: number;
  src: string;
  name?: string;
  alt?: string;
}

export interface WooCommerceCategoryReference {
  id: number;
  name?: string;
  slug?: string;
}

export interface WooCommerceTagReference {
  id: number;
  name?: string;
  slug?: string;
}

export interface WooCommerceAttribute {
  id?: number;
  name: string;
  position?: number;
  visible?: boolean;
  variation?: boolean;
  options: string[];
}

export interface WooCommerceDimensions {
  length: string;
  width: string;
  height: string;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  type: WooCommerceProductType;
  status: WooCommerceProductStatus;
  featured: boolean;
  catalog_visibility?: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  tax_status?: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: WooCommerceStockStatus;
  categories: WooCommerceCategoryReference[];
  tags: WooCommerceTagReference[];
  images: WooCommerceImage[];
  attributes: WooCommerceAttribute[];
  dimensions?: WooCommerceDimensions;
  weight?: string;
  date_created?: string;
  date_modified?: string;
}

export interface CreateWooCommerceProductPayload {
  name: string;
  type?: WooCommerceProductType;
  status?: WooCommerceProductStatus;
  featured?: boolean;
  description?: string;
  short_description?: string;
  sku?: string;
  regular_price: string;
  sale_price?: string;
  virtual?: boolean;
  downloadable?: boolean;
  manage_stock?: boolean;
  stock_quantity?: number;
  stock_status?: WooCommerceStockStatus;
  categories?: Array<{ id: number } | { name: string }>;
  tags?: Array<{ id: number } | { name: string }>;
  images?: Array<{ src: string; alt?: string }>;
  attributes?: WooCommerceAttribute[];
}

export interface UpdateWooCommerceProductPayload {
  name?: string;
  slug?: string;
  type?: WooCommerceProductType;
  status?: WooCommerceProductStatus;
  featured?: boolean;
  description?: string;
  short_description?: string;
  sku?: string;
  regular_price?: string;
  sale_price?: string;
  virtual?: boolean;
  downloadable?: boolean;
  manage_stock?: boolean;
  stock_quantity?: number;
  stock_status?: WooCommerceStockStatus;
  categories?: Array<{ id: number } | { name: string }>;
  tags?: Array<{ id: number } | { name: string }>;
  images?: Array<{ src: string; alt?: string }>;
  attributes?: WooCommerceAttribute[];
}

export interface WooCommerceProductQuery {
  page?: number;
  per_page?: number;
  search?: string;
  status?: WooCommerceProductStatus;
  type?: WooCommerceProductType;
  category?: string;
  tag?: string;
  sku?: string;
  featured?: boolean;
  on_sale?: boolean;
  min_price?: string;
  max_price?: string;
  stock_status?: WooCommerceStockStatus;
  orderby?: 'date' | 'id' | 'title' | 'slug' | 'price' | 'popularity' | 'rating';
  order?: 'asc' | 'desc';
}

export interface WooCommerceOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  sku: string;
  price: number;
}

export interface WooCommerceAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WooCommerceOrder {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  status: WooCommerceOrderStatus;
  currency: string;
  total: string;
  total_tax: string;
  customer_id: number;
  billing: WooCommerceAddress;
  shipping: WooCommerceAddress;
  payment_method: string;
  payment_method_title: string;
  line_items: WooCommerceOrderLineItem[];
  date_created: string;
  date_modified: string;
}

export interface WooCommerceOrderQuery {
  page?: number;
  per_page?: number;
  search?: string;
  status?: WooCommerceOrderStatus | 'any';
  customer?: number;
  product?: number;
  after?: string;
  before?: string;
  orderby?: 'date' | 'id' | 'total';
  order?: 'asc' | 'desc';
}

export interface WooCommerceCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
  billing: WooCommerceAddress;
  shipping: WooCommerceAddress;
  orders_count: number;
  total_spent: string;
}

export interface WooCommerceCustomerQuery {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  orderby?: 'id' | 'name' | 'registered_date';
  order?: 'asc' | 'desc';
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: WooCommerceImage | null;
  count: number;
}

export interface WooCommerceCategoryQuery {
  page?: number;
  per_page?: number;
  search?: string;
  parent?: number;
  orderby?: 'name' | 'id' | 'slug' | 'count';
  order?: 'asc' | 'desc';
  hide_empty?: boolean;
}

export interface WooCommerceInventory {
  productId: number;
  sku: string;
  manageStock: boolean;
  stockQuantity: number | null;
  stockStatus: WooCommerceStockStatus;
  backordersAllowed: boolean;
}
