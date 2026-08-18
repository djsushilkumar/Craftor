/**
 * Craftor Server-Side Human Approval Engine
 * Enforces strict, independent human-controlled authorization for all destructive operations.
 * Autonomous AI agents CANNOT self-authorize, forge, replay, or bypass approval.
 */

import { randomBytes, createHash } from 'crypto';

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DENIED'
  | 'EXPIRED'
  | 'CONSUMED'
  | 'CANCELLED';

export interface ApprovalRecord {
  approvalId: string;
  action: string;
  targetId: string | number;
  argumentsHash: string;
  argumentsPayload: Record<string, unknown>;
  status: ApprovalStatus;
  requestedAt: number;
  expiresAt: number;
  approvedAt?: number;
  approvedBy?: string;
  deniedAt?: number;
  deniedBy?: string;
  consumedAt?: number;
  executionToken?: string;
}

export interface ApprovalRequestResponse {
  requiresHumanApproval: true;
  approvalId: string;
  status: 'PENDING';
  action: string;
  targetId: string | number;
  expiresInSeconds: number;
  message: string;
}

export class ApprovalEngine {
  private static records: Map<string, ApprovalRecord> = new Map();
  private static readonly DEFAULT_TTL_SECONDS = 300; // 5 minutes

  /**
   * Authoritative classification of destructive operations.
   */
  public static isDestructiveAction(action: string, args: Record<string, unknown> = {}): boolean {
    const destructiveActions = new Set([
      'craftor_wp_delete_post',
      'craftor_wc_delete_product',
      'craftor_restore_snapshot',
      'craftor_delete_snapshot',
    ]);

    if (destructiveActions.has(action)) {
      return true;
    }

    if (action === 'craftor_manage_plugin') {
      const pluginAction = String(args.action || 'activate');
      if (pluginAction === 'deactivate' || pluginAction === 'delete') {
        return true;
      }
    }

    return false;
  }

