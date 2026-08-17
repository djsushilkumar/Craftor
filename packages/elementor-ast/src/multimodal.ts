/**
 * Craftor Multimodal Wireframe-to-AST Synthesis Engine
 * Converts Figma wireframe specifications and UI visual layout descriptors into Elementor AST trees.
 */

import { ElementorNode } from '../../shared-types/dist/index.js';
import {
  createFlexContainer,
  createWidgetNode,
} from './generators.js';

export interface VisualLayoutDescriptor {
  sectionType: 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'contact' | 'gallery';
  title?: string;
  subtitle?: string;
  columns?: number;
  items?: Array<{
    title: string;
    description?: string;
    icon?: string;
    buttonText?: string;
    imageUrl?: string;
    price?: string;
  }>;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
  };
}

export interface WireframeSynthesisResult {
  ast: ElementorNode[];
  summary: {
    containerCount: number;
    widgetCount: number;
    detectedLayout: string;
  };
}

export class MultimodalSynthesizer {
  /**
   * Synthesizes a visual layout descriptor into production-ready Elementor AST containers and widgets.
   */
  public synthesizeFromDescriptor(descriptor: VisualLayoutDescriptor): WireframeSynthesisResult {
    const rootNodes: ElementorNode[] = [];
    let widgetCount = 0;

    switch (descriptor.sectionType) {
      case 'hero': {
        const heroContainer = createFlexContainer({
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          settings: {
            min_height: { unit: 'vh', size: 70 },
            padding: { top: '80', bottom: '80', left: '24', right: '24', unit: 'px' },
            background_color: descriptor.theme?.backgroundColor ?? 'hsl(222, 47%, 7%)',
          },
        });

        const titleWidget = createWidgetNode('heading', {
          title: descriptor.title ?? 'Autonomous WordPress with AI',
          header_size: 'h1',
          align: 'center',
          title_color: descriptor.theme?.textColor ?? 'hsl(210, 40%, 98%)',
        });
        heroContainer.elements.push(titleWidget);
        widgetCount++;

        if (descriptor.subtitle) {
          const subWidget = createWidgetNode('text-editor', {
            editor: `<p style="text-align: center; color: hsl(215, 20%, 65%); font-size: 18px;">${descriptor.subtitle}</p>`,
          });
          heroContainer.elements.push(subWidget);
          widgetCount++;
        }

        const ctaButton = createWidgetNode('button', {
          text: descriptor.items?.[0]?.buttonText ?? 'Get Started Now',
          align: 'center',
          button_type: 'primary',
          background_color: descriptor.theme?.primaryColor ?? 'hsl(243, 75%, 59%)',
        });
        heroContainer.elements.push(ctaButton);
        widgetCount++;

        rootNodes.push(heroContainer);
        break;
      }

      case 'features': {
        const sectionContainer = createFlexContainer({
          flexDirection: 'column',
          settings: {
            padding: { top: '60', bottom: '60', left: '24', right: '24', unit: 'px' },
            background_color: descriptor.theme?.backgroundColor ?? 'hsl(222, 47%, 11%)',
          },
        });

        if (descriptor.title) {
          sectionContainer.elements.push(
            createWidgetNode('heading', {
              title: descriptor.title,
              header_size: 'h2',
              align: 'center',
            }),
          );
          widgetCount++;
        }

        const cols = descriptor.columns ?? 3;
        const gridContainer = createFlexContainer({
          flexDirection: 'row',
          settings: {
            wrap: 'wrap',
            gap: { column: '24', row: '24', unit: 'px' },
          },
        });

        const items = descriptor.items ?? [
          { title: 'Feature 1', description: 'High-speed automated site builder' },
          { title: 'Feature 2', description: 'Real-time live Elementor canvas sync' },
          { title: 'Feature 3', description: 'Zero-latency rollback recovery' },
        ];

        for (const item of items) {
          const card = createFlexContainer({
            flexDirection: 'column',
            settings: {
              width: { size: Math.floor(100 / cols) - 2, unit: '%' },
              padding: { top: '24', bottom: '24', left: '20', right: '20', unit: 'px' },
              border_radius: descriptor.theme?.borderRadius ?? '8px',
              background_color: 'hsl(222, 47%, 14%)',
            },
          });

          card.elements.push(createWidgetNode('heading', { title: item.title, header_size: 'h4' }));
          widgetCount++;

          if (item.description) {
            card.elements.push(createWidgetNode('text-editor', { editor: `<p>${item.description}</p>` }));
            widgetCount++;
          }

          gridContainer.elements.push(card);
        }

        sectionContainer.elements.push(gridContainer);
        rootNodes.push(sectionContainer);
        break;
      }

      case 'pricing': {
        const pricingContainer = createFlexContainer({
          flexDirection: 'column',
          settings: {
            padding: { top: '60', bottom: '60', left: '24', right: '24', unit: 'px' },
          },
        });

        const title = createWidgetNode('heading', {
          title: descriptor.title ?? 'Transparent Pricing',
          header_size: 'h2',
          align: 'center',
        });
        pricingContainer.elements.push(title);
        widgetCount++;

        const cardsRow = createFlexContainer({
          flexDirection: 'row',
          justifyContent: 'center',
          settings: {
            gap: { column: '24', row: '24', unit: 'px' },
          },
        });

        const plans = descriptor.items ?? [
          { title: 'Starter', price: '$29/mo', description: 'For small sites' },
          { title: 'Pro', price: '$79/mo', description: 'For growing businesses' },
          { title: 'Enterprise', price: '$199/mo', description: 'Full autonomous control' },
        ];

        for (const plan of plans) {
          const planCard = createFlexContainer({
            flexDirection: 'column',
            alignItems: 'center',
            settings: {
              padding: { top: '32', bottom: '32', left: '24', right: '24', unit: 'px' },
              background_color: 'hsl(222, 47%, 13%)',
              border_radius: '12px',
            },
          });

          planCard.elements.push(createWidgetNode('heading', { title: plan.title, header_size: 'h3' }));
          planCard.elements.push(createWidgetNode('heading', { title: plan.price ?? '$49', header_size: 'h2' }));
          planCard.elements.push(createWidgetNode('button', { text: 'Choose Plan', align: 'center' }));
          widgetCount += 3;

          cardsRow.elements.push(planCard);
        }

        pricingContainer.elements.push(cardsRow);
        rootNodes.push(pricingContainer);
        break;
      }

      default: {
        const genericContainer = createFlexContainer({
          flexDirection: 'column',
          settings: {
            padding: { top: '40', bottom: '40', left: '20', right: '20', unit: 'px' },
          },
        });
        genericContainer.elements.push(
          createWidgetNode('heading', { title: descriptor.title ?? 'Section Title' }),
        );
        widgetCount++;
        rootNodes.push(genericContainer);
      }
    }

    return {
      ast: rootNodes,
      summary: {
        containerCount: rootNodes.length,
        widgetCount,
        detectedLayout: descriptor.sectionType,
      },
    };
  }
}
