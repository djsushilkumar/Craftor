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

  console.log('[Contract Test 8A] Validating WordPress Bridge Foundation...');
  const {
    WordPressClient,
    WordPressRestClient,
    createAuthHeader,
    maskAuthCredentials,
    WordPressAuthError,
    WordPressRestError,
  } = await import('../../../packages/wordpress-bridge/dist/index.js');

  // 8A.1 Authentication Strategies
  const appPassHeader = createAuthHeader({
    type: 'application_password',
    username: 'admin',
    applicationPassword: 'abcd 1234 efgh 5678',
  });
  if (appPassHeader !== `Basic ${Buffer.from('admin:abcd1234efgh5678').toString('base64')}`) {
    throw new Error('Application Password auth header generation failed');
  }

  const bearerHeader = createAuthHeader({
    type: 'bearer',
    token: 'crf_bearer_token_xyz',
  });
  if (bearerHeader !== 'Bearer crf_bearer_token_xyz') {
    throw new Error('Bearer auth header generation failed');
  }

  const jwtHeader = createAuthHeader({
    type: 'jwt',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDNxdgqWjgZEP_3vWDIsBp6FsOytbqbnmgEA3Qrys',
  });
  if (!jwtHeader.startsWith('Bearer eyJ')) {
    throw new Error('JWT auth header generation failed');
  }

  try {
    createAuthHeader({ type: 'application_password', username: '', applicationPassword: '' });
    throw new Error('Should have thrown on empty application password');
  } catch (err) {
    if (!(err instanceof WordPressAuthError)) {
      throw new Error('Expected WordPressAuthError on invalid auth credentials');
    }
  }

  const masked = maskAuthCredentials({
    type: 'application_password',
    username: 'craftor_admin',
    applicationPassword: 'supersecretpassword123',
  });
  if (!masked.includes('craftor_admin') || masked.includes('supersecretpassword123')) {
    throw new Error('Auth masking failed to protect password');
  }

  // 8A.2 REST Client URL Builder
  const restClient = new WordPressRestClient({
    baseUrl: 'https://example.craftor.local///',
    timeoutMs: 5000,
  });
  const builtUrl = restClient.buildUrl('/wp-json/wp/v2/pages', {
    page: 1,
    per_page: 10,
    search: 'landing',
  });
  if (!builtUrl.includes('https://example.craftor.local/wp-json/wp/v2/pages?page=1&per_page=10&search=landing')) {
    throw new Error(`REST Client URL building failed: ${builtUrl}`);
  }

  // 8A.3 Mock Fetch for Client Methods & Response Parsing
  let fetchCallCount = 0;
  const mockFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    fetchCallCount++;
    const urlStr = String(input);
    const method = init?.method ?? 'GET';

    if (urlStr.endsWith('/wp-json')) {
      return new Response(
        JSON.stringify({
          name: 'Craftor Production Test Site',
          description: 'Autonomous WordPress & Elementor Testing Sandbox',
          url: 'https://example.craftor.local',
          home: 'https://example.craftor.local',
          namespaces: ['wp/v2', 'elementor/v1', 'wc/v3'],
          timezone_string: 'America/New_York',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (urlStr.includes('/wp-json/wp/v2/pages') && method === 'POST') {
      const body = JSON.parse(String(init?.body ?? '{}'));
      return new Response(
        JSON.stringify({
          id: 42,
          date: new Date().toISOString(),
          slug: body.slug ?? 'test-page',
          status: body.status ?? 'draft',
          type: 'page',
          link: `https://example.craftor.local/${body.slug ?? 'test-page'}`,
          title: { rendered: body.title },
          content: { rendered: body.content ?? '' },
          meta: body.meta ?? {},
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (urlStr.includes('/wp-json/wp/v2/pages/42') && method === 'GET') {
      return new Response(
        JSON.stringify({
          id: 42,
          date: new Date().toISOString(),
          slug: 'test-page',
          status: 'publish',
          type: 'page',
          link: 'https://example.craftor.local/test-page',
          title: { rendered: 'Craftor AI Hero Landing' },
          content: { rendered: '<div class="elementor-section"></div>' },
          meta: { _elementor_edit_mode: 'builder' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (urlStr.includes('/wp-json/wp/v2/posts')) {
      return new Response(
        JSON.stringify([
          {
            id: 1,
            date: new Date().toISOString(),
            slug: 'hello-world',
            status: 'publish',
            type: 'post',
            link: 'https://example.craftor.local/hello-world',
            title: { rendered: 'Hello Craftor World' },
            content: { rendered: '<p>Welcome to Craftor.</p>' },
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (urlStr.includes('/wp-json/wp/v2/plugins')) {
      return new Response(
        JSON.stringify([
          {
            plugin: 'elementor/elementor.php',
            status: 'active',
            name: 'Elementor Pro',
            version: '3.24.0',
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (urlStr.includes('/wp-json/wp/v2/themes')) {
      return new Response(
        JSON.stringify([
          {
            theme: 'hello-elementor',
            name: 'Hello Elementor',
            status: 'active',
            version: '3.1.0',
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ code: 'not_found', message: 'Resource not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const wpClient = new WordPressClient({
    siteUrl: 'https://example.craftor.local',
    auth: {
      type: 'application_password',
      username: 'craftor_agent',
      applicationPassword: 'app_pass_secret_123',
    },
    customFetch: mockFetch,
    timeoutMs: 3000,
  });

  if (wpClient.isConnected()) {
    throw new Error('Client should not be connected before connect() call');
  }

  // 8A.4 connect() & getSite()
  const site = await wpClient.connect();
  if (
    !wpClient.isConnected() ||
    site.name !== 'Craftor Production Test Site' ||
    !site.elementorActive ||
    !site.woocommerceActive
  ) {
    throw new Error('WordPressClient connect() site discovery verification failed');
  }

  // 8A.5 getPosts() & getPost()
  const posts = await wpClient.getPosts({ per_page: 5 });
  if (
    !Array.isArray(posts) ||
    posts.length !== 1 ||
    !posts[0] ||
    posts[0].title.rendered !== 'Hello Craftor World'
  ) {
    throw new Error('WordPressClient getPosts() verification failed');
  }

  // 8A.6 createPage() with Elementor AST metadata
  const newPage = await wpClient.createPage({
    title: 'Craftor AI Hero Landing',
    slug: 'ai-landing',
    status: 'publish',
    elementor_data: [{ id: 'abc1234', elType: 'container', settings: {} }],
  });
  if (
    newPage.id !== 42 ||
    !newPage.meta?._elementor_data ||
    newPage.meta._elementor_edit_mode !== 'builder'
  ) {
    throw new Error('WordPressClient createPage() with Elementor meta verification failed');
  }

  // 8A.7 getPage()
  const fetchedPage = await wpClient.getPage(42);
  if (fetchedPage.id !== 42 || fetchedPage.title.rendered !== 'Craftor AI Hero Landing') {
    throw new Error('WordPressClient getPage(42) verification failed');
  }

  // 8A.8 getPlugins() & getThemes()
  const plugins = await wpClient.getPlugins();
  if (plugins.length !== 1 || !plugins[0] || plugins[0].name !== 'Elementor Pro') {
    throw new Error('WordPressClient getPlugins() verification failed');
  }

  const themes = await wpClient.getThemes();
  if (themes.length !== 1 || !themes[0] || themes[0].name !== 'Hello Elementor') {
    throw new Error('WordPressClient getThemes() verification failed');
  }

  // 8A.9 Error Handling on 404
  try {
    await wpClient.getPage(999);
    throw new Error('Expected 404 WordPressRestError for non-existent page');
  } catch (err) {
    if (!(err instanceof WordPressRestError) || err.status !== 404) {
      throw new Error('Expected WordPressRestError with status 404');
    }
  }

  // 8A.10 disconnect()
  await wpClient.disconnect();
  if (wpClient.isConnected()) {
    throw new Error('Client should not be connected after disconnect()');
  }

  if (fetchCallCount < 5) {
    throw new Error(`Expected multiple fetch calls, but only recorded: ${fetchCallCount}`);
  }

  console.log('[Contract Test] All contract assertions PASSED ✅');
}

runContractTests().catch((err) => {
  console.error('[Contract Test Failure]', err);
  process.exit(1);
});
