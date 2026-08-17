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

  console.log('[Contract Test 8B] Validating WordPress Authentication & Security Layer...');
  const {
    verifyApplicationPassword,
    verifyBearerToken,
    createJwt,
    verifyJwt,
    createWordPressNonce,
    verifyWordPressNonce,
    AUTH_ERROR_CODES,
    WordPressSecurityError,
    TokenManager,
    currentUserCan,
    assertCapability,
    grantCapability,
    SessionManager,
  } = await import('../../../services/authentication/dist/index.js');

  // 8B.1 Application Password Verification
  const appPassValid = verifyApplicationPassword(
    'admin_user',
    'abcd 1234 efgh 5678',
    'admin_user',
    'abcd1234efgh5678',
  );
  if (!appPassValid) {
    throw new Error('Application Password verification failed');
  }

  try {
    verifyApplicationPassword('admin_user', 'wrong_pass', 'admin_user', 'abcd1234efgh5678');
    throw new Error('Should have rejected wrong password');
  } catch (err) {
    if (!(err instanceof WordPressSecurityError) || err.code !== AUTH_ERROR_CODES.UNAUTHORIZED) {
      throw new Error(`Expected UNAUTHORIZED (-32001) for wrong password, got: ${err}`);
    }
  }

  // 8B.2 Bearer Token Verification
  const bearerValid = verifyBearerToken('Bearer crf_live_secret_token_123', 'crf_live_secret_token_123');
  if (!bearerValid) {
    throw new Error('Bearer token verification failed');
  }

  try {
    verifyBearerToken('Bearer invalid_token', 'crf_live_secret_token_123');
    throw new Error('Should have rejected invalid bearer token');
  } catch (err) {
    if (!(err instanceof WordPressSecurityError) || err.code !== AUTH_ERROR_CODES.INVALID_TOKEN) {
      throw new Error(`Expected INVALID_TOKEN (-32003), got: ${err}`);
    }
  }

  // 8B.3 JWT Authentication & Expiry
  const jwtSecret = 'craftor-jwt-hmac-secret-key-32chars!';
  const validJwt = createJwt({ sub: 'user_42', role: 'administrator' }, jwtSecret, 3600);
  const decodedJwt = verifyJwt(validJwt, jwtSecret);
  if (decodedJwt.sub !== 'user_42' || decodedJwt.role !== 'administrator') {
    throw new Error('JWT payload verification failed');
  }

  // JWT with expired timestamp
  const expiredJwt = createJwt({ sub: 'user_42', role: 'administrator' }, jwtSecret, -100);
  try {
    verifyJwt(expiredJwt, jwtSecret);
    throw new Error('Should have rejected expired JWT');
  } catch (err) {
    if (!(err instanceof WordPressSecurityError) || err.code !== AUTH_ERROR_CODES.EXPIRED_SESSION) {
      throw new Error(`Expected EXPIRED_SESSION (-32004) for expired JWT, got: ${err}`);
    }
  }

  // JWT with invalid signature
  try {
    verifyJwt(validJwt, 'wrong-secret-key-for-testing!');
    throw new Error('Should have rejected JWT with wrong secret');
  } catch (err) {
    if (!(err instanceof WordPressSecurityError) || err.code !== AUTH_ERROR_CODES.INVALID_TOKEN) {
      throw new Error(`Expected INVALID_TOKEN (-32003) for bad signature, got: ${err}`);
    }
  }

  // 8B.4 WordPress Nonce Creation and Constant-Time Validation
  const nonceSecret = 'wp_auth_salt_xyz987';
  const nowMs = Date.now();
  const nonce = createWordPressNonce('craftor_save_layout', 'user_10', nonceSecret, nowMs);
  const nonceResult = verifyWordPressNonce(nonce, 'craftor_save_layout', 'user_10', nonceSecret, nowMs);
  if (nonceResult !== 1) {
    throw new Error('WordPress Nonce validation in current window failed');
  }

  try {
    verifyWordPressNonce('invalid_nonce', 'craftor_save_layout', 'user_10', nonceSecret, nowMs);
    throw new Error('Should have rejected invalid nonce');
  } catch (err) {
    if (!(err instanceof WordPressSecurityError) || err.code !== AUTH_ERROR_CODES.NONCE_VALIDATION_FAILED) {
      throw new Error(`Expected NONCE_VALIDATION_FAILED (-32005), got: ${err}`);
    }
  }

  // 8B.5 TokenManager Lifecycle, Vault Encryption & Rotation
  const tokenManager = new TokenManager({ defaultTtlMs: 3600000 });
  const { rawToken, managedToken } = tokenManager.generateToken('agent_architect', 'administrator');
  const validatedToken = tokenManager.validateToken(rawToken);
  if (validatedToken.id !== managedToken.id || validatedToken.userId !== 'agent_architect') {
    throw new Error('TokenManager validateToken failed');
  }

  // Token AES-256-GCM Vault Encryption & Decryption
  const tokenVaultKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const encryptedToken = tokenManager.encryptSecret(rawToken, tokenVaultKey);
  const decryptedToken = tokenManager.decryptSecret(encryptedToken, tokenVaultKey);
  if (decryptedToken !== rawToken) {
    throw new Error('Token AES-256-GCM vault encryption/decryption roundtrip failed');
  }

  // Token Rotation
  const rotated = tokenManager.rotateToken(rawToken);
  if (rotated.rawToken === rawToken) {
    throw new Error('Rotated token must generate a new unique secret');
  }
  try {
    tokenManager.validateToken(rawToken);
    throw new Error('Old rotated token must be revoked');
  } catch (err) {
    if (!(err instanceof WordPressSecurityError) || err.code !== AUTH_ERROR_CODES.INVALID_TOKEN) {
      throw new Error(`Expected revoked token error (-32003), got: ${err}`);
    }
  }

  // 8B.6 Capability Validation & RBAC
  const adminUser = { id: 1, username: 'admin', role: 'administrator' as const };
  const authorUser = { id: 2, username: 'author_john', role: 'author' as const };
  const subscriberUser = { id: 3, username: 'sub_jane', role: 'subscriber' as const };

  if (!currentUserCan(adminUser, 'manage_options') || !currentUserCan(adminUser, 'activate_plugins')) {
    throw new Error('Admin capability check failed');
  }
  if (
    !currentUserCan(authorUser, 'edit_posts') ||
    currentUserCan(authorUser, 'edit_pages') ||
    currentUserCan(authorUser, 'activate_plugins')
  ) {
    throw new Error('Author capability boundary check failed');
  }
  if (currentUserCan(subscriberUser, 'edit_posts')) {
    throw new Error('Subscriber should not have edit_posts capability');
  }

  // Capability assertion throwing -32002
  assertCapability(adminUser, 'manage_options');
  try {
    assertCapability(authorUser, 'manage_options');
    throw new Error('Should have rejected manage_options for author');
  } catch (err) {
    if (!(err instanceof WordPressSecurityError) || err.code !== AUTH_ERROR_CODES.FORBIDDEN_CAPABILITY) {
      throw new Error(`Expected FORBIDDEN_CAPABILITY (-32002), got: ${err}`);
    }
  }

  // Custom capability grant
  const upgradedAuthor = grantCapability(authorUser, 'edit_elementor_templates');
  if (!currentUserCan(upgradedAuthor, 'edit_elementor_templates')) {
    throw new Error('Grant capability check failed');
  }

  // 8B.7 SessionManager Lifecycle
  const sessionManager = new SessionManager({ defaultTtlMs: 3600000 });
  const session = sessionManager.createSession(adminUser);
  const activeSession = sessionManager.validateSession(session.sessionId);
  if (activeSession.sessionId !== session.sessionId || activeSession.user.username !== 'admin') {
    throw new Error('SessionManager validateSession failed');
  }

  sessionManager.expireSession(session.sessionId);
  try {
    sessionManager.validateSession(session.sessionId);
    throw new Error('Should have rejected expired session');
  } catch (err) {
    if (!(err instanceof WordPressSecurityError) || err.code !== AUTH_ERROR_CODES.EXPIRED_SESSION) {
      throw new Error(`Expected EXPIRED_SESSION (-32004), got: ${err}`);
    }
  }

  // =========================================================================
  // CONTRACT TEST 8C: Elementor Runtime + AST ↔ WordPress Bridge Integration
  // =========================================================================
  console.log('[Contract Test 8C] Validating Elementor Runtime + AST ↔ WordPress Bridge Integration...');
  const { ElementorBridge } = await import('../../../packages/wordpress-bridge/dist/index.js');
  const {
    handleToolsCall,
    handleToolsList,
    handleResourcesList,
    handleResourcesRead,
    handlePromptsList,
    handlePromptsGet,
  } = await import('../../../packages/mcp-server/dist/index.js');

  interface MockPageRecord {
    id: number;
    title: { rendered: string };
    status: string;
    meta: Record<string, string>;
  }

  // In-memory WordPress mock storage for page 42
  const mockStorage: Record<number, MockPageRecord> = {
    42: {
      id: 42,
      title: { rendered: 'Elementor Hero Landing' },
      status: 'publish',
      meta: {
        _elementor_edit_mode: 'builder',
        _elementor_version: '3.24.0',
        _elementor_page_settings: JSON.stringify({ custom_css: '.hero { color: #fff; }' }),
        _elementor_data: JSON.stringify([
          {
            id: '1a2b3c4',
            elType: 'container',
            settings: { flexDirection: 'column' },
            elements: [
              {
                id: '2b3c4d5',
                elType: 'widget',
                widgetType: 'heading',
                settings: { title: 'Welcome to Craftor AI' },
                elements: [],
              },
            ],
          },
        ]),
      },
    },
  };

  const mockBridgeClient = new WordPressClient({
    siteUrl: 'https://craftor.test',
    auth: { type: 'bearer', token: 'crf_live_bridge_secret_mock' },
    customFetch: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const urlStr = input.toString();
      const method = init?.method ?? 'GET';

      if (urlStr.includes('/wp/v2/pages/42')) {
        if (method === 'POST') {
          const body = JSON.parse(init?.body as string);
          if (mockStorage[42]) {
            mockStorage[42].meta = { ...mockStorage[42].meta, ...(body.meta ?? {}) };
          }
          return new Response(JSON.stringify(mockStorage[42]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify(mockStorage[42]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (urlStr.includes('/wp/v2/pages') && method === 'POST') {
        const body = JSON.parse(init?.body as string);
        const newId = 101;
        mockStorage[newId] = {
          id: newId,
          title: { rendered: body.title ?? 'New Page' },
          status: body.status ?? 'draft',
          meta: body.meta ?? {},
        };
        return new Response(JSON.stringify(mockStorage[newId]), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (urlStr.includes('/wp/v2/pages/101')) {
        if (method === 'POST') {
          const body = JSON.parse(init?.body as string);
          if (mockStorage[101]) {
            mockStorage[101].meta = { ...mockStorage[101].meta, ...(body.meta ?? {}) };
          }
          return new Response(JSON.stringify(mockStorage[101]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify(mockStorage[101]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (urlStr.includes('/wp/v2/settings')) {
        return new Response(JSON.stringify({ elementor_active_kit: '42' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  const elementorBridge = new ElementorBridge({ client: mockBridgeClient });

  // 8C.1 Document Loading & AST Parsing
  const loadedDoc = await elementorBridge.getDocument(42);
  if (loadedDoc.pageId !== 42 || loadedDoc.elements.length !== 1 || loadedDoc.elements[0]?.id !== '1a2b3c4') {
    throw new Error('ElementorBridge getDocument or AST parsing failed');
  }

  // 8C.2 Container & Widget Operations
  const astNewContainer = elementorBridge.createContainer('row');
  const astGridContainer = elementorBridge.createGridContainer({ columns: 3 });
  if (astNewContainer.elType !== 'container' || astGridContainer.elType !== 'container') {
    throw new Error('ElementorBridge createContainer failed');
  }

  // Insert Widget
  const rootElement = loadedDoc.elements[0];
  if (!rootElement) {
    throw new Error('Root element not found in loadedDoc');
  }
  const withWidget = elementorBridge.insertWidget(
    loadedDoc,
    rootElement.id,
    'button',
    { text: 'Click Here' },
  );
  if (!withWidget.document.elements[0] || withWidget.document.elements[0].elements.length !== 2) {
    throw new Error('ElementorBridge insertWidget failed');
  }

  // Update Widget
  const updatedDoc = elementorBridge.updateWidget(
    withWidget.document,
    withWidget.widget.id,
    { text: 'Get Started Now' },
  );
  const updatedWidget = ElementorBridge.AST.findById(updatedDoc.elements, withWidget.widget.id);
  if (updatedWidget?.settings.text !== 'Get Started Now') {
    throw new Error('ElementorBridge updateWidget failed');
  }

  // Duplicate Container
  const duplicated = elementorBridge.duplicateContainer(updatedDoc, '1a2b3c4');
  if (duplicated.document.elements.length !== 2 || duplicated.duplicatedNode.id === '1a2b3c4') {
    throw new Error('ElementorBridge duplicateContainer failed');
  }

  // 8C.3 Save Document & Cache Invalidation
  const savedDoc = await elementorBridge.saveDocument(42, updatedDoc.elements, { custom_css: '.hero { color: #000; }' });
  if (savedDoc.pageId !== 42 || savedDoc.elements.length !== 1) {
    throw new Error('ElementorBridge saveDocument failed');
  }

  const cacheResult = await elementorBridge.invalidateCache(42);
  if (!cacheResult.success || !cacheResult.invalidated.includes('_elementor_css')) {
    throw new Error('ElementorBridge invalidateCache failed');
  }

  // 8C.4 Template Export, Import & Duplication
  const exportedTemplate = await elementorBridge.exportTemplate(42, 'Landing Template');
  if (exportedTemplate.title !== 'Landing Template' || exportedTemplate.elements.length !== 1) {
    throw new Error('ElementorBridge exportTemplate failed');
  }

  const duplicatedPage = await elementorBridge.duplicateTemplate(42, 'Cloned Landing Page');
  if (duplicatedPage.pageId !== 101) {
    throw new Error('ElementorBridge duplicateTemplate failed');
  }

  // 8C.5 Global Kit API
  const activeKit = await elementorBridge.getActiveKit();
  if (activeKit.id !== 42) {
    throw new Error('ElementorBridge getActiveKit failed');
  }

  const globalColors = await elementorBridge.getGlobalColors();
  if (!Array.isArray(globalColors.system) || globalColors.system.length === 0) {
    throw new Error('ElementorBridge getGlobalColors failed');
  }

  // 8C.6 MCP Tools Registry & Execution
  const toolsList = await handleToolsList();
  const requiredTools = [
    'craftor_elementor_get_document',
    'craftor_elementor_save_document',
    'craftor_elementor_create_container',
    'craftor_elementor_update_container',
    'craftor_elementor_delete_container',
    'craftor_elementor_insert_widget',
    'craftor_elementor_update_widget',
    'craftor_elementor_remove_widget',
    'craftor_elementor_export_template',
    'craftor_elementor_import_template',
  ];
  for (const tName of requiredTools) {
    const found = toolsList.tools.find((t) => t.name === tName);
    if (!found) {
      throw new Error(`Required MCP tool "${tName}" not registered.`);
    }
  }

  // Tool Call: craftor_elementor_create_container
  const toolCreateRes = await handleToolsCall({
    name: 'craftor_elementor_create_container',
    arguments: { containerType: 'flex', direction: 'row' },
  });
  if (toolCreateRes.isError) {
    throw new Error('MCP tool call craftor_elementor_create_container failed');
  }

  // Tool Call: craftor_elementor_insert_widget
  const sampleAst = [astNewContainer];
  const toolInsertRes = await handleToolsCall({
    name: 'craftor_elementor_insert_widget',
    arguments: {
      ast: sampleAst,
      parentId: astNewContainer.id,
      widgetType: 'heading',
      settings: { title: 'MCP Headline' },
    },
  });
  if (toolInsertRes.isError) {
    throw new Error('MCP tool call craftor_elementor_insert_widget failed');
  }

  // Tool Call: craftor_elementor_save_document
  const toolSaveRes = await handleToolsCall({
    name: 'craftor_elementor_save_document',
    arguments: { pageId: 42, elements: sampleAst },
  });
  if (toolSaveRes.isError) {
    throw new Error('MCP tool call craftor_elementor_save_document failed');
  }

  // 8C.7 MCP Resources Registry & Read
  const resourcesList = await handleResourcesList();
  const requiredResources = [
    'craftor://elementor/document',
    'craftor://elementor/template',
    'craftor://elementor/kit',
    'craftor://elementor/ast',
  ];
  for (const uri of requiredResources) {
    const found = resourcesList.resources.find((r) => r.uri === uri);
    if (!found) {
      throw new Error(`Required MCP resource "${uri}" not registered.`);
    }
  }

  const docResource = await handleResourcesRead({ uri: 'craftor://elementor/document' });
  if (docResource.contents.length === 0 || !docResource.contents[0]?.text) {
    throw new Error('MCP resource read craftor://elementor/document failed');
  }

  // 8C.8 MCP Prompts Registry & Get
  const promptsList = await handlePromptsList();
  const requiredPrompts = [
    'generate_elementor_homepage',
    'generate_elementor_landing_page',
    'audit_elementor_page',
    'optimize_elementor_layout',
  ];
  for (const pName of requiredPrompts) {
    const found = promptsList.prompts.find((p) => p.name === pName);
    if (!found) {
      throw new Error(`Required MCP prompt "${pName}" not registered.`);
    }
  }

  const homepagePrompt = await handlePromptsGet({
    name: 'generate_elementor_homepage',
    arguments: { brandName: 'Craftor Pro', industry: 'Design Agency' },
  });
  if (homepagePrompt.messages.length === 0 || !homepagePrompt.messages[0]?.content.text) {
    throw new Error('MCP prompt get generate_elementor_homepage failed');
  }

  console.log('[Contract Test] All contract assertions PASSED ✅');
}

runContractTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('[Contract Test Failure]', err);
  process.exit(1);
});