  /**
   * Computes deterministic SHA-256 hash of canonicalized JSON arguments.
   * Prevents parameter substitution attacks.
   */
  public static computeArgumentsHash(args: Record<string, unknown>): string {
    const sortedKeys = Object.keys(args).sort();
    const canonicalObj: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      if (key !== 'approvalId' && key !== 'executionToken' && key !== 'confirmed') {
        canonicalObj[key] = args[key];
      }
    }
    return createHash('sha256').update(JSON.stringify(canonicalObj)).digest('hex');
  }

  /**
   * Creates a new PENDING approval record.
   * Note: Does NOT return any executable token to the caller/AI.
   */
  public static createApprovalRequest(
    action: string,
    targetId: string | number,
    args: Record<string, unknown>,
    ttlSeconds: number = ApprovalEngine.DEFAULT_TTL_SECONDS,
  ): ApprovalRequestResponse {
    const approvalId = `crf_appr_${randomBytes(16).toString('hex')}`;
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;
    const argumentsHash = this.computeArgumentsHash(args);

    const record: ApprovalRecord = {
      approvalId,
      action,
      targetId,
      argumentsHash,
      argumentsPayload: { ...args },
      status: 'PENDING',
      requestedAt: now,
      expiresAt,
    };

    this.records.set(approvalId, record);
    this.purgeExpired();

    return {
      requiresHumanApproval: true,
      approvalId,
      status: 'PENDING',
      action,
      targetId,
      expiresInSeconds: ttlSeconds,
      message: `[HUMAN APPROVAL REQUIRED] Destructive operation "${action}" on target "${targetId}" requires independent human authorization from WordPress Admin or Craftor Dashboard. Reference Approval ID: "${approvalId}".`,
    };
  }

  /**
   * Retrieves an approval record by ID with automatic expiration check.
   */
  public static getApproval(approvalId: string): ApprovalRecord | null {
    if (!approvalId || typeof approvalId !== 'string') {
      return null;
    }
    const record = this.records.get(approvalId);
    if (!record) {
      return null;
    }

    if ((record.status === 'PENDING' || record.status === 'APPROVED') && Date.now() > record.expiresAt) {
      record.status = 'EXPIRED';
    }

    return record;
  }

  /**
   * Lists all currently PENDING approval requests for human review UI.
   */
  public static listPendingApprovals(): ApprovalRecord[] {
    this.purgeExpired();
    const pending: ApprovalRecord[] = [];
    for (const record of this.records.values()) {
      if (record.status === 'PENDING') {
        pending.push(record);
      }
    }
    return pending;
  }

  /**
   * Human Approval Event.
   * MUST originate from an authenticated human session (WordPress Admin / Dashboard).
   * Transitions state: PENDING -> APPROVED.
   */
  public static approve(
    approvalId: string,
    approvedBy: string,
  ): { success: boolean; record?: ApprovalRecord; error?: string } {
    const record = this.getApproval(approvalId);
    if (!record) {
      return { success: false, error: `Approval record "${approvalId}" not found` };
    }

    if (record.status === 'EXPIRED') {
      return { success: false, error: 'Approval request has expired' };
    }

    if (record.status !== 'PENDING') {
      return {
        success: false,
        error: `Cannot approve request with status "${record.status}". Allowed transition is PENDING -> APPROVED only.`,
      };
    }

    const now = Date.now();
    const executionToken = `crf_exec_${randomBytes(16).toString('hex')}`;

    record.status = 'APPROVED';
    record.approvedAt = now;
    record.approvedBy = approvedBy;
    record.executionToken = executionToken;

    return { success: true, record };
  }

  /**
   * Human Denial Event.
   * Transitions state: PENDING -> DENIED.
   */
  public static deny(
    approvalId: string,
    deniedBy: string,
  ): { success: boolean; record?: ApprovalRecord; error?: string } {
    const record = this.getApproval(approvalId);
    if (!record) {
      return { success: false, error: `Approval record "${approvalId}" not found` };
    }

    if (record.status !== 'PENDING') {
      return {
        success: false,
        error: `Cannot deny request with status "${record.status}". Allowed transition is PENDING -> DENIED only.`,
      };
    }

    record.status = 'DENIED';
    record.deniedAt = Date.now();
    record.deniedBy = deniedBy;

    return { success: true, record };
  }

  /**
   * Verifies that the requested action has been explicitly approved by a human
   * and atomically consumes the authorization (single-use).
   */
  public static verifyAndConsume(
    action: string,
    targetId: string | number,
    args: Record<string, unknown>,
    approvalId?: string,
  ): { authorized: boolean; record?: ApprovalRecord; reason?: string } {
    if (!approvalId || typeof approvalId !== 'string') {
      return {
        authorized: false,
        reason: 'Missing approvalId. Human authorization is required for destructive operations.',
      };
    }

    const record = this.getApproval(approvalId);
    if (!record) {
      return { authorized: false, reason: `Approval record "${approvalId}" not found.` };
    }

    // 1. Check State
    if (record.status === 'PENDING') {
      return {
        authorized: false,
        record,
        reason: `Approval "${approvalId}" is currently PENDING human review.`,
      };
    }

    if (record.status === 'DENIED') {
      return {
        authorized: false,
        record,
        reason: `Approval "${approvalId}" was DENIED by administrator "${record.deniedBy}".`,
      };
    }

    if (record.status === 'EXPIRED') {
      return {
        authorized: false,
        record,
        reason: `Approval "${approvalId}" has EXPIRED.`,
      };
    }

    if (record.status === 'CONSUMED') {
      return {
        authorized: false,
        record,
        reason: `Approval "${approvalId}" has ALREADY BEEN CONSUMED (Replay blocked).`,
      };
    }

    if (record.status !== 'APPROVED') {
      return {
        authorized: false,
        record,
        reason: `Approval status is "${record.status}". Operation not authorized.`,
      };
    }

    // 2. Check Action and Target Matching
    if (record.action !== action) {
      return {
        authorized: false,
        record,
        reason: `Approval action mismatch. Approved for "${record.action}", requested "${action}".`,
      };
    }

    if (String(record.targetId) !== String(targetId)) {
      return {
        authorized: false,
        record,
        reason: `Approval target mismatch. Approved for target "${record.targetId}", requested "${targetId}".`,
      };
    }

    // 3. Check Canonical Argument Hash (Prevent parameter substitution)
    const currentHash = this.computeArgumentsHash(args);
    if (record.argumentsHash !== currentHash) {
      return {
        authorized: false,
        record,
        reason: 'Arguments hash mismatch. Parameters have been modified since approval was granted.',
      };
    }

    // 4. Atomically Consume Authorization (Single-Use Execution)
    record.status = 'CONSUMED';
    record.consumedAt = Date.now();

    return { authorized: true, record };
  }

  /**
   * Cleans up expired records.
   */
  private static purgeExpired(): void {
    const now = Date.now();
    for (const record of this.records.values()) {
      if (now > record.expiresAt && record.status === 'PENDING') {
        record.status = 'EXPIRED';
      }
    }
  }

  /**
   * Resets all approvals in memory (used for test isolation).
   */
  public static reset(): void {
    this.records.clear();
  }
}
