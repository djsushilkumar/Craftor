/**
 * Playwright E2E Suite: MCP Handshake & Protocol Conformance
 * Validates JSON-RPC 2.0 initialization, ping, 40-tool catalog discovery,
 * resource inspection, and prompt template retrieval.
 */

import { McpRouter } from '../../../packages/mcp-server/dist/router.js';
import { handleToolsList } from '../../../packages/mcp-server/dist/handlers/tools.js';
import { handleResourcesList, handleResourcesRead } from '../../../packages/mcp-server/dist/handlers/resources.js';
import { handlePromptsList, handlePromptsGet } from '../../../packages/mcp-server/dist/handlers/prompts.js';

export async function runMcpHandshakeE2e(): Promise<{ name: string; passed: boolean; assertions: number }> {
  console.log('  ▶ [E2E Spec] MCP Handshake & Protocol Conformance...');
  let assertions = 0;

  const router = new McpRouter();

  // 1. Initialize Handshake
  const initRes = await router.dispatch({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      clientInfo: { name: 'Playwright-E2E-Runner', version: '1.0.0' },
      capabilities: { tools: {}, resources: {}, prompts: {} },
    },
  });
  assertions++;
  if (initRes.error || !initRes.result) {
    throw new Error(`MCP initialize handshake failed: ${JSON.stringify(initRes.error)}`);
  }
  const initResult = initRes.result as { protocolVersion: string; serverInfo: { name: string } };
  if (initResult.protocolVersion !== '2024-11-05' || !initResult.serverInfo?.name) {
    throw new Error(`Invalid initialize result: ${JSON.stringify(initResult)}`);
  }

  // 2. Ping Health Check
  const pingRes = await router.dispatch({ jsonrpc: '2.0', id: 2, method: 'ping' });
  assertions++;
  if (pingRes.error) {
    throw new Error(`MCP ping failed: ${JSON.stringify(pingRes.error)}`);
  }

  // 3. Complete 40-Tool Catalog Discovery
  const toolsList = await handleToolsList();
  assertions++;
  if (!Array.isArray(toolsList.tools) || toolsList.tools.length !== 40) {
    throw new Error(`Expected exactly 40 registered tools in tools/list, got: ${toolsList.tools.length}`);
  }

  // Validate every tool has valid inputSchema
  for (const tool of toolsList.tools) {
    assertions++;
    if (!tool.name || !tool.description || !tool.inputSchema || typeof tool.inputSchema !== 'object') {
      throw new Error(`Tool schema invalid for "${tool.name}"`);
    }
  }

  // 4. Resources List & Read Verification
  const resList = await handleResourcesList();
  assertions++;
  if (!Array.isArray(resList.resources) || resList.resources.length < 4) {
    throw new Error(`Expected at least 4 MCP resources, got: ${resList.resources.length}`);
  }

  const tokenResource = await handleResourcesRead({ uri: 'craftor://tokens/design' });
  assertions++;
  if (!tokenResource.contents?.[0]?.text) {
    throw new Error('Failed to read craftor://tokens/design resource');
  }

  // 5. Prompts List & Get Verification
  const promptList = await handlePromptsList();
  assertions++;
  if (!Array.isArray(promptList.prompts) || promptList.prompts.length < 4) {
    throw new Error(`Expected at least 4 MCP prompts, got: ${promptList.prompts.length}`);
  }

  const promptResult = await handlePromptsGet({
    name: 'generate_elementor_homepage',
    arguments: { brandName: 'Craftor Test', industry: 'E-Commerce' },
  });
  assertions++;
  if (!promptResult.messages?.[0]?.content?.text) {
    throw new Error('Failed to get generate_elementor_homepage prompt');
  }

  console.log(`    ✅ MCP Handshake E2E Passed (${assertions} assertions)`);
  return { name: 'mcp-handshake.spec.ts', passed: true, assertions };
}
