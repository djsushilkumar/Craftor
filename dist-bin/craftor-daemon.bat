@echo off
REM Craftor Autonomous MCP Server - Windows Portable Launcher
setlocal
cd /d "%~dp0\.."
echo Starting Craftor MCP Server Daemon (Stdio)...
node packages/mcp-server/dist/index.js %*
endlocal
