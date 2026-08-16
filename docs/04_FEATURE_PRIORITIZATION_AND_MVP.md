# Craftor — Feature Prioritization & MVP Scope

**Document ID:** FEAT-2026-001  
**Project Name:** Craftor  
**Version:** 1.0.0

---

## 1. Prioritization Framework & Methodology

Features for Craftor are scored using the **RICE** framework:
$$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$

- **Reach:** Estimated number of target users/sites impacted per quarter (Scale 1–10).
- **Impact:** Direct effect on user productivity, reliability, or revenue (0.5 = Minimal, 1 = Moderate, 2 = High, 3 = Massive).
- **Confidence:** Certainty in technical feasibility and user demand percentage (50% to 100%).
- **Effort:** Estimated engineering sprint person-weeks (1 = Low, 5 = Heavy).

---

## 2. MoSCoW Prioritization & RICE Scoring Matrix

| Feature Area            | Specific Capability                                              | RICE Score |   MoSCoW Tier   | Target Release |
| :---------------------- | :--------------------------------------------------------------- | :--------: | :-------------: | :------------: |
| **Core MCP Engine**     | JSON-RPC 2.0 stdio & SSE Transports with tool schema validation  |  **180**   |  **Must Have**  |   MVP (v1.0)   |
| **Elementor Engine**    | Flexbox & Grid Container AST parser & atomic widget injection    |  **160**   |  **Must Have**  |   MVP (v1.0)   |
| **Safety Engine**       | Transactional snapshot & 1-click micro-rollback system           |  **150**   |  **Must Have**  |   MVP (v1.0)   |
| **AI Client Adapters**  | 1-Click configs for Claude, Cursor, Antigravity, VS Code, OpenAI |  **140**   |  **Must Have**  |   MVP (v1.0)   |
| **Dual AI Modes**       | Mode 1 (BYOK - Anthropic/OpenAI/Gemini) & Mode 2 (Managed)       |  **135**   |  **Must Have**  |   MVP (v1.0)   |
| **WP Content Core**     | CPT, Pages, Posts, Meta & Taxonomy CRUD toolset                  |  **120**   |  **Must Have**  |   MVP (v1.0)   |
| **Elementor Styling**   | Global Kit (Colors, Fonts, Theme Styles) reader & mutator        |  **110**   |  **Must Have**  |   MVP (v1.0)   |
| **WooCommerce Core**    | Products, Variants, Inventory, Orders, and Coupon tools          |  **105**   |  **Must Have**  |   MVP (v1.0)   |
| **SaaS Dashboard**      | Multi-site registry, license token management & audit log        |   **95**   |  **Must Have**  |   MVP (v1.0)   |
| **Live Canvas Sync**    | Real-time Elementor Editor JS canvas preview injection           |   **85**   | **Should Have** | Phase 2 (v1.1) |
| **Visual Diff Viewer**  | Side-by-side Before/After screenshot comparison overlay          |   **80**   | **Should Have** | Phase 2 (v1.1) |
| **Multi-Site (WPMU)**   | WordPress Multisite network-level bulk campaign dispatcher       |   **70**   | **Should Have** | Phase 2 (v1.2) |
| **Local Model Bridge**  | Zero-latency stdio bridge to Ollama, LM Studio, and vLLM         |   **65**   | **Should Have** | Phase 2 (v1.2) |
| **OTA Auto-Updater**    | Cryptographically signed Over-The-Air plugin auto-updates        |   **60**   | **Could Have**  | Phase 3 (v2.0) |
| **Addon Extensibility** | Public SDK for 3rd-party Elementor addon widget schemas          |   **50**   | **Could Have**  | Phase 3 (v2.0) |
| **Voice/Audio Prompts** | Direct speech-to-layout generation in SaaS dashboard             |   **25**   | **Won't Have**  |   Post-v2.0    |

---

## 3. Strict MVP Scope Definition (Version 1.0.0)

The MVP is engineered to deliver immediate, unquestionable superiority over legacy alternatives (such as EMCP or Novamira) in reliability, speed, and cross-client compatibility.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CRAFTOR MVP 1.0 BOUNDARY                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ INCLUDED IN MVP (v1.0):                                                                │
│                                                                                        │
│ [1] Core WordPress Plugin (`craftor-core`):                                            │
│     • Complete WP REST API Bridge with Application Password / Token security.          │
│     • Transactional Safety Engine: auto-snapshots before every AI write operation.     │
│     • Full Post, Page, CPT, Category, Tag, and Postmeta manipulation tools.            │
│                                                                                        │
│ [2] Elementor Engine (AST & Widgets):                                                  │
│     • Bi-directional AST parser for modern Flexbox Containers & standard Widgets.      │
│     • Read/Write access to Elementor Global Kits (Colors, Typography, Theme Styles).   │
│     • CSS cache purge and regeneration engine.                                         │
│                                                                                        │
│ [3] WooCommerce Engine:                                                                │
│     • Atomic tools for Products (Simple/Variable), Categories, Coupons, and Orders.    │
│                                                                                        │
│ [4] Universal MCP Server Daemon:                                                       │
│     • High-performance `stdio` and `SSE` transport layers.                             │
│     • Out-of-the-box support for Claude Desktop, Claude Code, Cursor, Antigravity,     │
│       VS Code, Gemini, and OpenAI-compatible clients.                                  │
│     • Catalog of 200+ atomic and compound tools.                                       │
│                                                                                        │
│ [5] SaaS Control Plane & Licensing:                                                    │
│     • Centralized dashboard for site connections, API key storage (BYOK), license      │
│       activation, and audit logging of all AI tool executions.                         │
│                                                                                        │
│ ────────────────────────────────────────────────────────────────────────────────────── │
│ EXCLUDED FROM MVP (Deferred to v1.1+):                                                 │
│     • Real-time WebSocket live-canvas injection (v1.0 uses post-mutation sync).       │
│     • Native third-party Elementor addon auto-discovery (v1.0 supports Core/Pro).      │
│     • Multi-tenant billing sub-accounts for agency reselling (v1.0 has standard seats).│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. MVP Definition of Done (DoD)

To certify the MVP for public launch, the platform must satisfy the following deterministic criteria:

1. **Protocol Compliance:** Passes 100% of the official Model Context Protocol (MCP) conformance tests.
2. **Client Validation:** Verified 1-click connection and successful tool execution across all 8 target AI clients.
3. **Safety & Zero-Data-Loss:** 1,000 automated destructive-action tests executed; 100% successfully rolled back via snapshot restoration with zero database corruption.
4. **Performance Benchmark:** Sub-80ms internal tool execution overhead on standard shared hosting environments (PHP 8.1+).
5. **Documentation Quality:** Complete copy-pasteable 5-minute setup guides for every supported AI client and an exhaustive API catalog for all 200+ tools.
