# ADR 003: Dedicated Client Adapter Pattern

## Status
Accepted

## Context
AI developer clients (Claude Desktop, Claude Code CLI, Cursor, Antigravity, VS Code, Codex) each require unique transport configurations, configuration file paths (`claude_desktop_config.json`, `.cursor/mcp.json`, etc.), environment variables, and protocol handshakes. Hardcoding client logic inside the MCP server daemon creates tight coupling and impedes onboarding new clients.

## Decision
We decouple client handling into a dedicated package hierarchy under `packages/client-adapters/`:
- `claude-desktop/`
- `claude-code/`
- `cursor/`
- `antigravity/`
- `vscode/`
- `codex/`
- `shared/` (Base `IClientAdapter` interface and configuration builders)

## Consequences
- Core MCP server daemon remains agnostic to specific AI client implementations.
- Adding support for future AI environments (e.g. Windsurf, Trae, Gemini Studio) requires only a single new adapter sub-package.
- Guarantees strict `stdio` output hygiene (diagnostics to `stderr` only).
