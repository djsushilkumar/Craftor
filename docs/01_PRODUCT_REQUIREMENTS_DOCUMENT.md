# Craftor — Product Requirements Document (PRD)

**Document ID:** PRD-2026-001  
**Project Name:** Craftor  
**Product Category:** Universal Model Context Protocol (MCP) Platform for WordPress, Elementor & WooCommerce  
**Version:** 1.0.0 (Discovery Baseline)  
**Status:** Approved for Architectural Design

---

## 1. Executive Summary & Vision

**Craftor** is the world’s first enterprise-grade, universal Model Context Protocol (MCP) platform purpose-built for the WordPress, Elementor, and WooCommerce ecosystems.

Modern web creators, agencies, and enterprise engineering teams waste thousands of hours manually assembling pages, configuring e-commerce funnels, managing multi-site estates, and resolving repetitive layout and content maintenance tasks. Existing AI extensions are either shallow conversational chatbots stuck inside an iframe or rudimentary bridge plugins with fragile JSON outputs, zero transactional safety, and vendor lock-in.

Craftor eliminates these boundaries by exposing an industrial-strength, 200+ tool MCP server daemon and cloud control plane. Craftor allows any AI client—from **Claude Code, Claude Desktop, Cursor, Codex, Antigravity, VS Code, Gemini-compatible clients, to OpenAI-compatible agents**—to natively inspect, design, build, test, and manage WordPress and Elementor websites with zero-shot fidelity, live canvas streaming, and deterministic rollback guarantees.

---

## 2. Platform Architecture & Core Products

Craftor operates as a cohesive tripartite platform:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CRAFTOR ECOSYSTEM                                      │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ 1. WORDPRESS PLUGIN      │ 2. UNIVERSAL MCP SERVER  │ 3. CRAFTOR SAAS DASHBOARD        │
│    (craftor-core / pro)  │    (Local & Cloud Engine)│    (Central Control Plane)       │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ • Transaction Engine     │ • stdio Transport Daemon │ • Multi-Site Management Hub      │
│ • Elementor AST Bridge   │ • SSE & WebSocket Bridge │ • Token Gateway (BYOK & Managed) │
│ • WooCommerce Controllers│ • Schema Validator Engine│ • License & Seat Activation      │
│ • Local Snapshot DB      │ • Token Budget Optimizer │ • Activity Logs & Visual Diffs   │
│ • WP-CLI Command Suite   │ • Dynamic Tool Registry  │ • Usage Telemetry & Analytics    │
│ • Webhook & Event Router │ • 200+ Tool Handlers     │ • Auto-Update Distribution       │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

### 2.1 Product 1: The WordPress Plugin (`craftor-core` & `craftor-pro`)

- **Role:** The in-WordPress execution and mutation engine.
- **Key Components:**
  - **Transactional Mutation Guard:** Wraps every AI modification in a micro-checkpoint (`wp_posts`, `_elementor_data`, `wp_postmeta`, options). Enables instant one-click or automated rollbacks on validation errors.
  - **Elementor AST Engine:** Parses, validates, translates, and injects Elementor Containers, Widgets, Global Kits, and Dynamic Tags directly into the active editor canvas or database without layout corruption.
  - **WooCommerce Action Layer:** Atomic operations for catalog orchestration, inventory balancing, order handling, coupon rules, and checkout layout customizations.
  - **Local Security Perimeter:** Enforces WordPress capability checks (`manage_options`, `edit_posts`), nonce verification, and application password hashing.
  - **Live Canvas Bridge:** Marionette/Backbone event bus hooking into the active Elementor preview iframe for sub-second visual updates during AI generation.

### 2.2 Product 2: The Universal MCP Platform

- **Role:** The protocol gateway, translation matrix, and client transport manager.
- **Key Components:**
  - **Multi-Transport Runtime:** Supports high-performance local `stdio` (for CLI tools like Claude Code, Cursor, Codex) and remote `SSE` / WebSockets (for cloud IDEs, remote servers, web clients).
  - **Dynamic Tool Registry (200+ Tools):** Context-aware tool indexing that serves only relevant tools to the connected model, preventing prompt bloat and context window saturation.
  - **Response Formatter & Schema Enforcer:** Verifies all model payloads against strict JSON schemas before dispatching them to the WordPress REST API bridge.
  - **Multi-Client Adapters:** Out-of-the-box configuration generators for Claude Desktop (`claude_desktop_config.json`), Cursor (`.cursor/mcp.json`), Antigravity, VS Code, Gemini, and OpenAI clients.

