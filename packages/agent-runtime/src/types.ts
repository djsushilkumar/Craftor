/**
 * Craftor Autonomous Agent Runtime Type Definitions
 */

export type RiskLevel = 'READ_ONLY' | 'SAFE_MUTATION' | 'DESTRUCTIVE';

export type TaskStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'BLOCKED_ON_APPROVAL' | 'SKIPPED';

export type PlanStatus = 'DRAFT' | 'APPROVED' | 'EXECUTING' | 'VERIFYING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';

export type VerificationType = 'VISUAL' | 'REST_READBACK' | 'INTEGRITY_SNAPSHOT';

export interface PlanPostcondition {
  type: 'REST_FIELD' | 'DOM_SELECTOR' | 'AST_ELEMENT_COUNT' | 'HTTP_STATUS' | 'VISUAL_AUDIT';
  field?: string;
  expectedValue?: unknown;
  minCount?: number;
}

export interface PlanTask {
  id: string;
  title: string;
  tool: string;
  arguments: Record<string, unknown>;
  dependencies: string[]; // Step IDs that must succeed before this task can execute
  riskLevel: RiskLevel;
  verificationType?: VerificationType;
  rollbackSnapshotTarget?: {
    type: 'elementor_data' | 'woocommerce_product' | 'wp_post' | 'wp_option';
    targetIdParam: string; // e.g. '$steps.create_page.output.page.id' or 'targetPageId'
  };
  expectedPostcondition?: PlanPostcondition;
  status: TaskStatus;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export interface ExecutionPlan {
  planId: string;
  goal: string;
  archetype?: string;
  siteUrl: string;
  createdAt: string;
  tasks: PlanTask[];
  status: PlanStatus;
  totalTasks: number;
  completedTasks: number;
  currentTaskIndex: number;
  maxVerificationAttempts?: number;
  context: Record<string, unknown>;
}

export interface SiteCapabilityProfile {
  siteUrl: string;
  isElementorActive: boolean;
  elementorVersion?: string;
  isWooCommerceActive: boolean;
  woocommerceVersion?: string;
  isRankMathActive: boolean;
  isYoastActive: boolean;
  isAcfActive: boolean;
  activePlugins: string[];
  globalKitTokens?: {
    primaryColor?: string;
    secondaryColor?: string;
    bodyFont?: string;
    headingFont?: string;
  };
}

export interface TaskExecutionEvent {
  planId: string;
  taskId: string;
  taskTitle: string;
  tool: string;
  status: TaskStatus;
  durationMs?: number;
  output?: Record<string, unknown>;
  error?: string;
  timestamp: string;
}

export interface ExecutionJournalEntry {
  traceId: string;
  planId: string;
  taskId: string;
  tool: string;
  riskLevel: RiskLevel;
  durationMs: number;
  status: TaskStatus;
  snapshotId?: string;
  error?: string;
  timestamp: string;
}
