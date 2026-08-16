import { JSON_RPC_2_0_SCHEMA, TOOL_REGISTRY_ENTRY_SCHEMA } from '../../../packages/schemas/dist/index';

console.log('[Contract Test] Validating JSON-RPC 2.0 Schema contract...');
if (!JSON_RPC_2_0_SCHEMA.required.includes('jsonrpc')) {
  throw new Error('JSON-RPC Schema Contract Broken!');
}

console.log('[Contract Test] Validating Tool Registry Schema contract...');
if (!TOOL_REGISTRY_ENTRY_SCHEMA.required.includes('permissions')) {
  throw new Error('Tool Registry Schema Contract Broken!');
}

console.log('[Contract Test] All contract assertions PASSED ✅');