### 2.3 Product 3: The SaaS Cloud Dashboard

- **Role:** Centralized multi-site orchestration, AI gateway, billing, licensing, and telemetry control plane.
- **Key Components:**
  - **Multi-Site Estate Manager:** Single-pane-of-glass management for hundreds of connected client sites, staging environments, and WordPress Multisite (WPMU) networks.
  - **Dual AI Gateway Engine:**
    - _Mode 1 (BYOK - Bring Your Own API Key):_ Client provides OpenAI, Anthropic, Gemini, OpenRouter, or local endpoint keys. Zero markup, client-direct billing.
    - _Mode 2 (Managed AI Services):_ Craftor Managed Credits model with high-availability smart routing across top-tier foundation models with automatic fallback.
  - **Licensing & Seat Management:** Cryptographic activation tokens, domain allowances, role-based access control (RBAC), and team workspace provisioning.
  - **Audit Trail & Visual Diff Hub:** Centralized history of every prompt, tool execution, JSON payload, and before/after layout screenshot across the entire site estate.
  - **Automated Over-The-Air (OTA) Updates:** Selective release channel management (Stable, Beta, Security Patches) deployed across managed sites.

---

## 3. Supported Ecosystems & Integrations

### 3.1 Supported AI Clients

1. **Claude Code** (CLI agent terminal integration)
2. **Claude Desktop** (Native MCP client with chat & artifact visualization)
3. **Cursor** (In-editor agent and composer with file/site context)
4. **Codex / Open-Agent CLIs** (Headless workflow execution)
5. **Antigravity** (Autonomous multi-step IDE workflows)
6. **VS Code** (Standard MCP client extensions)
7. **Gemini-Compatible Clients** (Google AI Studio, Vertex AI, Gemini agent wrappers)
8. **OpenAI-Compatible Clients** (OpenAI Assistants, LangChain, LlamaIndex, LiteLLM)

### 3.2 Supported AI Providers & Models

- **Anthropic:** Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus.
- **OpenAI:** GPT-4o, GPT-4o-mini, o1, o3-mini.
- **Google Gemini:** Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash/Pro.
- **OpenRouter:** Routing to 100+ open/proprietary models (DeepSeek V3/R1, Llama 3.3, Mistral Large).
- **Local / Private Models:** Ollama, vLLM, LM Studio, LocalAI via standard OpenAI-compatible endpoints.

### 3.3 Operating Modes

- **Mode 1: Bring Your Own API Key (BYOK):** Direct client-to-provider connectivity. API keys encrypted at rest with client-side or hardware KMS encryption. Zero token markup.
- **Mode 2: Managed AI Services:** Turnkey subscription or pay-as-you-go credit pool managed by Craftor. Includes intelligent fallback, context compression, and automatic model selection based on task complexity.

---

## 4. Key Functional Requirements & Capabilities

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           CRAFTOR FUNCTIONAL DOMAINS                                   │
├─────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ Core WordPress Ops      │ Elementor Layout & Design│ WooCommerce Storefront Ops        │
│ • CPT & Taxonomies      │ • Flexbox/Grid Containers│ • Product Catalog & Variants      │
│ • Post/Page Lifecycle   │ • Widget Parameter Tree  │ • Inventory & Stock Alerts        │
│ • Media & Asset Library │ • Global Colors & Fonts  │ • Order Tracking & Statuses       │
│ • Options & Transients  │ • Theme Builder Templates│ • Coupon & Dynamic Promotions     │
│ • WP-CLI Command Daemon │ • Live Canvas Injection  │ • Checkout & Cart Funnels         │
├─────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ Multi-Site & Enterprise │ Security & Auditing      │ SaaS Billing & Licensing          │
│ • WPMU Network Control  │ • Micro-Rollback Engine  │ • Stripe / LemonSqueezy Gateway   │
│ • Cross-Site Syncing    │ • App Password Security  │ • Domain License Activation       │
│ • Centralized Dashboard │ • Session Auditing       │ • Usage Metering & Quotas         │
│ • Role-Based Access     │ • Prompt Injection Guard │ • OTA Automated Updater           │
└─────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

