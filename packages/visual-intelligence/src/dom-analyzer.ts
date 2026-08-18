/**
 * Craftor DOM Analyzer & Elementor Layout Inspector
 * Extracts structured DOM metrics, widget counts, headings, CTAs, and detects responsive overflow.
 */

import { ElementorDomMetrics, OverflowMetrics, ViewportProfile } from './types.js';

export class DomAnalyzer {
  /**
   * Analyzes an HTML document string to extract Elementor DOM hierarchy and semantic elements.
   */
  public static analyzeHtml(html: string, viewport: ViewportProfile): { domMetrics: ElementorDomMetrics; overflow: OverflowMetrics } {
    // 1. Extract Page Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'Untitled Page';

    // 2. Check for Elementor Root Container
    const hasElementorRoot = html.includes('elementor elementor-') || html.includes('data-elementor-type') || html.includes('class="elementor');

    // 3. Count Elementor Root Containers & Sections
    // Match flexbox containers (.e-con) or legacy sections (.elementor-section)
    const containerMatches = html.match(/class="[^"]*(?:e-con|elementor-section)[^"]*"/gi) || [];
    const rootContainers = containerMatches.length;

    // 4. Count Widgets
    const widgetMatches = html.match(/class="[^"]*elementor-widget[^"]*"/gi) || [];
    const totalWidgets = widgetMatches.length;

    // 5. Extract Headings
    const headingsList: string[] = [];
    const headingRegex = /<(?:h[1-6]|div)[^>]*class="[^"]*elementor-heading-title[^"]*"[^>]*>([^<]+)<\/(?:h[1-6]|div)>/gi;
    let headingMatch: RegExpExecArray | null;
    while ((headingMatch = headingRegex.exec(html)) !== null) {
      if (headingMatch[1]) {
        headingsList.push(headingMatch[1].trim());
      }
    }
    // Also capture generic h1/h2 tags if no elementor-heading-title
    if (headingsList.length === 0) {
      const genericHeadingRegex = /<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi;
      while ((headingMatch = genericHeadingRegex.exec(html)) !== null) {
        if (headingMatch[1]) {
          headingsList.push(headingMatch[1].trim());
        }
      }
    }
    const headings = headingsList.length;

    // 6. Extract CTA Buttons
    const ctaButtonsList: string[] = [];
    const buttonRegex = /<(?:a|button)[^>]*class="[^"]*(?:elementor-button|elementor-button-link)[^"]*"[^>]*>[\s\S]*?<span[^>]*class="[^"]*elementor-button-text[^"]*"[^>]*>([^<]+)<\/span>/gi;
    let buttonMatch: RegExpExecArray | null;
    while ((buttonMatch = buttonRegex.exec(html)) !== null) {
      if (buttonMatch[1]) {
        ctaButtonsList.push(buttonMatch[1].trim());
      }
    }
    if (ctaButtonsList.length === 0) {
      const genericBtnRegex = /<(?:button|a)[^>]*class="[^"]*btn[^"]*"[^>]*>([^<]+)<\/(?:button|a)>/gi;
      while ((buttonMatch = genericBtnRegex.exec(html)) !== null) {
        if (buttonMatch[1]) {
          ctaButtonsList.push(buttonMatch[1].trim());
        }
      }
    }
    const buttons = ctaButtonsList.length;

    // 7. Count Images & Missing Images
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const images = imgMatches.length;
    let missingImages = 0;
    imgMatches.forEach((imgTag) => {
      if (!imgTag.includes('src=') || imgTag.includes('src=""') || imgTag.includes('src="#"')) {
        missingImages++;
      }
    });

    // 8. Count Forms
    const formMatches = html.match(/<form[^>]*>/gi) || [];
    const forms = formMatches.length;

    const domMetrics: ElementorDomMetrics = {
      hasElementorRoot,
      elementorVersion: hasElementorRoot ? '3.24.0' : undefined,
      rootContainers,
      totalWidgets,
      headings,
      buttons,
      images,
      missingImages,
      forms,
      pageTitle,
      headingsList,
      ctaButtonsList,
    };

    // 9. Estimate Responsive Overflow
    // Checks for fixed-width containers that exceed viewport width
    let hasHorizontalOverflow = false;
    let overflowPx = 0;

    // Match explicit inline style width on container elements (excluding min-width and max-width)
    const containerStyleMatches = html.match(/style="[^"]*(?<!max-|min-)width:\s*([0-9]+)px/gi) || [];
    for (const match of containerStyleMatches) {
      // Ignore if max-width: 100% or width: 100% is also specified
      if (match.includes('max-width: 100%') || match.includes('max-width:100%')) {
        continue;
      }
      const numMatch = match.match(/(?<!max-|min-)width:\s*([0-9]+)px/i);
      if (numMatch && numMatch[1]) {
        const pxVal = parseInt(numMatch[1], 10);
        if (pxVal > viewport.width) {
          hasHorizontalOverflow = true;
          overflowPx = Math.max(overflowPx, pxVal - viewport.width);
        }
      }
    }

    const overflow: OverflowMetrics = {
      hasHorizontalOverflow,
      scrollWidth: viewport.width + overflowPx,
      innerWidth: viewport.width,
      overflowPx,
    };

    return { domMetrics, overflow };
  }
}
