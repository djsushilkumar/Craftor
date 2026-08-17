/**
 * Craftor Snapshot Engine (Client Bridge)
 * Captures pre-mutation states, computes cryptographically secure SHA-256 hashes,
 * and maintains atomic rollback snapshot history.
 */

import {
  TransactionSnapshot,
  SnapshotTargetType,
  SnapshotVerificationResult,
} from '../../shared-types/dist/index.js';
import { computeSha256, generateHexUuid, logger } from '../../shared-utils/dist/index.js';
import { WordPressClient } from './client.js';

export interface SnapshotManagerOptions {
  client?: WordPressClient;
}

export class SnapshotManager {
  private readonly client?: WordPressClient;
  private readonly inMemoryStore: Map<string, TransactionSnapshot> = new Map();

  constructor(options?: SnapshotManagerOptions) {
    this.client = options?.client;
  }

  /**
   * Captures a snapshot before any mutation occurs.
   */
  public async createSnapshot(
    targetId: number | string,
    targetType: SnapshotTargetType,
    dataPayload: unknown,
    createdByToken?: string,
    actionContext?: string,
  ): Promise<TransactionSnapshot> {
    const rawPayloadString =
      typeof dataPayload === 'string' ? dataPayload : JSON.stringify(dataPayload ?? {});
    const preStateHash = computeSha256(rawPayloadString);
    const snapshotId = `crf_snp_${generateHexUuid(12)}`;
    const createdAt = new Date().toISOString();

    const snapshot: TransactionSnapshot = {
      snapshot_id: snapshotId,
      target_id: targetId,
      target_type: targetType,
      pre_state_hash: preStateHash,
      data_payload: rawPayloadString,
      created_at: createdAt,
      created_by_token: createdByToken,
      action_context: actionContext,
    };

    this.inMemoryStore.set(snapshotId, snapshot);

    logger.debug(`[SnapshotEngine] Created snapshot ${snapshotId}`, {
      targetId,
      targetType,
      preStateHash,
      actionContext,
    });

    // Optionally persist to WordPress backend if client is connected
    if (this.client?.isConnected()) {
      try {
        await this.client.getRestClient().post('/wp-json/craftor/v1/snapshots', snapshot);
      } catch {
        // Fall back to in-memory store if server endpoint not yet ready
      }
    }

    return snapshot;
  }

  /**
   * Retrieves a snapshot by ID.
   */
  public async getSnapshot(snapshotId: string): Promise<TransactionSnapshot | null> {
    if (this.inMemoryStore.has(snapshotId)) {
      return this.inMemoryStore.get(snapshotId) ?? null;
    }

    if (this.client?.isConnected()) {
      try {
        const remote = await this.client
          .getRestClient()
          .get<TransactionSnapshot>(`/wp-json/craftor/v1/snapshots/${snapshotId}`);
        if (remote && remote.snapshot_id) {
          this.inMemoryStore.set(remote.snapshot_id, remote);
          return remote;
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * Verifies the cryptographic integrity of a stored snapshot.
   */
  public async verifySnapshot(snapshotId: string): Promise<SnapshotVerificationResult> {
    const snapshot = await this.getSnapshot(snapshotId);
    if (!snapshot) {
      return {
        valid: false,
        snapshot_id: snapshotId,
        expected_hash: '',
        computed_hash: '',
        matched: false,
      };
    }

    const computedHash = computeSha256(snapshot.data_payload);
    const matched = computedHash === snapshot.pre_state_hash;

    return {
      valid: matched,
      snapshot_id: snapshotId,
      expected_hash: snapshot.pre_state_hash,
      computed_hash: computedHash,
      matched,
    };
  }

  /**
   * Deletes a snapshot by ID.
   */
  public async deleteSnapshot(snapshotId: string): Promise<boolean> {
    const existed = this.inMemoryStore.delete(snapshotId);

    if (this.client?.isConnected()) {
      try {
        await this.client
          .getRestClient()
          .delete(`/wp-json/craftor/v1/snapshots/${snapshotId}`);
      } catch {
        // Continue
      }
    }

    return existed;
  }

  /**
   * Lists all snapshots for a given target.
   */
  public async listSnapshots(
    targetId?: number | string,
    targetType?: SnapshotTargetType,
  ): Promise<TransactionSnapshot[]> {
    const all = Array.from(this.inMemoryStore.values());
    return all.filter((s) => {
      if (targetId !== undefined && s.target_id.toString() !== targetId.toString()) {
        return false;
      }
      if (targetType !== undefined && s.target_type !== targetType) {
        return false;
      }
      return true;
    });
  }
}
