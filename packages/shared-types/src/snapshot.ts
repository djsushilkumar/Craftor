export type SnapshotTargetType =
  'post' | 'postmeta' | 'option' | 'elementor_data' | 'woocommerce_product';

export interface TransactionSnapshot {
  snapshot_id: string;
  target_id: number | string;
  target_type: SnapshotTargetType;
  action_context: string;
  pre_state_hash: string;
  data_payload: string;
  created_at: string;
  created_by?: string;
}

export interface SnapshotRecord {
  id: string;
  uuid: string;
  postId: number;
  actionContext: string;
  payloadChecksum: string;
  createdAt: string;
}
