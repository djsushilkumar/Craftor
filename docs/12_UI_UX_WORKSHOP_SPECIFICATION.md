# Craftor — UI/UX Workshop Specification & Wireframes

**Document ID:** UIUX-SPEC-2026-001  
**Project:** Craftor — Universal MCP Platform for WordPress, Elementor & WooCommerce  
**Version:** 1.0.0 (Master UX Blueprint)  
**Status:** Approved for Design System & Monorepo Implementation

---

## Workshop Executive Summary

This document establishes the comprehensive User Experience (UX) architecture, User Interfaces (UI), component hierarchies, state machines, wireframes, and interaction specifications for the entire Craftor ecosystem.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CRAFTOR UI/UX ECOSYSTEM MAP                                       │
├──────────────────────────┬──────────────────────────┬──────────────────────────┬────────────────────────┤
│ 1. SAAS DASHBOARD        │ 2. WORDPRESS PLUGIN      │ 3. THE 4 REGISTRIES      │ 4. VISUAL BUILDERS &   │
│    (app.craftor.ai)      │    (wp-admin interface)  │    (Core Hubs)           │    DIFF INSPECTORS     │
├──────────────────────────┼──────────────────────────┼──────────────────────────┼────────────────────────┤
│ • Multi-Site Estate Hub  │ • 3-Step Onboarding      │ • Tool Registry Explorer │ • Visual Diff Viewer   │
│ • AI Provider Key Vault  │ • Snapshot History Table │ • Skill Registry Hub     │   (Split-Slider Mode)  │
│ • MCP Server Management  │ • Local Key Generator    │ • Agent Marketplace      │ • Elementor Canvas HUD │
│ • Telemetry & Analytics  │ • Permission Guardrails  │ • Visual Workflow Canvas │   (Live Stream Bridge) │
└──────────────────────────┴──────────────────────────┴──────────────────────────┴────────────────────────┘
```

---

## 1. SaaS Dashboard Architecture (`app.craftor.ai`)

### 1.1 Global Layout & Shell Wireframe

The SaaS control plane utilizes a collapsible sidebar, contextual breadcrumbs, a global site/tenant switcher, and a real-time system status indicator.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [C] CRAFTOR  │  Workspace: [ Vance Digital (Agency) ▼ ]        [ Search tools, sites, agents... ⌘K ]  [🔔] [👤 Alex V.]│
├──────────────┼─────────────────────────────────────────────────────────────────────────────────────────┤
│  NAVIGATION  │  Dashboard > Sites Overview                                                             │
│              ├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 🌐 Sites     │  SITE ESTATE OVERVIEW (45 Connected Sites)              [ + Connect New WordPress Site ]│
│ 🤖 Providers │ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ ⚡ MCP Daemon│ │ [Filter: All Sites ▼] [Environment: Production ▼] [Health: All Healthy ▼] [Sort: Active]│ │
│ 🧰 Tools (240│ ├─────────────────────────────────────────────────────────────────────────────────────┤ │
│ 🧠 Skills    │ │ SITE NAME & URL             TIER        ACTIVE CLIENTS   LAST SYNC      HEALTH STATUS│ │
│ 🦾 Agents    │ │ ─────────────────────────────────────────────────────────────────────────────────── │ │
│ 🔀 Workflows │ │ 🟢 Acme Corp Retail         Enterprise  Cursor, Claude   2 mins ago     ✅ 240 Tools  │ │
│ 💳 Billing   │ │    https://acmestore.com                                                [ Manage ]   │ │
│ 🔑 Licenses  │ │ ─────────────────────────────────────────────────────────────────────────────────── │ │
│ 🚀 Updates   │ │ 🟢 Lumina SaaS Marketing    Pro         Claude Desktop   12 mins ago    ✅ 160 Tools  │ │
│ 📊 Analytics │ │    https://luminasaas.io                                                [ Manage ]   │ │
│              │ │ ─────────────────────────────────────────────────────────────────────────────────── │ │
│ ──────────── │ │ 🟡 Dev Staging Sandbox      Core        Antigravity IDE  1 hour ago     ⚠️ Update Av. │ │
│ ⚙️ Settings  │ │    https://staging.devsite                                              [ Manage ]   │ │
│              │ └─────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────┴─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Hierarchy

```
DashboardAppShell
├── GlobalHeader
│   ├── BrandLogo
│   ├── TenantWorkspaceDropdown
│   ├── GlobalOmniSearchModal (Cmd+K)
│   ├── NotificationDrawer
│   └── UserProfileDropdown
├── CollapsibleSidebar
│   ├── NavigationMenu (Sites, Providers, MCP, Tools, Skills, Agents, Workflows, Billing)
│   └── SystemStatusBadge (SSE Cloud Gateway Health: 99.99%)
└── MainContentArea
    ├── BreadcrumbsBar
    ├── ActionToolbar
    └── DataGrid / ViewportContainer
