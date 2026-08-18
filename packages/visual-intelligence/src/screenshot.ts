/**
 * Craftor Playwright Headless Screenshot Engine
 * Captures real binary PNG raster screenshots across Desktop (1440x900), Tablet (768x1024), and Mobile (375x812).
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium, Browser, BrowserContext } from 'playwright-core';
import { logger } from '@craftor/shared-utils';
import {
  ScreenshotCaptureOptions,
  ScreenshotOptions,
  ScreenshotResult,
  ScreenshotOutput,
  VIEWPORTS,
  ViewportProfile,
} from './types.js';
import { DomAnalyzer } from './dom-analyzer.js';

export class PlaywrightScreenshotEngine {
  /**
   * Finds the best available browser executable on the current host system.
   */
  public static resolveBrowserExecutable(): string | undefined {
    const candidates = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return undefined;
  }

  /**
   * Captures multi-viewport screenshots (Desktop, Tablet, Mobile) for a given URL.
   * Returns an object with the paths to the generated PNG images.
   */
  public static async captureScreenshots(options: ScreenshotCaptureOptions): Promise<ScreenshotOutput> {
    const outputDir = options.outputDir || path.resolve(process.cwd(), 'artifacts', 'screenshots');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const prefix = options.prefix || 'screenshot';
    const timeoutMs = options.timeoutMs || 15000;
    const executablePath = this.resolveBrowserExecutable();

    logger.info(`[PlaywrightScreenshotEngine] Launching headless browser (${executablePath || 'default chromium'}) for ${options.url}`);

    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      });

      const desktopPath = path.join(outputDir, `${prefix}_desktop_1440x900.png`);
      const tabletPath = path.join(outputDir, `${prefix}_tablet_768x1024.png`);
      const mobilePath = path.join(outputDir, `${prefix}_mobile_375x812.png`);

      // 1. Desktop
      await this.captureSingleViewport(browser, options.url, VIEWPORTS.desktop, desktopPath, timeoutMs, options.waitForSelector);
      // 2. Tablet
      await this.captureSingleViewport(browser, options.url, VIEWPORTS.tablet, tabletPath, timeoutMs, options.waitForSelector);
      // 3. Mobile
      await this.captureSingleViewport(browser, options.url, VIEWPORTS.mobile, mobilePath, timeoutMs, options.waitForSelector);

      logger.info(`[PlaywrightScreenshotEngine] All 3 viewports successfully captured for ${options.url}`);

      return {
        desktop: desktopPath,
        tablet: tabletPath,
        mobile: mobilePath,
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Captures multi-viewport screenshots and performs DOM analysis.
   */
  public static async captureViewports(options: ScreenshotOptions): Promise<ScreenshotResult[]> {
    const viewportsToCapture = options.viewports || ['desktop', 'tablet', 'mobile'];
    const results: ScreenshotResult[] = [];

    const outputDir = options.outputDir || path.resolve(process.cwd(), 'artifacts', 'screenshots');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const executablePath = this.resolveBrowserExecutable();
    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      });

      for (const vpKey of viewportsToCapture) {
        const viewport = VIEWPORTS[vpKey];
        const t0 = Date.now();
        const filename = `screenshot_${viewport.name}_${viewport.width}x${viewport.height}.png`;
        const screenshotPath = path.join(outputDir, filename);

        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const page = await context.newPage();

        let statusCode = 200;
        let html = '';
        const consoleErrors: string[] = [];
        const failedRequests: string[] = [];

        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        page.on('requestfailed', (req) => {
          failedRequests.push(`${req.url()} (${req.failure()?.errorText || 'failed'})`);
        });

        try {
          const resp = await page.goto(options.url, {
            waitUntil: 'load',
            timeout: options.timeoutMs || 15000,
          });
          statusCode = resp?.status() || 200;
          html = await page.content();
          await page.waitForTimeout(300);
          await page.screenshot({ path: screenshotPath });
        } catch (err) {
          statusCode = 500;
          consoleErrors.push((err as Error).message);
        } finally {
          await context.close();
        }

        const loadTimeMs = Date.now() - t0;
        const { domMetrics, overflow } = DomAnalyzer.analyzeHtml(html, viewport);
        const issues: string[] = [];

        if (statusCode >= 400) issues.push(`HTTP ${statusCode}`);
        if (!domMetrics.hasElementorRoot) issues.push('Elementor root wrapper not found in DOM');
        if (domMetrics.rootContainers === 0) issues.push('Zero root containers found');
        if (overflow.hasHorizontalOverflow) issues.push(`Horizontal overflow (+${overflow.overflowPx}px)`);

        const status: 'PASS' | 'WARN' | 'FAIL' =
          statusCode >= 400 || !domMetrics.hasElementorRoot || domMetrics.rootContainers === 0
            ? 'FAIL'
            : overflow.hasHorizontalOverflow || domMetrics.missingImages > 0
            ? 'WARN'
            : 'PASS';

        results.push({
          url: options.url,
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
        });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return results;
  }

  private static async captureSingleViewport(
    browser: Browser,
    url: string,
    viewport: ViewportProfile,
    outputPath: string,
    timeoutMs: number,
    waitForSelector?: string,
  ): Promise<void> {
    let context: BrowserContext | null = null;
    try {
      context = await browser.newContext({
        viewport: {
          width: viewport.width,
          height: viewport.height,
        },
        deviceScaleFactor: 1,
      });

      const page = await context.newPage();
      logger.debug(`[PlaywrightScreenshotEngine] Navigating to ${url} at ${viewport.width}x${viewport.height}`);

      await page.goto(url, {
        waitUntil: 'load',
        timeout: timeoutMs,
      });

      // Wait briefly for CSS and Elementor animations to stabilize
      await page.waitForTimeout(500);

      if (waitForSelector) {
        try {
          await page.waitForSelector(waitForSelector, { timeout: 3000 });
        } catch {
          // Continue if custom selector isn't found
        }
      }

      await page.screenshot({
        path: outputPath,
        fullPage: false,
      });

      logger.debug(`[PlaywrightScreenshotEngine] Saved ${viewport.name} screenshot: ${outputPath}`);
    } finally {
      if (context) {
        await context.close();
      }
    }
  }
}

export const ScreenshotEngine = PlaywrightScreenshotEngine;

// Export convenient shorthand function
export async function capture(options: ScreenshotCaptureOptions): Promise<ScreenshotOutput> {
  return PlaywrightScreenshotEngine.captureScreenshots(options);
}