### 4.1 WordPress Engine Requirements

- Full programmatic control over Posts, Pages, Custom Post Types (CPTs), Meta fields, and custom taxonomies.
- Media library upload, optimization, tagging, and alt-text generation.
- Menu creation, navigation tree manipulation, and widget area management.
- Safe options table manipulation with key-level allowlists.
- WP-CLI remote execution bridge for administrative automation.

### 4.2 Elementor Engine Requirements

- Complete bi-directional parsing and serialization of Elementor JSON AST (Abstract Syntax Tree).
- Native support for modern **Flexbox Containers** and **CSS Grid Containers** alongside legacy Section/Column models.
- Programmatic control over all core and Pro widgets (Heading, Text, Button, Image, Loop Grid, Form, Nav Menu, Portfolio, etc.).
- Global Kit manipulation: Reading and updating Global Colors, Global Fonts, Breakpoints, and Theme Styles.
- Real-time Canvas Sync: Live DOM/Canvas updates without requiring manual browser refreshes.

### 4.3 WooCommerce Engine Requirements

- Full product management: Simple, Variable, Grouped, External, and Subscription products.
- Batch inventory adjustments, pricing rules, tax classes, and shipping configurations.
- Order pipeline automation: Status updates, refund notes, shipping tracking injection.
- Promotion & coupon rule generation with date/usage limits.
- WooCommerce analytics querying (Revenue, AOV, Top Products, Return Rates).

### 4.4 Multi-Site & SaaS Management Requirements

- Manage independent standalone sites and WordPress Multisite (WPMU) networks from a unified dashboard.
- Batch cross-site operations: Push global templates, sync security patches, or execute bulk updates across 100+ domains.
- Role-based access control (Super Admin, Agency Admin, Site Editor, Read-Only Auditor).

### 4.5 Security, Reliability & Rollback Requirements

- **Zero-Trust Token Management:** Dynamic token generation with configurable expiration and fine-grained tool scopes.
- **Deterministic Snapshot & Rollback:** Every AI tool invocation that mutates data generates an atomic pre-state snapshot. Instant rollback available via MCP tool or WP Admin UI.
- **Prompt Injection & Destructive Action Safeguards:** Guardrails that require explicit confirmation flags for high-risk operations (e.g., permanent deletion, database drop, user demotion).

---

## 5. Non-Functional Requirements (NFRs)

| Parameter                    | Specification / Target                                                      |
| :--------------------------- | :-------------------------------------------------------------------------- |
| **Tool Execution Latency**   | $\le 80\text{ms}$ local execution overhead (excluding LLM generation time). |
| **Canvas Live-Sync Latency** | $\le 200\text{ms}$ from MCP tool response to Elementor canvas DOM mutation. |
| **Availability & Uptime**    | $99.95\%$ uptime for SaaS control plane and Managed AI Gateway.             |
| **PHP Compatibility**        | PHP 7.4 through PHP 8.3+ strictly validated.                                |
| **WordPress Compatibility**  | WordPress 6.0 through latest stable release (Multisite & Single Site).      |
| **Elementor Compatibility**  | Elementor Core 3.16+ and Elementor Pro 3.16+ (Containers & Legacy).         |
| **Security Standards**       | OWASP Top 10 compliance, AES-256 encryption at rest, TLS 1.3 in transit.    |
| **Token Efficiency**         | $\ge 40\%$ lower token payload compared to uncompressed JSON schema dumps.  |

---

## 6. Success Metrics & Key Performance Indicators (KPIs)

- **Time to First Page Build (TTFPB):** Reduce time to generate a production-ready, styled 5-section Elementor page from 45 minutes (manual) to $<90\text{ seconds}$ via AI.
- **Tool Invocation Accuracy Rate:** $>98.5\%$ first-pass success rate across benchmark prompt suites (Claude 3.5, GPT-4o).
- **Rollback Reliability:** $100\%$ zero-loss recovery on all rolled-back page revisions.
- **Multi-Client Adoption:** Zero configuration friction across all 8 target AI clients.
