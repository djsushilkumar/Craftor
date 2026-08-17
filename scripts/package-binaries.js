/**
 * Craftor Standalone Binary & Portable Launcher Packager
 * Generates zero-dependency portable executable launch scripts for Windows, macOS, and Linux.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_BIN_DIR = path.join(ROOT_DIR, 'dist-bin');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateBinaryLaunchers() {
  console.log('================================================================');
  console.log('       CRAFTOR STANDALONE BINARY & RUNNER PACKAGER              ');
  console.log('================================================================\n');

  ensureDir(DIST_BIN_DIR);

  // 1. Windows Portable Batch Launcher (.bat)
  const winBatPath = path.join(DIST_BIN_DIR, 'craftor-daemon.bat');
  const winBatContent = `@echo off
REM Craftor Autonomous MCP Server - Windows Portable Launcher
setlocal
cd /d "%~dp0\\.."
echo Starting Craftor MCP Server Daemon (Stdio)...
node packages/mcp-server/dist/index.js %*
endlocal
`;
  fs.writeFileSync(winBatPath, winBatContent, 'utf-8');
  console.log(`[PACKAGED] Windows Launcher -> ${path.relative(ROOT_DIR, winBatPath)}`);

  // 2. macOS / Linux Portable Shell Launcher (.sh)
  const posixShPath = path.join(DIST_BIN_DIR, 'craftor-daemon.sh');
  const posixShContent = `#!/usr/bin/env bash
# Craftor Autonomous MCP Server - macOS & Linux Launcher
DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"
echo "Starting Craftor MCP Server Daemon (Stdio)..."
exec node packages/mcp-server/dist/index.js "$@"
`;
  fs.writeFileSync(posixShPath, posixShContent, 'utf-8');
  console.log(`[PACKAGED] Unix Shell Launcher -> ${path.relative(ROOT_DIR, posixShPath)}`);

  // 3. Standalone Distribution Manifest
  const manifestPath = path.join(DIST_BIN_DIR, 'release-manifest.json');
  const manifest = {
    name: 'craftor-mcp-server',
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    platforms: {
      win32: {
        launcher: 'craftor-daemon.bat',
        architecture: ['x64', 'arm64'],
      },
      darwin: {
        launcher: 'craftor-daemon.sh',
        architecture: ['arm64', 'x64'],
      },
      linux: {
        launcher: 'craftor-daemon.sh',
        architecture: ['x64', 'arm64'],
      },
    },
    defaultTransport: 'stdio',
    availableToolsCount: 68,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[PACKAGED] Binary Manifest -> ${path.relative(ROOT_DIR, manifestPath)}`);

  console.log('\n================================================================');
  console.log('PORTABLE BINARY LAUNCHERS PACKAGED SUCCESSFULLY ✅');
  console.log('================================================================\n');
}

if (require.main === module) {
  generateBinaryLaunchers();
}

module.exports = { generateBinaryLaunchers };
