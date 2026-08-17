/**
 * Craftor E-Commerce Automated Sales Funnel Generator
 * Builds multi-step high-converting funnels: Landing -> Product Upsell -> Checkout -> Thank You.
 */

import { ElementorNode } from '../../shared-types/dist/index.js';
import { createFlexContainer, createWidgetNode } from './generators.js';

export interface SalesFunnelStep {
  stepId: string;
  stepName: string;
  stepType: 'landing' | 'upsell' | 'checkout' | 'thank_you';
  ast: ElementorNode[];
}

export interface SalesFunnelConfig {
  funnelName: string;
  productName: string;
  price: string;
  upsellProductName?: string;
  upsellPrice?: string;
  ctaText?: string;
  themeColor?: string;
}

export class SalesFunnelGenerator {
  /**
   * Generates a 4-step e-commerce sales funnel AST suite.
   */
  public generateFullFunnel(config: SalesFunnelConfig): SalesFunnelStep[] {
    const themeColor = config.themeColor ?? 'hsl(243, 75%, 59%)';

    // Step 1: High-Converting Product Landing Page
    const landingContainer = createFlexContainer({
      flexDirection: 'column',
      alignItems: 'center',
      settings: {
        padding: { top: '60', bottom: '60', left: '20', right: '20', unit: 'px' },
      },
    });
    landingContainer.elements.push(
      createWidgetNode('heading', { title: `Special Offer: ${config.productName}`, header_size: 'h1', align: 'center' }),
      createWidgetNode('heading', { title: `Now Only ${config.price}`, header_size: 'h2', align: 'center' }),
      createWidgetNode('button', { text: config.ctaText ?? 'Claim Offer Now', button_type: 'primary', background_color: themeColor }),
    );

    // Step 2: One-Click Dynamic Upsell Container
    const upsellContainer = createFlexContainer({
      flexDirection: 'column',
      alignItems: 'center',
      settings: {
        padding: { top: '50', bottom: '50', left: '20', right: '20', unit: 'px' },
        background_color: 'hsl(38, 92%, 14%)',
        border_radius: '12px',
      },
    });
    upsellContainer.elements.push(
      createWidgetNode('heading', { title: 'WAIT! Complete Your Order With This Exclusive Upgrade', header_size: 'h2', align: 'center' }),
      createWidgetNode('heading', { title: `${config.upsellProductName ?? 'VIP Access Upgrade'} - Just ${config.upsellPrice ?? '$29'}`, header_size: 'h3', align: 'center' }),
      createWidgetNode('button', { text: 'Yes! Add to My Order with 1-Click', align: 'center' }),
      createWidgetNode('button', { text: 'No thanks, I will pass on this opportunity', align: 'center' }),
    );

    // Step 3: Streamlined Checkout Page
    const checkoutContainer = createFlexContainer({
      flexDirection: 'row',
      settings: {
        gap: { column: '30', row: '30', unit: 'px' },
        padding: { top: '40', bottom: '40', left: '20', right: '20', unit: 'px' },
      },
    });
    const orderReview = createFlexContainer({
      flexDirection: 'column',
      settings: { width: { size: 60, unit: '%' } },
    });
    orderReview.elements.push(
      createWidgetNode('heading', { title: 'Order Summary', header_size: 'h3' }),
      createWidgetNode('text-editor', { editor: `<p><strong>${config.productName}</strong>: ${config.price}</p>` }),
    );
    const paymentCol = createFlexContainer({
      flexDirection: 'column',
      settings: { width: { size: 40, unit: '%' } },
    });
    paymentCol.elements.push(
      createWidgetNode('heading', { title: 'Instant Express Checkout', header_size: 'h3' }),
      createWidgetNode('button', { text: 'Complete Purchase', button_type: 'success' }),
    );
    checkoutContainer.elements.push(orderReview, paymentCol);

    // Step 4: Thank You & Order Confirmation Page
    const thankYouContainer = createFlexContainer({
      flexDirection: 'column',
      alignItems: 'center',
      settings: {
        padding: { top: '80', bottom: '80', left: '20', right: '20', unit: 'px' },
      },
    });
    thankYouContainer.elements.push(
      createWidgetNode('heading', { title: 'Thank You for Your Order!', header_size: 'h1', align: 'center' }),
      createWidgetNode('text-editor', { editor: `<p style="text-align:center;">Your order confirmation has been sent. Access your downloads below.</p>` }),
      createWidgetNode('button', { text: 'Access Customer Portal', align: 'center' }),
    );

    return [
      { stepId: 'step_landing', stepName: 'Product Landing Page', stepType: 'landing', ast: [landingContainer] },
      { stepId: 'step_upsell', stepName: '1-Click Upsell', stepType: 'upsell', ast: [upsellContainer] },
      { stepId: 'step_checkout', stepName: 'Express Checkout', stepType: 'checkout', ast: [checkoutContainer] },
      { stepId: 'step_thank_you', stepName: 'Order Receipt & Thank You', stepType: 'thank_you', ast: [thankYouContainer] },
    ];
  }
}
