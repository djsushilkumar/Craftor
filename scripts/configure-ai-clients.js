/**
 * Craftor Universal AI Client Configuration Generator
 * Generates ready-to-copy JSON configuration files for all 8 supported AI clients.
 */

const path = require('path');

const { ROOT_DIR, ensureDir, writeJsonFile } = require('./lib/fs-utils');
const { printBanner, printFooter } = require('./lib/report');

const CONFIGS_OUTPUT_DIR = path.join(ROOT_DIR, 'configs', 'clients');

function generateClientConfigs() {
  printBanner('CRAFTOR UNIVERSAL AI CLIENT CONFIG GENERATOR');

  ensureDir(CONFIGS_OUTPUT_DIR);

  const defaultServerConfig = {
    command: 'node',
    args: [path.join(ROOT_DIR, 'packages', 'mcp-server', 'dist', 'index.js')],
    env: {
      WORDPRESS_BASE_URL: 'http://craftor.local',
      WORDPRESS_API_TOKEN: 'crf_live_demo_token_xyz',
    },
  };

  const writeConfig = (fileName, config) =>
    writeJsonFile(path.join(CONFIGS_OUTPUT_DIR, fileName), config);

  // 1. Claude Desktop Config (claude_desktop_config.json)
  writeConfig('claude_desktop_config.json', { mcpServers: { craftor: defaultServerConfig } });
  console.log('[CONFIG] Generated Claude Desktop config');

  // 2. Cursor Config (mcp.json)
  writeConfig('cursor_mcp.json', { mcpServers: { craftor: defaultServerConfig } });
  console.log('[CONFIG] Generated Cursor MCP config');

  // 3. Antigravity Config (agy_mcp_config.json)
  writeConfig('agy_mcp_config.json', {
    mcpServers: { 'craftor-elementor': defaultServerConfig },
  });
  console.log('[CONFIG] Generated Antigravity config');

  // 4. VS Code MCP Config (vscode_settings.json)
  writeConfig('vscode_settings.json', { 'mcp.servers': { craftor: defaultServerConfig } });
  console.log('[CONFIG] Generated VS Code config');

  // 5. Claude Code CLI Config (claude_code.json)
  writeConfig('claude_code.json', { mcpServers: { craftor: defaultServerConfig } });
  console.log('[CONFIG] Generated Claude Code CLI config');

  // 6. Codex / Windsurf / JetBrains MCP Configs
  const genericMcp = {
    version: '1.0.0',
    servers: {
      craftor: defaultServerConfig,
    },
  };
  for (const fileName of ['windsurf_mcp.json', 'jetbrains_mcp.json', 'codex_mcp.json']) {
    writeConfig(fileName, genericMcp);
  }
  console.log('[CONFIG] Generated Windsurf, JetBrains & Codex configs');

  printFooter('ALL 8 AI CLIENT CONFIGURATIONS GENERATED SUCCESSFULLY ✅');
}

if (require.main === module) {
  generateClientConfigs();
}

module.exports = { generateClientConfigs };
