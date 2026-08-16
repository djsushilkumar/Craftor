# Example: Client Onboarding Wizard Mockup Specification

```markdown
# Screen: 3-Step Client Connection Wizard

## Layout Structure
- Container: Centered Modal / Full-width WP Admin Card (Max-width 720px)
- Background: Glassmorphic dark card (`rgba(15, 23, 42, 0.95)`) with subtle Indigo border `#6366F1`

### Step 1: Mode & Provider Selection
- Two Interactive Radio Cards:
  1. [Mode 1: BYOK (Bring Your Own API Key)]
     - Subtext: "Connect your Anthropic, OpenAI, Gemini, or OpenRouter keys directly."
     - Input field: Masked password input with eye toggle.
  2. [Mode 2: Craftor Managed AI]
     - Subtext: "Turnkey credits, smart multi-model routing & high-availability fallbacks."
     - Shows current credit balance badge.

### Step 2: Client Configuration Generator
- Dropdown select: [Select AI Client: Claude Desktop | Cursor | Claude Code | Antigravity | VS Code]
- Code Box with copy button:
  ```json
  {
    "mcpServers": {
      "craftor": {
        "command": "npx",
        "args": ["-y", "craftor-mcp@latest", "--site", "https://mysite.local", "--token", "crf_sec_89f..."]
      }
    }
  }
  ```

### Step 3: Test Handshake
- Button: `[Verify Connection]`
- Status Badge: Pulsing Emerald Dot (`#10B981`) -> "Connected: 240 Tools Active".
```
