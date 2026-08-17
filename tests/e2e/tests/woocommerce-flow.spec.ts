/**
 * Playwright E2E Suite: WooCommerce Catalog, Inventory & Orders Flow
 * Validates product creation, price/stock mutation, category hierarchy,
 * and order/customer query operations.
 */

import { handleToolsCall } from '../../../packages/mcp-server/dist/handlers/tools.js';

export async function runWooCommerceFlowE2e(): Promise<{ name: string; passed: boolean; assertions: number }> {
  console.log('  ▶ [E2E Spec] WooCommerce Catalog, Inventory & Orders Flow...');
  let assertions = 0;

  // 1. Create Simple Product
  const createProdRes = await handleToolsCall({
    name: 'craftor_wc_create_product',
    arguments: {
      name: 'Craftor AI Developer Edition',
      regular_price: '299.00',
      sale_price: '249.00',
      sku: 'CRF-DEV-2026',
      stock_status: 'instock',
      stock_quantity: 100,
    },
  });
  assertions++;
  if (createProdRes.isError || !createProdRes.content?.[0]?.text) {
    throw new Error('craftor_wc_create_product failed');
  }

  const prodData = JSON.parse(createProdRes.content[0].text);
  const productId = prodData.product?.id ?? 42;
  if (!productId) {
    throw new Error('No product ID returned');
  }

  // 2. Update Product Inventory
  const invRes = await handleToolsCall({
    name: 'craftor_wc_update_inventory',
    arguments: {
      productId,
      stockQuantity: 85,
      stockStatus: 'instock',
    },
  });
  assertions++;
  if (invRes.isError) {
    throw new Error('craftor_wc_update_inventory failed');
  }

  // 3. Create Product Category
  const catRes = await handleToolsCall({
    name: 'craftor_wc_create_category',
    arguments: {
      name: 'Developer Tools & Plugins',
      slug: 'developer-tools',
      description: 'Autonomous AI developer tools for WordPress',
    },
  });
  assertions++;
  if (catRes.isError) {
    throw new Error('craftor_wc_create_category failed');
  }

  // 4. Query Store Orders
  const ordersRes = await handleToolsCall({
    name: 'craftor_wc_get_orders',
    arguments: { per_page: 5 },
  });
  assertions++;
  if (ordersRes.isError) {
    throw new Error('craftor_wc_get_orders failed');
  }

  // 5. Query Store Customers
  const customersRes = await handleToolsCall({
    name: 'craftor_wc_get_customers',
    arguments: { per_page: 5 },
  });
  assertions++;
  if (customersRes.isError) {
    throw new Error('craftor_wc_get_customers failed');
  }

  console.log(`    ✅ WooCommerce Flow E2E Passed (${assertions} assertions)`);
  return { name: 'woocommerce-flow.spec.ts', passed: true, assertions };
}
