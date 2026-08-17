/**
 * Craftor Schema.org SEO Structured Data Injector
 * Injects Google-compliant JSON-LD schema blocks (FAQPage, Product, Article, LocalBusiness) into Elementor AST.
 */

import { ElementorNode } from '../../shared-types/dist/index.js';
import { createWidgetNode } from './generators.js';

export interface SchemaFaqItem {
  question: string;
  answer: string;
}

export interface SchemaProductConfig {
  name: string;
  description?: string;
  sku?: string;
  price: string;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
}

export class SchemaInjector {
  /**
   * Generates a Google-compliant FAQPage JSON-LD widget node.
   */
  public generateFaqSchemaNode(faqs: SchemaFaqItem[]): ElementorNode {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    return createWidgetNode('html', {
      html: `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`,
    });
  }

  /**
   * Generates a Product Schema JSON-LD widget node.
   */
  public generateProductSchemaNode(product: SchemaProductConfig): ElementorNode {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description ?? product.name,
      sku: product.sku ?? 'SKU-001',
      offers: {
        '@type': 'Offer',
        price: product.price.replace(/[^0-9.]/g, ''),
        priceCurrency: product.priceCurrency ?? 'USD',
        availability: `https://schema.org/${product.availability ?? 'InStock'}`,
      },
    };

    return createWidgetNode('html', {
      html: `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`,
    });
  }
}
