/**
 * Craftor Universal AI Client Configuration Generator
 * Generates ready-to-copy JSON configuration files for all 8 supported AI clients.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIGS_OUTPUT_DIR = path.join(ROOT_DIR, 'configs', 'clients');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateClientConfigs() {
  console.log('================================================================');
  console.log('       CRAFTOR UNIVERSAL AI CLIENT CONFIG GENERATOR             ');
  console.log('================================================================\n');

  ensureDir(CONFIGS_OUTPUT_DIR);

  const defaultServerConfig = {
    command: 'node',
    args: [path.join(ROOT_DIR, 'packages', 'mcp-server', 'dist', 'index.js')],
    env: {
      WORDPRESS_BASE_URL: 'http://craftor.local',
      WORDPRESS_API_TOKEN: 'crf_live_demo_token_xyz',
    },
  };

  // 1. Claude Desktop Config (claude_desktop_config.json)
  const claudeDesktop = {
    mcpServers: {
      craftor: defaultServerConfig,
    },
  };
  fs.writeFileSync(
    path.join(CONFIGS_OUTPUT_DIR, 'claude_desktop_config.json'),
    JSON.stringify(claudeDesktop, null, 2),
    'utf-8',
  );
  console.log('[CONFIG] Generated Claude Desktop config');

  // 2. Cursor Config (mcp.json)
  const cursorConfig = {
    mcpServers: {
      craftor: defaultServerConfig,
    },
  };
  fs.writeFileSync(
    path.join(CONFIGS_OUTPUT_DIR, 'cursor_mcp.json'),
    JSON.stringify(cursorConfig, null, 2),
    'utf-8',
  );
  console.log('[CONFIG] Generated Cursor MCP config');

  // 3. Antigravity Config (agy_mcp_config.json)
  const agyConfig = {
    mcpServers: {
      'craftor-elementor': defaultServerConfig,
    },
  };
  fs.writeFileSync(
    path.join(CONFIGS_OUTPUT_DIR, 'agy_mcp_config.json'),
    JSON.stringify(agyConfig, null, 2),
    'utf-8',
  );
  console.log('[CONFIG] Generated Antigravity config');

  // 4. VS Code MCP Config (vscode_settings.json)
  const vscodeConfig = {
    'mcp.servers': {
      craftor: defaultServerConfig,
    },
  };
  fs.writeFileSync(
    path.join(CONFIGS_OUTPUT_DIR, 'vscode_settings.json'),
    JSON.stringify(vscodeConfig, null, 2),
    'utf-8',
  );
  console.log('[CONFIG] Generated VS Code config');

  // 5. Claude Code CLI Config (claude_code.json)
  const claudeCode = {
    mcpServers: {
      craftor: defaultServerConfig,
    },
  };
  fs.writeFileSync(
    path.join(CONFIGS_OUTPUT_DIR, 'claude_code.json'),
    JSON.stringify(claudeCode, null, 2),
    'utf-8',
  );
  console.log('[CONFIG] Generated Claude Code CLI config');

  // 6. Codex / Windsurf / JetBrains MCP Configs
  const genericMcp = {
    version: '1.0.0',
    servers: {
      craftor: defaultServerConfig,
    },
  };
  fs.writeFileSync(
    path.join(CONFIGS_OUTPUT_DIR, 'windsurf_mcp.json'),
    JSON.stringify(genericMcp, null, 2),
    'utf-8',
  );
  fs.writeFileSync(
    path.join(CONFIGS_OUTPUT_DIR, 'jetbrains_mcp.json'),
    JSON.stringify(genericMcp, null, 2),
    'utf-8',
  );
  fs.writeFileSync(
    path.join(CONFIGS_OUTPUT_DIR, 'codex_mcp.json'),
    JSON.stringify(genericMcp, null, 2),
    'utf-8',
  );
  console.log('[CONFIG] Generated Windsurf, JetBrains & Codex configs');

  console.log('\n================================================================');
  console.log('ALL 8 AI CLIENT CONFIGURATIONS GENERATED SUCCESSFULLY ✅');
  console.log('================================================================\n');
}

if (require.main === module) {
  generateClientConfigs();
}

module.exports = { generateClientConfigs };
