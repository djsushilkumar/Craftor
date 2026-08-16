# Example: 5-Minute Quickstart Guide for Cursor

# Connecting Craftor to Cursor in 5 Minutes

Learn how to connect Craftor MCP to Cursor to build WordPress & Elementor pages directly from your editor.

## Prerequisites
* WordPress 6.2+ with the `craftor-core` plugin installed and activated.
* Cursor IDE installed on your computer.

---

## Step 1: Generate your Craftor Secret Token
1. In your WordPress Admin sidebar, navigate to **Craftor** $\rightarrow$ **Settings**.
2. Click **Generate New MCP Token**.
3. Copy the generated secret key (starts with `crf_sec_...`).

---

## Step 2: Configure Cursor MCP Settings
1. Open Cursor and navigate to **Settings** $\rightarrow$ **Features** $\rightarrow$ **MCP Servers**.
2. Click **Add New MCP Server** and enter:
   * **Name:** `craftor`
   * **Type:** `command`
   * **Command:** `npx -y craftor-mcp@latest --site https://mysite.local --token YOUR_COPIED_TOKEN`
3. Click **Save**. The status indicator will turn **Green (Active - 240 Tools)**.

---

## Step 3: Run your First Prompt
Open Cursor Composer (`Cmd+I` or `Ctrl+I`) and prompt:
> *"Inspect my active Elementor Global Kit colors, and create a 3-column feature grid on my 'Services' page."*
