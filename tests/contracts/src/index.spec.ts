import {
  JSON_RPC_2_0_SCHEMA,
  TOOL_REGISTRY_ENTRY_SCHEMA,
  INITIALIZE_REQUEST_SCHEMA,
  PING_REQUEST_SCHEMA,
  TOOLS_LIST_REQUEST_SCHEMA,
  TOOLS_CALL_REQUEST_SCHEMA,
  RESOURCES_LIST_REQUEST_SCHEMA,
  RESOURCES_READ_REQUEST_SCHEMA,
  PROMPTS_LIST_REQUEST_SCHEMA,
  PROMPTS_GET_REQUEST_SCHEMA,
  SHUTDOWN_REQUEST_SCHEMA,
} from '../../../packages/schemas/dist/index.js';
import {
  computeSha256,
  encryptAes256,
  decryptAes256,
  constantTimeCompare,
  hashToken,
  generateHexUuid,
  withRetry,
} from '../../../packages/shared-utils/dist/index.js';
import {
  ElementorAstEngine,
  validateAst,
  createFlexContainer,
  createGridContainer,
  createWidgetNode,
  insertNode,
  removeNode,
  updateNodeSettings,
  findNodeById,
} from '../../../packages/elementor-ast/dist/index.js';

async function runContractTests(): Promise<void> {
  console.log('[Contract Test 1] Validating JSON-RPC 2.0 Schema contract...');
  if (!JSON_RPC_2_0_SCHEMA.required.includes('jsonrpc')) {
    throw new Error('JSON-RPC Schema Contract Broken!');
  }

  console.log('[Contract Test 2] Validating Tool Registry Schema contract...');
  if (!TOOL_REGISTRY_ENTRY_SCHEMA.required.includes('permissions')) {
    throw new Error('Tool Registry Schema Contract Broken!');
  }

  console.log('[Contract Test 3] Validating all 9 MCP Method Schemas...');
  const mcpSchemas = [
    INITIALIZE_REQUEST_SCHEMA,
    PING_REQUEST_SCHEMA,
    TOOLS_LIST_REQUEST_SCHEMA,
    TOOLS_CALL_REQUEST_SCHEMA,
    RESOURCES_LIST_REQUEST_SCHEMA,
    RESOURCES_READ_REQUEST_SCHEMA,
    PROMPTS_LIST_REQUEST_SCHEMA,
    PROMPTS_GET_REQUEST_SCHEMA,
    SHUTDOWN_REQUEST_SCHEMA,
  ];

  for (const schema of mcpSchemas) {
    if (schema.additionalProperties !== false) {
      throw new Error(`Schema ${schema.title} must have additionalProperties: false`);
    }
    if (!schema.required.includes('jsonrpc') || !schema.required.includes('method')) {
      throw new Error(`Schema ${schema.title} missing required jsonrpc/method fields`);
    }
  }

  console.log('[Contract Test 4] Validating Crypto Utilities (SHA-256, AES-256-GCM, Timing)...');
  const secretKey = 'craftor-super-secret-key-32b-ok!';
  const plaintext = 'Universal-MCP-Payload-2026';
  const encrypted = encryptAes256(plaintext, secretKey);
  const decrypted = decryptAes256(encrypted, secretKey);

  if (decrypted !== plaintext) {
    throw new Error(`AES-256 roundtrip failed: expected "${plaintext}", got "${decrypted}"`);
  }

  const decryptedFromCiphertext = decryptAes256(encrypted.ciphertext, secretKey);
  if (decryptedFromCiphertext !== plaintext) {
    throw new Error('AES-256 deserialized ciphertext decryption failed');
  }

  const hash1 = computeSha256('test-token');
  const hash2 = hashToken('test-token');
  if (hash1 !== hash2) {
    throw new Error('hashToken output does not match computeSha256');
  }

  if (!constantTimeCompare('secret_token_123', 'secret_token_123')) {
    throw new Error('constantTimeCompare positive match failed');
  }
  if (constantTimeCompare('secret_token_123', 'secret_token_456')) {
    throw new Error('constantTimeCompare negative match failed');
  }

  const hexId = generateHexUuid(7);
  if (hexId.length !== 7 || !/^[0-9a-f]{7}$/.test(hexId)) {
    throw new Error(`generateHexUuid produced invalid 7-char ID: ${hexId}`);
  }

  console.log('[Contract Test 5] Validating Retry Utility...');
  let retryCount = 0;
  const retryResult = await withRetry(
    async () => {
      retryCount++;
      if (retryCount < 3) {
        throw new Error('Temporary transient failure');
      }
      return 'success_after_retries';
    },
    { maxRetries: 3, baseDelayMs: 10, maxDelayMs: 50, jitter: false },
  );

  if (retryResult !== 'success_after_retries' || retryCount !== 3) {
    throw new Error(`withRetry failed. Result: ${retryResult}, Attempts: ${retryCount}`);
  }

  console.log('[Contract Test 6] Validating Elementor AST Engine & Immutable Mutations...');
  const flexContainer = createFlexContainer({
    flexDirection: 'row',
    justifyContent: 'center',
  });
  const widgetHeading = createWidgetNode('heading', {
    title: 'Hello Craftor',
  });
  const gridContainer = createGridContainer({
    columns: 3,
    rows: 2,
  });

  let ast = [flexContainer, gridContainer];
  const initialValidation = validateAst(ast);
  if (!initialValidation.valid) {
    throw new Error(`Initial AST validation failed: ${initialValidation.errors.join(', ')}`);
  }

  ast = insertNode(ast, flexContainer.id, widgetHeading);
  const foundNode = findNodeById(ast, widgetHeading.id);
  if (!foundNode || foundNode.widgetType !== 'heading') {
    throw new Error('Inserted widget node not found in AST');
  }

  ast = updateNodeSettings(ast, widgetHeading.id, { title: 'Updated Title' });
  const updatedNode = findNodeById(ast, widgetHeading.id);
  if (!updatedNode || updatedNode.settings['title'] !== 'Updated Title') {
    throw new Error('Widget settings update failed');
  }

  ast = removeNode(ast, widgetHeading.id);
  const removedNode = findNodeById(ast, widgetHeading.id);
  if (removedNode !== null) {
    throw new Error('Removed node still found in AST');
  }

  const serialized = ElementorAstEngine.serialize(ast);
  const parsed = ElementorAstEngine.deserialize(serialized);
  if (parsed.length !== 2) {
    throw new Error('AST serialization roundtrip failed');
  }

  console.log('[Contract Test 7] Validating Real Craftor MCP Daemon & All 9 MCP Methods...');
  const { McpRouter } = await import('../../../packages/mcp-server/dist/index.js');
  const router = new McpRouter({
    siteUrl: 'https://example.craftor.local',
    secretToken: 'crf_sec_test_secret_token_12345678',
  });

  // 1. initialize
  const initRes = await router.dispatch({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'Cursor', version: '0.40.0' },
    },
  });
  const initResult = initRes.result as {
    protocolVersion: string;
    capabilities: Record<string, unknown>;
  };
  if (
    initRes.jsonrpc !== '2.0' ||
    initRes.id !== 1 ||
    initResult.protocolVersion !== '2024-11-05'
  ) {
    throw new Error('MCP initialize method contract failed');
  }

  // 2. ping
  const pingRes = await router.dispatch({ jsonrpc: '2.0', id: 2, method: 'ping' });
  if (pingRes.jsonrpc !== '2.0' || pingRes.id !== 2 || typeof pingRes.result !== 'object') {
    throw new Error('MCP ping method contract failed');
  }

  // 3. tools/list
  const toolsListRes = await router.dispatch({ jsonrpc: '2.0', id: 3, method: 'tools/list' });
  const toolsListResult = toolsListRes.result as { tools: Array<{ name: string }> };
  if (!Array.isArray(toolsListResult.tools) || toolsListResult.tools.length < 6) {
    throw new Error('MCP tools/list method contract failed');
  }

  // 4. tools/call (craftor_elementor_create_container)
  const toolCallRes = await router.dispatch({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'craftor_elementor_create_container',
      arguments: { containerType: 'flex', direction: 'row' },
    },
  });
  const toolCallResult = toolCallRes.result as { content?: Array<{ type: string; text: string }> };
  if (
    !toolCallResult?.content ||
    !toolCallResult.content[0] ||
    toolCallResult.content[0].type !== 'text'
  ) {
    throw new Error('MCP tools/call method contract failed');
  }

  // 5. resources/list
  const resListRes = await router.dispatch({ jsonrpc: '2.0', id: 5, method: 'resources/list' });
  const resListResult = resListRes.result as { resources?: Array<{ uri: string }> };
  if (!Array.isArray(resListResult?.resources) || resListResult.resources.length < 4) {
    throw new Error('MCP resources/list method contract failed');
  }

  // 6. resources/read
  const resReadRes = await router.dispatch({
    jsonrpc: '2.0',
    id: 6,
    method: 'resources/read',
    params: { uri: 'craftor://tokens/design' },
  });
  const resReadResult = resReadRes.result as { contents?: Array<{ uri: string; text: string }> };
  if (
    !resReadResult?.contents ||
    !resReadResult.contents[0] ||
    resReadResult.contents[0].uri !== 'craftor://tokens/design'
  ) {
    throw new Error('MCP resources/read method contract failed');
  }

  // 7. prompts/list
  const promptsListRes = await router.dispatch({ jsonrpc: '2.0', id: 7, method: 'prompts/list' });
  const promptsListResult = promptsListRes.result as { prompts?: Array<{ name: string }> };
  if (!Array.isArray(promptsListResult?.prompts) || promptsListResult.prompts.length < 4) {
    throw new Error('MCP prompts/list method contract failed');
  }

  // 8. prompts/get
  const promptsGetRes = await router.dispatch({
    jsonrpc: '2.0',
    id: 8,
    method: 'prompts/get',
    params: { name: 'generate_landing_page', arguments: { topic: 'AI Design Agency' } },
  });
  const promptsGetResult = promptsGetRes.result as { messages?: Array<{ role: string }> };
  if (
    !promptsGetResult?.messages ||
    !promptsGetResult.messages[0] ||
    promptsGetResult.messages[0].role !== 'user'
  ) {
    throw new Error('MCP prompts/get method contract failed');
  }

  // 9. Method not found error test
  const notFoundRes = await router.dispatch({
    jsonrpc: '2.0',
    id: 9,
    method: 'non_existent_method',
  });
  if (!notFoundRes.error || notFoundRes.error.code !== -32601) {
    throw new Error('MCP method not found (-32601) error contract failed');
  }

  // 10. shutdown
  const shutdownRes = await router.dispatch({ jsonrpc: '2.0', id: 10, method: 'shutdown' });
  const shutdownResult = shutdownRes.result as { success: boolean };
  if (!shutdownResult.success) {
    throw new Error('MCP shutdown method contract failed');
  }

  console.log('[Contract Test] All contract assertions PASSED ✅');
}

runContractTests().catch((err) => {
  console.error('[Contract Test Failure]', err);
  process.exit(1);
});
