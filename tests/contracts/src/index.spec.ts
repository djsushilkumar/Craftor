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

  console.log('[Contract Test] All contract assertions PASSED ✅');
}

runContractTests().catch((err) => {
  console.error('[Contract Test Failure]', err);
  process.exit(1);
});
