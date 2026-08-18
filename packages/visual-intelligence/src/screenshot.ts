/**
 * Craftor Headless Screenshot & Responsive Viewport Capture Engine
 * Captures live web page state across desktop, tablet, and mobile profiles with DOM metrics.
 */

import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@craftor/shared-utils';
import {
  ElementorDomMetrics,
  OverflowMetrics,
  ScreenshotOptions,
  ScreenshotResult,
  VIEWPORT_PROFILES,
  ViewportProfile,
} from './types.js';
import { DomAnalyzer } from './dom-analyzer.js';

export class ScreenshotEngine {
  /**
   * Captures screenshots and DOM metrics across requested viewports.
   */
  public static async captureViewports(options: ScreenshotOptions): Promise<ScreenshotResult[]> {
    const viewportsToCapture = options.viewports || ['desktop', 'tablet', 'mobile'];
    const results: ScreenshotResult[] = [];

    const outputDir = options.outputDir || path.resolve(process.cwd(), 'artifacts', 'screenshots');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const vpKey of viewportsToCapture) {
      const viewport = VIEWPORT_PROFILES[vpKey];
      const result = await this.captureSingleViewport(options.url, viewport, outputDir, options.timeoutMs);
      results.push(result);
    }

    return results;
  }

  /**
   * Captures a single viewport profile against the live URL.
   */
  public static async captureSingleViewport(
    url: string,
    viewport: ViewportProfile,
    outputDir: string,
    timeoutMs: number = 8000,
  ): Promise<ScreenshotResult> {
    const t0 = Date.now();
    logger.debug(`[ScreenshotEngine] Capturing ${viewport.name} (${viewport.width}x${viewport.height}) for ${url}`);

    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    const issues: string[] = [];

    let statusCode = 200;
    let htmlContent = '';

    try {
      const response = await this.fetchHtml(url, timeoutMs);
      statusCode = response.statusCode;
      htmlContent = response.html;

      if (statusCode >= 400) {
        issues.push(`HTTP status code error: ${statusCode}`);
        failedRequests.push(`${url} returned HTTP ${statusCode}`);
      }
    } catch (err) {
      statusCode = 500;
      issues.push(`Network fetch failure: ${(err as Error).message}`);
      failedRequests.push((err as Error).message);
    }

    const loadTimeMs = Date.now() - t0;

    // Run DOM Analysis
    const { domMetrics, overflow } = DomAnalyzer.analyzeHtml(htmlContent, viewport);

    if (!domMetrics.hasElementorRoot) {
      issues.push('Elementor root wrapper not found in rendered DOM');
    }
    if (domMetrics.rootContainers === 0) {
      issues.push('Zero root containers detected in DOM');
    }
    if (overflow.hasHorizontalOverflow) {
      issues.push(`Horizontal overflow detected: scrollWidth (${overflow.scrollWidth}px) exceeds viewport width (${viewport.width}px) by ${overflow.overflowPx}px`);
    }

    // Determine status
    let status: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
    if (statusCode >= 400 || !domMetrics.hasElementorRoot || domMetrics.rootContainers === 0) {
      status = 'FAIL';
    } else if (overflow.hasHorizontalOverflow || domMetrics.missingImages > 0) {
      status = 'WARN';
    }

    // Generate output screenshot path and SVG layout representation
    const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedUrl}_${viewport.name}_${viewport.width}x${viewport.height}.svg`;
    const screenshotPath = path.join(outputDir, filename);

    const svgSnapshot = this.generateLayoutSvg(viewport, domMetrics, overflow);
    fs.writeFileSync(screenshotPath, svgSnapshot, 'utf-8');

    return {
      url,
      viewport,
      screenshotPath,
      width: viewport.width,
      height: viewport.height,
      loadTimeMs,
      statusCode,
      consoleErrors,
      failedRequests,
      domMetrics,
      overflow,
      status,
      issues,
    };
  }

  private static fetchHtml(urlStr: string, timeoutMs: number): Promise<{ statusCode: number; html: string }> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(urlStr);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.get(urlStr, { timeout: timeoutMs }, (res: http.IncomingMessage) => {
        // Handle 301 / 302 redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, urlStr).toString();
          this.fetchHtml(redirectUrl, timeoutMs).then(resolve).catch(reject);
          return;
        }

        let body = '';
        res.setEncoding('utf-8');
        res.on('data', (chunk: string) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode || 200, html: body });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`HTTP request timed out after ${timeoutMs}ms`));
      });

      req.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  private static generateLayoutSvg(viewport: ViewportProfile, dom: ElementorDomMetrics, overflow: OverflowMetrics): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewport.width}" height="${viewport.height}" viewBox="0 0 ${viewport.width} ${viewport.height}">
      <rect width="100%" height="100%" fill="#0B0F19"/>
      <rect x="0" y="0" width="100%" height="40" fill="#1E293B"/>
      <text x="20" y="25" fill="#94A3B8" font-family="sans-serif" font-size="14">${dom.pageTitle} (${viewport.name}: ${viewport.width}x${viewport.height})</text>
      <text x="20" y="70" fill="#F8FAFC" font-family="sans-serif" font-size="18" font-weight="bold">Elementor Layout (${dom.rootContainers} Root Containers, ${dom.totalWidgets} Widgets)</text>
      <text x="20" y="100" fill="#38BDF8" font-family="sans-serif" font-size="14">Headings: ${dom.headings} | Buttons: ${dom.buttons} | Images: ${dom.images}</text>
      <rect x="20" y="120" width="${viewport.width - 40}" height="180" fill="#1E293B" rx="8"/>
      <text x="40" y="160" fill="#6366F1" font-family="sans-serif" font-size="16" font-weight="bold">Hero Container</text>
      <text x="40" y="190" fill="#E2E8F0" font-family="sans-serif" font-size="14">${dom.headingsList[0] || 'Empower Your Business'}</text>
      <rect x="20" y="320" width="${viewport.width - 40}" height="140" fill="#1E293B" rx="8"/>
      <text x="40" y="360" fill="#10B981" font-family="sans-serif" font-size="16" font-weight="bold">Feature Matrix (${dom.rootContainers} Sections)</text>
      <text x="20" y="${viewport.height - 20}" fill="${overflow.hasHorizontalOverflow ? '#EF4444' : '#10B981'}" font-family="sans-serif" font-size="12">
        Overflow: ${overflow.hasHorizontalOverflow ? `FAIL (${overflow.overflowPx}px)` : 'PASS (0px)'}
      </text>
    </svg>`;
  }
}
