/**
 * Craftor Self-Healing & Performance Auto-Tuner Type Definitions
 */

import { ElementorNode } from '@craftor/shared-types';

export interface AstRepairReport {
  repaired: boolean;
  fixedIssues: string[];
  reconstructedNodeCount: number;
  cleanAst: ElementorNode[];
}

export interface PhpErrorContext {
  errorCode: number;
  errorMessage: string;
  errorFile: string;
  errorLine: number;
  backtrace?: string[];
  activePlugins?: string[];
}

export interface PhpTriageResult {
  severity: 'fatal' | 'warning' | 'notice' | 'performance_degradation';
  rootCause: string;
  mitigationAction: 'increase_memory_limit' | 'deactivate_faulty_hook' | 'restore_snapshot' | 'flush_rewrite_rules';
  recommendedSnapshotId?: string;
  autoFixPayload: Record<string, unknown>;
}

export interface PerformanceTuneOptions {
  siteUrl: string;
  cssPrintMethod?: 'internal' | 'external';
  lazyLoadImages?: boolean;
  fontDisplaySwap?: boolean;
  minifyAstTokens?: boolean;
}

export interface PerformanceTuneReport {
  optimized: boolean;
  appliedTweaks: string[];
  estimatedScoreIncrease: number;
  cssPrintMethod: 'internal' | 'external';
  cdnPurged: boolean;
}

export interface CdnPurgeRequest {
  provider: 'cloudflare' | 'wp_rocket' | 'litespeed' | 'fastly';
  zoneId?: string;
  purgeAll?: boolean;
  urls?: string[];
}

export interface CdnPurgeResult {
  success: boolean;
  provider: string;
  purgedItemsCount: number;
  timestamp: string;
}
