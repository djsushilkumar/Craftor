/**
 * Craftor Visual Intelligence & Closed-Loop Verification Types
 */

export interface ViewportProfile {
  name: 'desktop' | 'tablet' | 'mobile';
  width: number;
  height: number;
}

export const VIEWPORT_PROFILES: Record<'desktop' | 'tablet' | 'mobile', ViewportProfile> = {
  desktop: { name: 'desktop', width: 1440, height: 900 },
  tablet: { name: 'tablet', width: 768, height: 1024 },
  mobile: { name: 'mobile', width: 375, height: 812 },
};

export interface ElementorDomMetrics {
  hasElementorRoot: boolean;
  elementorVersion?: string;
  rootContainers: number;
  totalWidgets: number;
  headings: number;
  buttons: number;
  images: number;
  missingImages: number;
  forms: number;
  pageTitle: string;
  headingsList: string[];
  ctaButtonsList: string[];
}

export interface OverflowMetrics {
  hasHorizontalOverflow: boolean;
  scrollWidth: number;
  innerWidth: number;
  overflowPx: number;
}

export interface ScreenshotOptions {
  url: string;
  viewports?: Array<'desktop' | 'tablet' | 'mobile'>;
  timeoutMs?: number;
  fullPage?: boolean;
  outputDir?: string;
}

export interface ScreenshotResult {
  url: string;
  viewport: ViewportProfile;
  screenshotPath: string;
  width: number;
  height: number;
  loadTimeMs: number;
  statusCode: number;
  consoleErrors: string[];
  failedRequests: string[];
  domMetrics: ElementorDomMetrics;
  overflow: OverflowMetrics;
  status: 'PASS' | 'WARN' | 'FAIL';
  issues: string[];
}

export interface VisualDiffResult {
  viewport: 'desktop' | 'tablet' | 'mobile';
  baselinePath: string;
  currentPath: string;
  pixelDifference: number;
  differencePercentage: number;
  changedRegions: Array<{ x: number; y: number; width: number; height: number }>;
  status: 'IDENTICAL' | 'INTENDED_MUTATION' | 'REGRESSION';
  severity: 'NONE' | 'LOW' | 'HIGH';
  description: string;
}

export interface VisualVerificationResult {
  overallStatus: 'PASS' | 'WARN' | 'FAIL';
  url: string;
  timestamp: string;
  viewports: ScreenshotResult[];
  diffs?: VisualDiffResult[];
  failures: string[];
  warnings: string[];
  summary: {
    desktopPassed: boolean;
    tabletPassed: boolean;
    mobilePassed: boolean;
    totalContainers: number;
    hasConsoleErrors: boolean;
    hasOverflow: boolean;
  };
}

export interface BaselineRecord {
  siteId: string;
  pageId: string | number;
  viewport: 'desktop' | 'tablet' | 'mobile';
  hash: string;
  screenshotPath: string;
  domMetrics: ElementorDomMetrics;
  createdAt: string;
}
