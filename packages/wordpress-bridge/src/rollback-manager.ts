/**
 * Craftor Rollback Engine (Client Bridge)
 * Restores pre-mutation states when mutations fail, AST becomes corrupted, or timeouts occur.
 */

import {
  TransactionSnapshot,
  RollbackResult,
  RollbackHistoryEntry,
  SnapshotTargetType,
} from '../../shared-types/dist/index.js';
import { generateHexUuid, logger } from '../../shared-utils/dist/index.js';
import { SnapshotManager } from './snapshot-manager.js';
import { WordPressClient } from './client.js';

export const ROLLBACK_ERROR_CODES = {
  AST_CORRUPTION_GUARD: -32003,
  ROLLBACK_FAILED: -32004,
  TARGET_NOT_FOUND: -32005,
} as const;

export class RollbackError extends Error {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.name = 'RollbackError';
    this.code = code;
    this.data = data;
    Object.setPrototypeOf(this, RollbackError.prototype);
  }
}

export interface RollbackManagerOptions {
  client?: WordPressClient;
  snapshotManager?: SnapshotManager;
}

export interface RollbackGuardOptions<T> {
  targetId: number | string;
  targetType: SnapshotTargetType;
  actionContext?: string;
  token?: string;
  timeoutMs?: number;
  getCurrentState: () => Promise<unknown>;
  mutate: () => Promise<T>;
  restore: (snapshot: TransactionSnapshot) => Promise<void>;
  validateAst?: (result: T) => boolean;
}

export class RollbackManager {
  private readonly client?: WordPressClient;
  private readonly snapshots: SnapshotManager;
  private readonly history: RollbackHistoryEntry[] = [];

  constructor(options?: RollbackManagerOptions) {
    this.client = options?.client;
    this.snapshots = options?.snapshotManager ?? new SnapshotManager({ client: this.client });
  }

  public getSnapshotManager(): SnapshotManager {
    return this.snapshots;
  }

  public getHistory(): RollbackHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Restores a snapshot and updates rollback history.
   */
  public async restoreSnapshot(
    snapshotId: string,
    restoreHandler?: (snapshot: TransactionSnapshot) => Promise<void>,
  ): Promise<RollbackResult> {
    const snapshot = await this.snapshots.getSnapshot(snapshotId);
    if (!snapshot) {
      throw new RollbackError(
        ROLLBACK_ERROR_CODES.TARGET_NOT_FOUND,
        `Cannot restore snapshot: Snapshot "${snapshotId}" not found.`,
      );
    }

    // Verify cryptographic integrity
    const verification = await this.snapshots.verifySnapshot(snapshotId);
    if (!verification.valid) {
      throw new RollbackError(
        ROLLBACK_ERROR_CODES.ROLLBACK_FAILED,
        `Snapshot cryptographic verification failed for "${snapshotId}". State may be corrupted.`,
      );
    }

    try {
      if (restoreHandler) {
        await restoreHandler(snapshot);
      } else if (this.client?.isConnected()) {
        await this.client
          .getRestClient()
          .post(`/wp-json/craftor/v1/rollback/${snapshotId}`, {});
      }

      const result: RollbackResult = {
        success: true,
        snapshot_id: snapshotId,
        target_id: snapshot.target_id,
        target_type: snapshot.target_type,
        restored_at: new Date().toISOString(),
        action_context: snapshot.action_context,
      };

      this.history.unshift({
        rollback_id: `crf_rbk_${generateHexUuid(10)}`,
        snapshot_id: snapshotId,
        target_id: snapshot.target_id,
        target_type: snapshot.target_type,
        reason: 'Explicit restoration request',
        triggered_by: snapshot.created_by_token ?? 'system',
        timestamp: result.restored_at,
        success: true,
      });

      logger.info(`[RollbackEngine] Successfully restored snapshot ${snapshotId}`, {
        targetId: snapshot.target_id,
        targetType: snapshot.target_type,
      });

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.history.unshift({
        rollback_id: `crf_rbk_${generateHexUuid(10)}`,
        snapshot_id: snapshotId,
        target_id: snapshot.target_id,
        target_type: snapshot.target_type,
        reason: `Restoration failed: ${errorMsg}`,
        triggered_by: snapshot.created_by_token ?? 'system',
        timestamp: new Date().toISOString(),
        success: false,
      });

      throw new RollbackError(
        ROLLBACK_ERROR_CODES.ROLLBACK_FAILED,
        `Rollback failed for snapshot "${snapshotId}": ${errorMsg}`,
      );
    }
  }

  /**
   * Alias for restoreSnapshot.
   */
  public async rollbackMutation(
    snapshotId: string,
    restoreHandler?: (snapshot: TransactionSnapshot) => Promise<void>,
  ): Promise<RollbackResult> {
    return this.restoreSnapshot(snapshotId, restoreHandler);
  }

  /**
   * Executes a mutation inside an atomic snapshot rollback guard.
   * Immediately rolls back if:
   * 1. AST validation fails
   * 2. Mutation throws / fails
   * 3. Execution times out
   */
  public async executeWithRollbackGuard<T>(options: RollbackGuardOptions<T>): Promise<T> {
    const currentState = await options.getCurrentState();
    const snapshot = await this.snapshots.createSnapshot(
      options.targetId,
      options.targetType,
      currentState,
      options.token,
      options.actionContext,
    );

    const timeoutMs = options.timeoutMs ?? 30000;

    let timeoutHandle: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(
          new RollbackError(
            ROLLBACK_ERROR_CODES.ROLLBACK_FAILED,
            `Mutation timed out after ${timeoutMs}ms. Executing automatic rollback.`,
          ),
        );
      }, timeoutMs);
    });

    try {
      const mutationPromise = options.mutate();
      const result = await Promise.race([mutationPromise, timeoutPromise]);

      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      // Check AST validity if validator provided
      if (options.validateAst && !options.validateAst(result)) {
        logger.error(
          `[RollbackEngine] AST corruption guard triggered for target ${options.targetId}. Rolling back...`,
        );
        await options.restore(snapshot);
        throw new RollbackError(
          ROLLBACK_ERROR_CODES.AST_CORRUPTION_GUARD,
          `AST corruption guard failed: Invalid Elementor AST structure produced. Rolled back to snapshot ${snapshot.snapshot_id}.`,
        );
      }

      return result;
    } catch (error) {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      // If already a RollbackError that has restored, rethrow
      if (
        error instanceof RollbackError &&
        error.code === ROLLBACK_ERROR_CODES.AST_CORRUPTION_GUARD
      ) {
        throw error;
      }

      // Perform immediate rollback
      logger.warn(
        `[RollbackEngine] Mutation failure detected. Initiating immediate state recovery for ${options.targetId}...`,
      );

      try {
        await options.restore(snapshot);
        this.history.unshift({
          rollback_id: `crf_rbk_${generateHexUuid(10)}`,
          snapshot_id: snapshot.snapshot_id,
          target_id: snapshot.target_id,
          target_type: snapshot.target_type,
          reason: `Automatic rollback due to error: ${error instanceof Error ? error.message : String(error)}`,
          triggered_by: options.token ?? 'system',
          timestamp: new Date().toISOString(),
          success: true,
        });
      } catch (restoreErr) {
        throw new RollbackError(
          ROLLBACK_ERROR_CODES.ROLLBACK_FAILED,
          `Critical rollback failure: ${restoreErr instanceof Error ? restoreErr.message : String(restoreErr)}`,
        );
      }

      throw error;
    }
  }
}
