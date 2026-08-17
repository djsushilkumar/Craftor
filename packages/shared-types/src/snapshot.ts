/**
 * Craftor Snapshot & Transaction Layer Shared Types
 */

export type SnapshotTargetType =
  | 'post'
  | 'postmeta'
  | 'option'
  | 'elementor_data'
  | 'woocommerce_product'
  | 'woocommerce_order'
  | 'woocommerce_category'
  | 'theme_mod'
  | 'site_setting';

export interface TransactionSnapshot {
  snapshot_id: string;
  target_id: number | string;
  target_type: SnapshotTargetType;
  pre_state_hash: string;
  data_payload: string;
  created_at: string;
  created_by_token?: string;
  action_context?: string;
}

export interface SnapshotRecord {
  id: string;
  uuid: string;
  postId: number;
  actionContext: string;
  payloadChecksum: string;
  createdAt: string;
}

export interface SnapshotVerificationResult {
  valid: boolean;
  snapshot_id: string;
  expected_hash: string;
  computed_hash: string;
  matched: boolean;
}

export interface RollbackResult {
  success: boolean;
  snapshot_id: string;
  target_id: number | string;
  target_type: SnapshotTargetType;
  restored_at: string;
  action_context?: string;
  error?: string;
}

export interface RollbackHistoryEntry {
  rollback_id: string;
  snapshot_id: string;
  target_id: number | string;
  target_type: SnapshotTargetType;
  reason: string;
  triggered_by: string;
  timestamp: string;
  success: boolean;
}
