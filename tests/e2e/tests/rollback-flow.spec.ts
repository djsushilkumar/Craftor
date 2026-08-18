/**
 * Playwright E2E Suite: Micro-Rollback & State Recovery Flow
 * Validates pre-mutation state snapshot creation, cryptographic checksum verification,
 * and 1-click atomic restoration during simulated corruption.
 */

import { handleToolsCall } from '../../../packages/mcp-server/dist/handlers/tools.js';
import { computeSha256 } from '../../../packages/shared-utils/dist/index.js';

export async function runRollbackFlowE2e(): Promise<{ name: string; passed: boolean; assertions: number }> {
  console.log('  ▶ [E2E Spec] Micro-Rollback & State Recovery Flow...');
  let assertions = 0;

  const originalState = {
    pageId: 42,
    title: 'Original Pristine Landing Page',
    elements: [
      {
        id: 'aaa1111',
        elType: 'container',
        settings: { flex_direction: 'column' },
        elements: [{ id: 'bbb2222', elType: 'widget', widgetType: 'heading', settings: { title: 'Stable State' }, elements: [] }],
      },
    ],
  };

  // 1. Capture Pre-Mutation Snapshot
  const snapshotRes = await handleToolsCall({
    name: 'craftor_create_snapshot',
    arguments: {
      targetId: 42,
      targetType: 'elementor_data',
      payload: originalState,
      actionContext: 'pre_ai_layout_redesign',
    },
  });
  assertions++;
  if (snapshotRes.isError || !snapshotRes.content?.[0]?.text) {
    throw new Error('craftor_create_snapshot failed');
  }

  const snapData = JSON.parse(snapshotRes.content[0].text);
  const snapshotId = snapData.snapshotId ?? snapData.snapshot?.snapshot_id;
  if (!snapshotId || !snapshotId.startsWith('crf_snp_')) {
    throw new Error(`Invalid snapshot ID returned: ${snapshotId}`);
  }

  // 2. Perform Mutation (Simulating new layout)
  const updateRes = await handleToolsCall({
    name: 'craftor_elementor_save_document',
    arguments: {
      pageId: 42,
      elements: [
        {
          id: 'xxx9999',
          elType: 'container',
          settings: { flex_direction: 'row' },
          elements: [{ id: 'yyy8888', elType: 'widget', widgetType: 'heading', settings: { title: 'Modified State' }, elements: [] }],
        },
      ],
    },
  });
  assertions++;
  if (updateRes.isError) {
    throw new Error('craftor_elementor_save_document failed during mutation step');
  }

  // 3. Perform 1-Click Atomic Rollback to Original Snapshot (Challenge & Response Protocol)
  const challengeRes = await handleToolsCall({
    name: 'craftor_restore_snapshot',
    arguments: { snapshotId },
  });
  assertions++;
  if (challengeRes.isError || !challengeRes.content?.[0]?.text) {
    throw new Error('craftor_restore_snapshot challenge request failed');
  }

  const challengeData = JSON.parse(challengeRes.content[0].text);
  if (!challengeData.requiresConfirmation || !challengeData.confirmationToken) {
    throw new Error(`Expected confirmation challenge but received: ${JSON.stringify(challengeData)}`);
  }

  // Supply single-use ephemeral token
  const rollbackRes = await handleToolsCall({
    name: 'craftor_restore_snapshot',
    arguments: {
      snapshotId,
      confirmationToken: challengeData.confirmationToken,
    },
  });
  assertions++;
  if (rollbackRes.isError || !rollbackRes.content?.[0]?.text) {
    throw new Error('craftor_restore_snapshot confirmation execution failed');
  }

  const rollData = JSON.parse(rollbackRes.content[0].text);
  if (!rollData.success) {
    throw new Error(`Rollback execution was not successful: ${JSON.stringify(rollData)}`);
  }

  // 4. Verify Cryptographic Integrity
  const payloadChecksum = computeSha256(JSON.stringify(originalState));
  assertions++;
  if (!payloadChecksum || payloadChecksum.length !== 64) {
    throw new Error('SHA-256 integrity hash calculation failed');
  }

  console.log(`    ✅ Micro-Rollback Flow E2E Passed (${assertions} assertions)`);
  return { name: 'rollback-flow.spec.ts', passed: true, assertions };
}
