/**
 * Craftor Visual Verifier Orchestrator
 * Runs responsive multi-viewport audits and returns machine-consumable VisualVerificationResult.
 */

import { logger } from '@craftor/shared-utils';
import {
  ScreenshotOptions,
  VisualVerificationResult,
} from './types.js';
import { ScreenshotEngine } from './screenshot.js';

export interface VerifyVisualOptions extends ScreenshotOptions {
  minRootContainers?: number;
}

export class VisualVerifier {
  /**
   * Performs an end-to-end visual verification across desktop, tablet, and mobile profiles.
   */
  public static async verify(options: VerifyVisualOptions): Promise<VisualVerificationResult> {
    logger.info(`[VisualVerifier] Starting visual verification for ${options.url}`);

    const viewports = await ScreenshotEngine.captureViewports({
      url: options.url,
      viewports: options.viewports || ['desktop', 'tablet', 'mobile'],
      timeoutMs: options.timeoutMs || 8000,
      outputDir: options.outputDir,
    });

    const failures: string[] = [];
    const warnings: string[] = [];

    const desktop = viewports.find((v) => v.viewport.name === 'desktop');
    const tablet = viewports.find((v) => v.viewport.name === 'tablet');
    const mobile = viewports.find((v) => v.viewport.name === 'mobile');

    const minContainers = options.minRootContainers ?? 1;

    // Check Viewports
    for (const vp of viewports) {
      if (vp.status === 'FAIL') {
        failures.push(`[${vp.viewport.name.toUpperCase()}] ${vp.issues.join(' | ')}`);
      } else if (vp.status === 'WARN') {
        warnings.push(`[${vp.viewport.name.toUpperCase()}] ${vp.issues.join(' | ')}`);
      }

      if (vp.domMetrics.rootContainers < minContainers) {
        failures.push(`[${vp.viewport.name.toUpperCase()}] Expected at least ${minContainers} root containers, found ${vp.domMetrics.rootContainers}`);
      }

      if (vp.viewport.name === 'mobile' && vp.overflow.hasHorizontalOverflow) {
        failures.push(`[MOBILE] Horizontal overflow of ${vp.overflow.overflowPx}px breaks mobile responsiveness`);
      }
    }

    const overallStatus: 'PASS' | 'WARN' | 'FAIL' =
      failures.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARN' : 'PASS';

    return {
      overallStatus,
      url: options.url,
      timestamp: new Date().toISOString(),
      viewports,
      failures,
      warnings,
      summary: {
        desktopPassed: desktop?.status !== 'FAIL',
        tabletPassed: tablet?.status !== 'FAIL',
        mobilePassed: mobile?.status !== 'FAIL' && !mobile?.overflow.hasHorizontalOverflow,
        totalContainers: desktop?.domMetrics.rootContainers || 0,
        hasConsoleErrors: viewports.some((v) => v.consoleErrors.length > 0),
        hasOverflow: viewports.some((v) => v.overflow.hasHorizontalOverflow),
      },
    };
  }
}