```

### 1.3 Interaction Specifications

- **Tenant Switcher:** Clicking the workspace dropdown opens a fuzzy-search popover displaying all available agency organizations and client sub-tenants.
- **Omni-Search (`Cmd+K` / `Ctrl+K`):** Global modal searching across connected site names, 240+ tools, skills, active agent runs, and past snapshot UUIDs.
- **Site Row Click:** Expands a slide-over panel displaying real-time MCP connection health, active client sessions, and recent snapshot diffs.

---

## 2. WordPress Plugin Interface (`craftor-core` / `pro` / `enterprise`)

### 2.1 Native WP Admin Settings Wireframe

Located under WordPress Admin $\rightarrow$ **Craftor** $\rightarrow$ **Settings**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  WordPress Admin Sidebar > Craftor > Settings                                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Craftor Universal MCP Platform                                                      [ Version 1.0.0 ] │
│  Active License: Craftor Enterprise (Unlimited Sites)                                  [ Verified ✅ ] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Connection & Keys ]   [ Snapshot & Rollback History ]   [ Tool Permissions ]   [ Diagnostics & Logs ]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│  LOCAL MCP SERVER CONFIGURATION                                                                        │
│  ────────────────────────────────────────────────────────────────────────────────────────────────────  │
│  Status: 🟢 Active Daemon Listening (Port: 8080 / stdio Bridge Active)                                │
│                                                                                                        │
│  Active Secret Token:                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┬───────────────────────────┐ │
│  │  crf_sec_89f1a23b98c74e0192a83b1298c74e5541a9...                     │ [ 👁️ Reveal ] [ 📋 Copy ] │ │
│  └───────────────────────────────────────────────────────────────────────┴───────────────────────────┘ │
│  [ 🔄 Rotate Secret Token ]  (Will invalidate active client sessions)                                  │
│                                                                                                        │
│  QUICK CLIENT SETUP SNIPPETS                                                                           │
│  ────────────────────────────────────────────────────────────────────────────────────────────────────  │
│  Select AI Client: [ Cursor (.cursor/mcp.json) ▼ ]                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │ {                                                                                                 │ │
│  │   "mcpServers": {                                                                                 │ │
│  │     "craftor": {                                                                                  │ │
│  │       "command": "npx",                                                                           │ │
│  │       "args": ["-y", "craftor-mcp@latest", "--site", "https://mysite.local", "--token", "..."]   │ │
│  │     }                                                                                             │ │
│  │   }                                                                                               │ │
│  │ }                                                                                                 │ │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│  [ 📋 Copy Configuration JSON ]                                                                        │
│                                                                                                        │
│  TRANSACTIONAL SNAPSHOT GUARD                                                                          │
│  ────────────────────────────────────────────────────────────────────────────────────────────────────  │
│  ☑️ Automatically snapshot post and Elementor state before every AI write mutation                      │
│  ☑️ Enable live Marionette canvas preview synchronization in Elementor Editor                          │
│                                                                                    [ Save Settings ]   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Snapshot & Rollback History View Wireframe

Located under WordPress Admin $\rightarrow$ **Craftor** $\rightarrow$ **Snapshots**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  CRAFTOR SNAPSHOT & ROLLBACK REVISIONS                                                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Filter by Post ID: [ All Posts ▼ ] ]   [ Filter by Context: [ AI Mutation ▼ ] ]   [ Search UUID... ]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  SNAPSHOT UUID      TARGET POST         TRIGGER CONTEXT    TIMESTAMP        CALLER       ACTIONS       │
│  ────────────────────────────────────────────────────────────────────────────────────────────────────  │
│  snp_8f921a44c0     Page: #104 (Home)   AI Layout Mutate   2 mins ago       Cursor IDE   [ Diff ] [ ⏪ ]│
│  snp_77c19b21a8     Page: #42 (Pricing) Compound Pricing   14 mins ago      Claude Desktop[ Diff ] [ ⏪ ]│
│  snp_11e4029f9c     Product: #501 (Shoe)Woo Flash Sale     1 hour ago       SaaS Agent   [ Diff ] [ ⏪ ]│
│  snp_00a91f33b1     Post: #12 (Blog)    SEO Alt-Text AI    Yesterday        WP-CLI       [ Diff ] [ ⏪ ]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. AI Provider Screens (BYOK & Managed Cloud)

Located in SaaS Dashboard $\rightarrow$ **AI Providers**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AI PROVIDERS & CREDENTIAL VAULT                                                                       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ACTIVE MODE: [ 🔘 Mode 1: BYOK (Direct Keys) ]     [ ⚪ Mode 2: Craftor Managed AI Gateway ]          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│  CONFIGURED PROVIDER KEYS (Encrypted at Rest with AES-256-GCM)                                         │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🟢 ANTHROPIC (Claude 3.5 Sonnet / Haiku / Opus)                                 [ Verified Valid ✅ ]│ │
│ │ Key: sk-ant-api03-***************************************************            [ Update ] [ Test ]│ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ 🟢 OPENAI (GPT-4o / GPT-4o-mini / o1 / o3-mini)                                 [ Verified Valid ✅ ]│ │
│ │ Key: sk-proj-*******************************************************            [ Update ] [ Test ]│ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ 🟢 GOOGLE GEMINI (Gemini 1.5 Pro / Flash / 2.0 Flash)                           [ Verified Valid ✅ ]│ │
│ │ Key: AIzaSy*********************************************************            [ Update ] [ Test ]│ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ ⚪ LOCAL MODELS (Ollama / vLLM / LM Studio)                                      [ Disconnected ⚠️ ] │ │
│ │ Endpoint: http://localhost:11434/v1                                              [ Connect ] [ Test ]│ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│  [ + Add Custom OpenRouter / OpenAI-Compatible Provider ]                                              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. MCP Server Management Screens

Located in SaaS Dashboard $\rightarrow$ **MCP Servers**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  MODEL CONTEXT PROTOCOL (MCP) RUNTIME DAEMONS                                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Active Local Daemons (3) ]   [ Remote SSE Cloud Endpoints (1) ]   [ Packet Stream Logs ]            │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│  ACTIVE CLIENT SESSIONS                                                                                │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ CLIENT NAME     TRANSPORT   REMOTE SITE                UPTIME    REQ COUNT   AVG LATENCY   STATUS    │ │
│ │ ────────────────────────────────────────────────────────────────────────────────────────────────── │ │
│ │ 🟢 Cursor IDE   stdio       https://acmestore.com      4h 12m    142 calls   42ms          Active    │ │
│ │ 🟢 Claude Deskt.stdio       https://luminasaas.io      1h 05m    89 calls    38ms          Active    │ │
│ │ 🟢 Antigravity  SSE / HTTPS https://staging.devsite    18m       24 calls    51ms          Streaming │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
│  LIVE JSON-RPC 2.0 TRAFFIC INSPECTOR (Streaming)                                      [ ⏸️ Pause Stream ]│
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [18:14:02.104] ──► tools/call: elementor_create_container { page_id: 104, flex_direction: "row" }   │ │
│ │ [18:14:02.148] ◄── result: { success: true, node_id: "el_7b1c4e2", snapshot_id: "snp_8f921a" } (46ms)│
│ │ [18:14:03.220] ──► tools/call: elementor_add_widget { page_id: 104, widgetType: "heading" }         │ │
│ │ [18:14:03.255] ◄── result: { success: true, widget_id: "el_9f2d1a8" } (35ms)                         │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. The 4 Registries Interface Suite

### 5.1 Tool Registry Explorer Screen

Located in SaaS Dashboard $\rightarrow$ **Tool Registry**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  TOOL REGISTRY EXPLORER (240 Active Versioned Tools)                  [ Staged Rollout: Phase 1 (40) ▼]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  CATEGORIES                  SEARCH: [ 🔍 Filter by tool name, parameter or description...           ]│
│ ┌──────────────────────────┐┌─────────────────────────────────────────────────────────────────────────┐│
│ │ • All Tools (240)        ││ `elementor_create_container`  [ v1.2.0 ] [ Edit_Posts ] [ Phase 1 Core ] ││
│ │ • WP Core (35)           ││ Inserts a modern Flexbox or CSS Grid Container into Elementor AST.       ││
│ │ • Elementor Layout (40)  ││ Input Schema: { page_id: int, flex_direction: enum, justify: enum }     ││
│ │ • Elementor Style (25)   ││ [ View Full Schema ]  [ Test In Sandbox ]  [ Scoped Permissions Toggle ] ││
│ │ • Theme Builder (20)     │├─────────────────────────────────────────────────────────────────────────┤│
│ │ • WooCommerce Cat. (35)  ││ `woo_create_simple_product`   [ v1.0.0 ] [ Manage_Woo ] [ Phase 1 Core ] ││
│ │ • WooCommerce Orders (25)││ Creates a new simple product with pricing, SKU, and stock inventory.     ││
│ │ • Media Library (15)     ││ Input Schema: { name: string, regular_price: string, sku: string }      ││
│ │ • SEO & Metadata (15)    ││ [ View Full Schema ]  [ Test In Sandbox ]  [ Scoped Permissions Toggle ] ││
│ │ • Site Ops / CLI (15)    │├─────────────────────────────────────────────────────────────────────────┤│
│ │ • Multi-Site & Sec (15)  ││ `craftor_create_snapshot`     [ v1.1.0 ] [ Edit_Posts ] [ Phase 1 Core ] ││
│ └──────────────────────────┘└─────────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Skill Registry Screen

Located in SaaS Dashboard $\rightarrow$ **Skill Registry**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  SKILL REGISTRY (15 Autonomous Antigravity Skills)                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌──────────────────────────────────┐ ┌──────────────────────────┐ │
│ │ 🎨 craftor-elementor-engineer    │ │ ⚡ craftor-mcp-engineer          │ │ 🛒 craftor-woocommerce-eng│ │
│ │ Mission: Flex/Grid AST & Canvas  │ │ Mission: JSON-RPC Transports     │ │ Mission: Products & Orders │ │
│ │ Eval Accuracy: 99.2% [ PASS ✅ ] │ │ Conformance: 100% [ PASS ✅ ]    │ │ HPOS Sync: 100% [ PASS ✅ ]│ │
│ │ Tools Bound: 65 Tools            │ │ Tools Bound: 240 Tools           │ │ Tools Bound: 60 Tools      │ │
│ │ [ Inspect SKILL.md ] [ Run Eval ]│ │ [ Inspect SKILL.md ] [ Run Eval ]│ │ [ Inspect ] [ Run Eval ]  │ │
│ └──────────────────────────────────┘ └──────────────────────────────────┘ └──────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Agent Marketplace Screen

Located in SaaS Dashboard $\rightarrow$ **Agent Marketplace**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AI AGENT MARKETPLACE & ROLE PERSONAS                                [ + Deploy Custom AI Agent ]      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌──────────────────────────────────┐ ┌──────────────────────────┐ │
│ │ 🖌️ Visual Page Builder Agent    │ │ ⚙️ Full-Stack Backend Agent      │ │ 🏷️ E-Commerce Ops Agent   │ │
│ │ Author: Craftor Official         │ │ Author: Craftor Official         │ │ Author: Craftor Official   │ │
│ │ Role: Builds responsive hero     │ │ Role: Scaffolds CPTs, meta schema│ │ Role: Configures flash sale│ │
│ │ sections, pricing grids & styling│ │ and executes WP-CLI migrations.  │ │ funnels, discounts & stock.│ │
│ │ Skills: Elementor + UI/UX        │ │ Skills: WordPress + Debugging    │ │ Skills: WooCommerce + Promo│ │
│ │ [ Installed & Active ✅ ]        │ │ [ Installed & Active ✅ ]        │ │ [ Install to Workspace ]   │ │
│ └──────────────────────────────────┘ └──────────────────────────────────┘ └──────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Visual Workflow Builder Screen

Located in SaaS Dashboard $\rightarrow$ **Workflow Builder**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  WORKFLOW BUILDER: "Seasonal Flash Sale Campaign"                                  [ Run Workflow ▶️ ] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│   ┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐                 │
│   │ [⚡ Webhook Trigger] │ ──────► │ [🛡️ Create Snapshot]│ ──────► │ [🏷️ Create Coupon ] │                 │
│   │ "Black Friday Run" │         │ "snp_auto_bf2026"  │         │ Code: "BF30" (30%) │                 │
│   └────────────────────┘         └────────────────────┘         └─────────┬──────────┘                 │
│                                                                           │                            │
│                                                                           ▼                            │
│   ┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐                 │
│   │ [🚀 Publish Live]  │ ◄────── │ [📊 Visual Diff    │ ◄────── │ [🎨 Build Hero     │                 │
│   │ Target: 25 Sites   │         │    Verification]   │         │    Banner in Elem.]│                 │
│   └────────────────────┘         └────────────────────┘         └────────────────────┘                 │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 3-Step Guided Onboarding Wizard (Modal / Fullscreen)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  CRAFTOR ONBOARDING WIZARD                                                                [ Step 2 of 3]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│         ( 1. Select Mode ) ──────────► [ 2. Configure Client ] ──────────► ( 3. Verify Connection )    │
│                                                                                                        │
│   CONNECT YOUR AI CLIENT                                                                               │
│   Choose your primary development environment:                                                         │
│                                                                                                        │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│   │ 🟢 CURSOR    │   │ 🟣 CLAUDE    │   │ 🔵 VS CODE   │   │ 🟡 ANTIGRAV. │   │ ⚪ TERMINAL  │         │
│   │  (Composer)  │   │  (Desktop)   │   │  (MCP Ext.)  │   │  (Agent IDE) │   │ (Claude Code)│         │
│   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘         │
│                                                                                                        │
│   Copy and paste this snippet into your `.cursor/mcp.json` file:                                       │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│   │ {                                                                                                │ │
│   │   "mcpServers": {                                                                                │ │
│   │     "craftor": {                                                                                 │ │
│   │       "command": "npx",                                                                          │ │
│   │       "args": ["-y", "craftor-mcp@latest", "--site", "https://mysite.local", "--token", "crf_.."]│ │
│   │     }                                                                                            │ │
│   │   }                                                                                              │ │
│   │ }                                                                                                │ │
│   └──────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│   [ 📋 Copy to Clipboard ]                                                                             │
│                                                                                                        │
│   [ ◀️ Back: Select Mode ]                                                  [ Next: Test Connection ▶️ ]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Visual Diff Viewer (Split-Slider & Side-by-Side Mode)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  VISUAL DIFF INSPECTOR: Snapshot #snp_8f921a (Page: Home #104)                     [ ✖️ Close Inspector]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Mode: [ 🔘 Split Slider ]  [ ⚪ Side-by-Side ]  [ ⚪ JSON AST Diff ]   Viewport: [ 🖥️ Desktop (1440px) ▼]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┬─────────────────────────────────────────────────┐ │
│ │  BEFORE (Current Live State)                     │  AFTER (AI Proposed Modification)               │ │
│ │ ┌──────────────────────────────────────────────┐ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │                                              │ │ │ 🟩 [ADDED CONTAINER] (Flex Row)             │ │ │
│ │ │                                              │ │ │   🟩 [NEW BADGE] "🚀 Powered by Craftor"    │ │ │
│ │ │  [ Standard 2-Column Hero Section ]          │ │ │   🟨 [MODIFIED H1] Typography Size: 56px    │ │ │
│ │ │                                              │ │ │   🟩 [NEW CTA BUTTON] "Get Started Now"     │ │ │
│ │ │                                              │ │ │                                             │ │ │
│ │ └──────────────────────────────────────────────┘ │ └─────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────┴─────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Legend: 🟩 Added Node (+2)   🟨 Modified Node (1)   🟥 Deleted Node (0)                               │
│                                                                                                        │
│  [ ⏪ Reject & Rollback to #snp_8f921a ]                       [ ✅ Accept & Publish Live to Canvas ]  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Elementor Canvas Overlay & Real-Time Streaming HUD

This UI is dynamically rendered as a non-intrusive floating HUD inside the active Elementor Editor canvas iframe:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ELEMENTOR EDITOR ACTIVE CANVAS (Iframe Window)                                                        │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │ ⚡ CRAFTOR LIVE AI HUD:  [ 🟢 Connected: Cursor IDE ]   [ 🌀 Streaming Flexbox Layout... ]     │     │
│   │ Active Snapshot: #snp_991b2c  │  Tokens Used: 412  │  [ ⏸️ Pause ] [ ⏪ Revert Last Step ]    │     │
│   └──────────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                        │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │ [ LIVE INJECTED CONTAINER WITH PULSING EMERALD OUTLINE ]                                     │     │
│   │                                                                                              │     │
│   │   # Craftor Universal MCP for WordPress                                                      │     │
│   │   Connecting Cursor, Claude and AI Agents directly to your live canvas.                      │     │
│   │                                                                                              │     │
│   │   [ Start Building with AI ]                                                                 │     │
│   └──────────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Design System Tokens Specification

All interfaces strictly consume standard design tokens exported from `@craftor/design-tokens`:

| Token Category    | Token Name                 | Value                            | Purpose                     |
| :---------------- | :------------------------- | :------------------------------- | :-------------------------- |
| **Brand Primary** | `--crf-color-primary`      | `hsl(243, 75%, 59%)` (`#6366F1`) | Primary CTAs, active badges |
| **Brand Surface** | `--crf-color-surface-dark` | `hsl(222, 47%, 11%)` (`#0F172A`) | Dashboard background        |
| **Diff Added**    | `--crf-color-diff-add`     | `hsl(158, 64%, 52%)` (`#10B981`) | Injected nodes outline      |
| **Diff Modified** | `--crf-color-diff-mod`     | `hsl(38, 92%, 50%)` (`#F59E0B`)  | Modified control border     |
| **Diff Deleted**  | `--crf-color-diff-del`     | `hsl(0, 84%, 60%)` (`#EF4444`)   | Deleted nodes container     |
| **Typography**    | `--crf-font-family`        | `'Inter', system-ui, sans-serif` | Clean, modern legibility    |
| **Radii**         | `--crf-radius-md`          | `8px`                            | Cards, buttons, modals      |

---

_This UI/UX workshop specification defines the visual and interaction standard for Craftor. All upcoming design system tokens, database DDLs, and monorepo scaffolding will build directly upon these wireframes and user flows._
