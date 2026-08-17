#!/usr/bin/env bash
# Craftor Autonomous MCP Server - macOS & Linux Launcher
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"
echo "Starting Craftor MCP Server Daemon (Stdio)..."
exec node packages/mcp-server/dist/index.js "$@"
