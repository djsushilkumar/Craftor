/**
 * Playwright E2E Test Suite Orchestrator & Runner
 * Executes all 4 E2E test suites in sequence and emits execution metrics.
 */

import { runMcpHandshakeE2e } from './mcp-handshake.spec.js';
import { runElementorCanvasE2e } from './elementor-canvas-flow.spec.js';
import { runRollbackFlowE2e } from './rollback-flow.spec.js';
import { runWooCommerceFlowE2e } from './woocommerce-flow.spec.js';

async function main() {
  console.log('================================================================');
  console.log('       CRAFTOR PLAYWRIGHT E2E AUTOMATED TEST RUNNER              ');
  console.log('================================================================\n');

  const startTime = Date.now();
  const results = [];

  try {
    results.push(await runMcpHandshakeE2e());
    results.push(await runElementorCanvasE2e());
    results.push(await runRollbackFlowE2e());
    results.push(await runWooCommerceFlowE2e());

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalAssertions = results.reduce((sum, r) => sum + r.assertions, 0);

    console.log('\n================================================================');
    console.log(`E2E TEST SUMMARY: ${results.length} Suites Passed | 0 Failed (${totalAssertions} Assertions in ${totalDuration}s)`);
    console.log('================================================================\n');

    for (const r of results) {
      console.log(`  ✅ [PASS] ${r.name.padEnd(30)} ${r.assertions} assertions verified`);
    }

    console.log('\n🚀 ALL PLAYWRIGHT E2E TEST SUITES PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ [E2E TEST FAILURE]', err);
    process.exit(1);
  }
}

main();
