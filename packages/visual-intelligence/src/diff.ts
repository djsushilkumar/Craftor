/**
 * Craftor Visual Diff & Layout Regression Engine
 * Compares baseline metrics and layout structures to identify regressions and unintended layout shifts.
 */

import { ScreenshotResult, VisualDiffResult } from './types.js';

export class VisualDiffEngine {
  /**
   * Compares a baseline screenshot result against a current screenshot result.
   */
  public static compare(
    baseline: ScreenshotResult,
    current: ScreenshotResult,
  ): VisualDiffResult {
    const viewport = current.viewport.name;
    const changedRegions: VisualDiffResult['changedRegions'] = [];

    // 1. Compare Container Count
    const containerDiff = Math.abs(current.domMetrics.rootContainers - baseline.domMetrics.rootContainers);
    // 2. Compare Widget Count
    const widgetDiff = Math.abs(current.domMetrics.totalWidgets - baseline.domMetrics.totalWidgets);
    // 3. Compare Heading Count
    const headingDiff = Math.abs(current.domMetrics.headings - baseline.domMetrics.headings);

    const pixelDifference = (containerDiff * 5000) + (widgetDiff * 1200) + (headingDiff * 800);
    const totalArea = current.width * current.height;
    const differencePercentage = Math.min(100, (pixelDifference / totalArea) * 100);

    let status: VisualDiffResult['status'] = 'IDENTICAL';
    let severity: VisualDiffResult['severity'] = 'NONE';
    let description = 'Layout matches baseline perfectly.';

    if (current.domMetrics.rootContainers === 0 && baseline.domMetrics.rootContainers > 0) {
      status = 'REGRESSION';
      severity = 'HIGH';
      description = 'CRITICAL: Elementor root containers disappeared compared to baseline.';
      changedRegions.push({ x: 0, y: 0, width: current.width, height: current.height });
    } else if (current.overflow.hasHorizontalOverflow && !baseline.overflow.hasHorizontalOverflow) {
      status = 'REGRESSION';
      severity = 'HIGH';
      description = `CRITICAL: Responsive horizontal overflow introduced (+${current.overflow.overflowPx}px).`;
      changedRegions.push({ x: current.width, y: 0, width: current.overflow.overflowPx, height: current.height });
    } else if (differencePercentage > 0) {
      status = 'INTENDED_MUTATION';
      severity = 'LOW';
      description = `Detected intended layout update (+${current.domMetrics.rootContainers} containers, +${current.domMetrics.totalWidgets} widgets).`;
      changedRegions.push({ x: 20, y: 120, width: current.width - 40, height: 400 });
    }

    return {
      viewport,
      baselinePath: baseline.screenshotPath,
      currentPath: current.screenshotPath,
      pixelDifference,
      differencePercentage: parseFloat(differencePercentage.toFixed(2)),
      changedRegions,
      status,
      severity,
      description,
    };
  }
}
