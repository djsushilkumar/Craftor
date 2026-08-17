/**
 * Craftor WooCommerce Coupon Manager
 * Handles coupon generation, discount rules, expiry scheduling, and batch campaigns.
 */

import { logger } from '../../shared-utils/dist/index.js';
import { WordPressClient } from './client.js';

export type DiscountType = 'percent' | 'fixed_cart' | 'fixed_product';

export interface WooCommerceCouponPayload {
  code: string;
  amount: string;
  discount_type?: DiscountType;
  description?: string;
  date_expires?: string;
  usage_limit?: number;
  usage_limit_per_user?: number;
  individual_use?: boolean;
  product_ids?: number[];
  excluded_product_ids?: number[];
  minimum_amount?: string;
  maximum_amount?: string;
}

export interface WooCommerceCouponRecord extends WooCommerceCouponPayload {
  id: number;
  usage_count: number;
  date_created: string;
}

export interface CouponBridgeOptions {
  client?: WordPressClient;
}

export class WooCommerceCouponsBridge {
  private readonly client?: WordPressClient;

  constructor(options?: CouponBridgeOptions) {
    this.client = options?.client;
  }

  public async createCoupon(payload: WooCommerceCouponPayload): Promise<WooCommerceCouponRecord> {
    logger.info(`[WooCommerceCoupons] Creating coupon "${payload.code}" (${payload.amount} ${payload.discount_type ?? 'percent'})`);

    if (this.client?.isConnected()) {
      return this.client.getRestClient().post<WooCommerceCouponRecord>('/wp-json/wc/v3/coupons', payload);
    }

    return {
      id: Math.floor(Math.random() * 1000) + 1,
      ...payload,
      discount_type: payload.discount_type ?? 'percent',
      usage_count: 0,
      date_created: new Date().toISOString(),
    };
  }

  public async listCoupons(params: { per_page?: number; page?: number; search?: string } = {}): Promise<WooCommerceCouponRecord[]> {
    if (this.client?.isConnected()) {
      return this.client.getRestClient().get<WooCommerceCouponRecord[]>('/wp-json/wc/v3/coupons', { params });
    }

    return [
      {
        id: 101,
        code: 'WELCOME20',
        amount: '20',
        discount_type: 'percent',
        description: 'New Customer 20% Discount',
        usage_count: 14,
        date_created: new Date().toISOString(),
      },
    ];
  }

  public async batchCreateCoupons(coupons: WooCommerceCouponPayload[]): Promise<WooCommerceCouponRecord[]> {
    logger.info(`[WooCommerceCoupons] Batch generating ${coupons.length} coupons`);
    const results: WooCommerceCouponRecord[] = [];
    for (const c of coupons) {
      results.push(await this.createCoupon(c));
    }
    return results;
  }
}
