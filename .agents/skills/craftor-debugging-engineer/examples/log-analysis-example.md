# Example: JSON-RPC Disconnect Diagnostic Log Analysis

## Problem Report:
Cursor client disconnects with `Stream closed unexpectedly (-32603)` during batch post creation.

## Diagnostic Steps:
1. Checked Node.js MCP server process output in `.cursor/logs/mcp-craftor.log`.
2. Found non-JSON PHP warning outputted to stdout:
   ```
   PHP Notice: Undefined index: post_status in includes/Rest/Controllers/PostController.php on line 84
   {"jsonrpc":"2.0","id":104,"result":{...}}
   ```
3. Root Cause: PHP warning leaked into stdout before the REST JSON payload, breaking JSON-RPC 2.0 framing.
4. Resolution: Enforced `display_errors = Off` in the bridge initialization and routed all internal PHP logging to `debug.log`.
