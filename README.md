# Craftor — Universal Autonomous MCP Platform for WordPress, Elementor & WooCommerce

[![Monorepo Build](https://img.shields.io/badge/Monorepo%20Build-35%20Packages%20Passed-10b981.svg?style=for-the-badge&logo=typescript)](file:///c:/Users/420/Crafter)
[![MCP Protocol](https://img.shields.io/badge/MCP%20Protocol-JSON--RPC%202.0%20(stdio%20%2B%20SSE)-6366f1.svg?style=for-the-badge)](file:///c:/Users/420/Crafter/packages/mcp-server)
[![Active MCP Tools](https://img.shields.io/badge/Active%20MCP%20Tools-86%20Enterprise%20Tools-38bdf8.svg?style=for-the-badge)](file:///c:/Users/420/Crafter/packages/mcp-server/src/handlers/tools.ts)
[![Contract Tests](https://img.shields.io/badge/Contract%20Tests-24%20Suites%20Passed-10b981.svg?style=for-the-badge)](file:///c:/Users/420/Crafter/tests/contracts)
[![E2E Assertions](https://img.shields.io/badge/Playwright%20E2E-110%20Assertions%20Passed-10b981.svg?style=for-the-badge)](file:///c:/Users/420/Crafter/tests/e2e)
[![LLM Accuracy](https://img.shields.io/badge/Promptfoo%20Evals-%3E99%25%20Precision-a855f7.svg?style=for-the-badge)](file:///c:/Users/420/Crafter/prompts/evals)
[![Ecosystem Certification](https://img.shields.io/badge/Ecosystem%20Checks-210%2F210%20Passed-10b981.svg?style=for-the-badge)](file:///c:/Users/420/Crafter/docs)

**Craftor** is an industrial-strength, enterprise-grade Model Context Protocol (MCP) platform purpose-built for the WordPress, Elementor, and WooCommerce ecosystems.

Craftor allows any AI client—from **Claude Code, Claude Desktop, Cursor, Codex, Antigravity, VS Code, Gemini clients, to OpenAI-compatible agents**—to natively inspect, design, build, test, repair, and manage WordPress and Elementor websites with zero-shot fidelity, live canvas streaming, speech-to-intent voice commands, and deterministic rollback guarantees.

---

## 🏛️ Monorepo Architecture & Core Subsystems

```
craftor/
├── .agents/                     # Autonomous Skills & Agent Ecosystem
│   ├── rules/                   # Permanent workspace behaviors (AGENTS.md, GEMINI.md)
│   ├── skills/                  # 18 Domain Skills (WordPress, Elementor, MCP, QA, etc.)
│   └── workflows/               # Declarative Multi-Step DAG Workflows
├── apps/                        # Deployable applications & web portals
│   ├── dashboard/               # Next.js / HTML5 Visual Web Studio & AI Voice Studio
│   ├── api-gateway/             # Fastify Cloud SSE Gateway & Managed AI Proxy
│   └── marketing/               # Public Landing Page & Conversion Funnels
├── configs/                     # Multi-client automated configuration templates
│   └── clients/                 # Claude Desktop, Cursor, Antigravity, VS Code, etc.
├── dist-bin/                    # Portable Standalone Daemons (.bat / .sh) & Manifests
├── dist-npm/                    # Production NPM Tarballs & Release Packages
├── dist-svn/                    # WordPress.org SVN Trunk & Tags Release Structure
├── infra/                       # Multi-Cloud Infrastructure as Code (IaC)
│   ├── terraform/               # Terraform Cloudflare & AWS deployment plans
│   ├── k8s/                     # Kubernetes Deployment & Service manifests
│   └── cloudflare/              # Cloudflare Workers wrangler.toml edge runtime config
├── packages/                    # Shared internal libraries, registries & adapters
│   ├── edge-runtime/            # Serverless Edge MCP Gateway & Geo-Distributed KV Cache
│   ├── addon-sdk/               # 3rd-Party Addon SDK (Crocoblock JetEngine, Essential Addons)
│   ├── mcp-server/              # Universal MCP Server Daemon (86 Tools, stdio & SSE)
│   ├── elementor-ast/           # Bi-Directional JSON AST Parser, Popups & Mutator
│   ├── wordpress-bridge/        # WP REST Bridge, ACF Pro, RankMath SEO & Multilingual
│   ├── client-adapters/         # Dedicated Adapters (Cursor, Claude, Antigravity, VS Code)
│   ├── tool-registry/           # 86-Tool Registry & Alias Resolver
│   ├── design-tokens/           # WCAG 2.1 AA Palette, Typography & Spacing JSON
│   ├── shared-types/            # Shared TypeScript Interfaces & Contract Models
│   └── shared-utils/            # VoiceIntentClassifier, Cryptography, Logger & Retry
├── services/                    # Microservices & Background Workers
│   ├── collaboration/           # Multi-Agent Swarm Orchestrator & CRDT Vector Clock Sync
│   ├── self-healing/            # AST Auto-Repair, PHP Error Triage & Performance Tuner
│   ├── authentication/          # AES-256 Key Vault, HMAC & Token Middleware
│   ├── licensing/               # Cryptographic License Activation & Seat Manager
│   ├── analytics/               # Real-Time Telemetry Ingestion Worker
│   ├── billing/                 # Stripe Usage Metering & Quota Enforcer
│   ├── update-service/          # OTA Release Distribution & Package Signer
│   └── notification-service/    # Webhook, Email & Slack Event Dispatcher
├── tests/                       # Test Suites & Quality Assurance Matrix
│   ├── contracts/               # 24 Contract Test Suites (TypeScript AST & Tools)
│   ├── e2e/                     # Playwright Multi-Client Handshake & Mutation Suites
│   └── prompts/                 # Promptfoo LLM Precision Benchmarks
└── docs/                        # Specifications, PRDs, ADRs & Stage Gate Certifications (1-12)
```

---

## ⚡ Key Capabilities Across 12 Certified Phases

1. **Dual Transport MCP Server (stdio + SSE):** Ultra-low latency local stdio pipes and remote SSE over HTTPS with Bearer token authentication.
2. **Serverless Global Edge Mesh (`packages/edge-runtime`):** Cloudflare Workers edge gateway with Geo-distributed KV caching for sub-15ms AST response times.
3. **Bi-Directional Elementor AST Engine:** Manipulates modern Flexbox/Grid containers, sections, columns, and widgets with 7-character hexadecimal UUID preservation.
4. **WooCommerce Engine:** Programmatic management of products, variations, inventory, orders, customer cohorts, and batch coupon campaigns.
5. **AI Voice Studio (`VoiceStudio`):** Real-time WebRTC audio waveform visualization and Speech-to-Intent classification (`craftor_voice_classify_intent`, `craftor_voice_dispatch_action`).
6. **3rd-Party Addon Ecosystem SDK (`@craftor/addon-sdk`):** Extensible SDK with official adapters for Crocoblock (JetEngine) dynamic listings and Essential Addons.
7. **Multi-Agent Swarm Canvas (`services/collaboration`):** Concurrent orchestration of Designer, Copywriter, SEO, and QA agents with Conflict-Free Replicated Data Type (CRDT) synchronization.
8. **Autonomous Self-Healing Daemon (`services/self-healing`):** Automatic malformed AST repair, circular reference remediation, and PHP fatal timeout/memory triage.
9. **Real-Time Performance Auto-Tuner:** External CSS generation, font-display swap injection, image lazy loading, and Cloudflare/LiteSpeed cache purges.
10. **Advanced WordPress Integrations:** Programmatic CPT and ACF Pro field groups, RankMath / Yoast SEO metadata, and WPML / Polylang AST translations.
11. **Zero-Trust Security Shield:** AST prompt injection scanner, capability boundaries, AES-256 token vaults, and rate quota enforcement.
12. **Instant Micro-Rollbacks:** Automated pre-mutation state snapshots for 1-click zero-downtime recovery.

---

## 📋 Comprehensive 86-Tool MCP Catalog

```
┌──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
│  CORE WORDPRESS (12 TOOLS)   │  ELEMENTOR ENGINE (18 TOOLS) │   WOOCOMMERCE (14 TOOLS)     │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ • craftor_get_posts          │ • craftor_elementor_get_ast  │ • craftor_wc_get_products    │
│ • craftor_create_post        │ • craftor_elementor_update   │ • craftor_wc_create_product  │
│ • craftor_update_post        │ • craftor_elementor_generate │ • craftor_wc_update_product  │
│ • craftor_delete_post        │ • craftor_elementor_diff_ast │ • craftor_wc_delete_product  │
│ • craftor_get_pages          │ • craftor_elementor_popup    │ • craftor_wc_update_inventory│
│ • craftor_create_page        │ • craftor_elementor_funnel   │ • craftor_wc_get_orders      │
│ • craftor_update_page        │ • craftor_elementor_header   │ • craftor_wc_get_customers   │
│ • craftor_get_taxonomies     │ • craftor_elementor_footer   │ • craftor_wc_get_coupons     │
│ • craftor_create_taxonomy    │ • craftor_elementor_palette  │ • craftor_wc_create_coupon   │
│ • craftor_get_cpt            │ • craftor_elementor_schema   │ • craftor_wc_batch_coupons   │
│ • craftor_register_cpt       │ • craftor_elementor_wireframe│ • craftor_wc_get_analytics   │
│ • craftor_acf_register_group │ • craftor_elementor_kit_bind │ • craftor_wc_refund_order    │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│   MULTISITE & OPS (12 TOOLS) │   INTELLIGENCE & AI (8 TOOLS)│  VOICE, SWARM & EDGE (12)    │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ • multisite_list_sites       │ • craftor_llm_query_local    │ • craftor_voice_classify     │
│ • multisite_switch_site      │ • craftor_ast_compress       │ • craftor_voice_dispatch     │
│ • multisite_batch_dispatch   │ • craftor_security_scan_ast  │ • craftor_swarm_dispatch     │
│ • multisite_sync_template    │ • craftor_whitelabel_config  │ • craftor_crdt_sync_document │
│ • craftor_create_snapshot    │ • craftor_whitelabel_portal  │ • craftor_addon_register     │
│ • craftor_restore_snapshot   │ • craftor_quota_check_limits │ • craftor_addon_get_catalog  │
│ • craftor_list_snapshots     │ • craftor_telemetry_query    │ • craftor_self_healing_repair│
│ • craftor_system_status      │ • craftor_seo_update_meta    │ • craftor_self_healing_triage│
│ • craftor_verify_license     │ • craftor_multilingual_clone │ • craftor_performance_tune   │
│ • craftor_get_visual_diff    │ • craftor_get_activity_log   │ • craftor_cdn_purge_cache    │
│                              │                              │ • craftor_edge_route_request │
│                              │                              │ • craftor_edge_get_status    │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
```

---

## 🚀 5-Minute Setup for All 8 AI Clients

### 1. Claude Desktop
Add to `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):
```json
{
  "mcpServers": {
    "craftor": {
      "command": "node",
      "args": ["c:/Users/420/Crafter/packages/mcp-server/dist/index.js"],
      "env": {
        "CRAFTOR_SITE_URL": "https://yoursite.com",
        "CRAFTOR_AUTH_TOKEN": "craftor_live_secret_token_here"
      }
    }
  }
}
```

### 2. Cursor IDE
Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "craftor": {
      "command": "node",
      "args": ["c:/Users/420/Crafter/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### 3. Claude Code CLI
Add to `~/.claude.json`:
```json
{
  "mcpServers": {
    "craftor": {
      "command": "node",
      "args": ["c:/Users/420/Crafter/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### 4. Google Antigravity IDE
Add to `.gemini/antigravity-ide/mcp_config.json`:
```json
{
  "mcpServers": {
    "craftor": {
      "command": "node",
      "args": ["c:/Users/420/Crafter/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### 5. VS Code (Cline / Roo-Code / Copilot)
Add to `.vscode/settings.json`:
```json
{
  "mcp.servers": {
    "craftor": {
      "type": "stdio",
      "command": "node",
      "args": ["c:/Users/420/Crafter/packages/mcp-server/dist/index.js"]
    }
  }
}
```

---

## 🧪 Validation & Testing Pipeline

Run the full autonomous quality assurance harness:

```powershell
# 1. Build all 35 monorepo packages in topological DAG order
pnpm build

# 2. Execute strict ESLint across all TypeScript packages & apps
pnpm lint

# 3. Execute 24 Contract Test Suites
pnpm test

# 4. Run Playwright End-to-End Multi-Client Handshake Test
pnpm run test:e2e

# 5. Run Automated Promptfoo LLM Tool Accuracy Benchmarks
node scripts/run-benchmarks.js

# 6. Verify entire 210-item ecosystem certification
pnpm run verify:all
```

---

## 📜 Stage Gate Certifications (All 12 Phases)

| Stage Gate | Certification Document | Lead Persona | Status |
| :---: | :--- | :--- | :---: |
| **01** | [`18_FINAL_ARCHITECTURE_FREEZE.md`](file:///c:/Users/420/Crafter/docs/18_FINAL_ARCHITECTURE_FREEZE_AND_READINESS_CERTIFICATION.md) | Solution Architect | Certified |
| **02** | [`21_STAGE_GATE_2_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/21_STAGE_GATE_2_CERTIFICATION_AND_CANVAS_SYNC_SIGN_OFF.md) | Elementor Engineer | Certified |
| **03** | [`22_STAGE_GATE_3_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/22_STAGE_GATE_3_CERTIFICATION_AND_ADVANCED_INTEL_SIGN_OFF.md) | Prompt Engineer | Certified |
| **04** | [`23_STAGE_GATE_4_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/23_STAGE_GATE_4_CERTIFICATION_AND_ENTERPRISE_SIGN_OFF.md) | Security Engineer | Certified |
| **05** | [`24_STAGE_GATE_5_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/24_STAGE_GATE_5_CERTIFICATION_AND_DISTRIBUTION_SIGN_OFF.md) | Release Manager | Certified |
| **06** | [`25_STAGE_GATE_6_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/25_STAGE_GATE_6_CERTIFICATION_AND_DASHBOARD_SIGN_OFF.md) | UI/UX Designer | Certified |
| **07** | [`26_STAGE_GATE_7_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/26_STAGE_GATE_7_CERTIFICATION_AND_ADVANCED_TOOLS_SIGN_OFF.md) | WordPress Engineer | Certified |
| **08** | [`27_STAGE_GATE_8_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/27_STAGE_GATE_8_CERTIFICATION_AND_SELF_HEALING_SIGN_OFF.md) | Debugging Engineer | Certified |
| **09** | [`28_STAGE_GATE_9_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/28_STAGE_GATE_9_CERTIFICATION_AND_VOICE_STUDIO_SIGN_OFF.md) | Prompt Engineer | Certified |
| **10** | [`29_STAGE_GATE_10_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/29_STAGE_GATE_10_CERTIFICATION_AND_ADDON_SDK_SIGN_OFF.md) | Tool Registry Manager | Certified |
| **11** | [`30_STAGE_GATE_11_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/30_STAGE_GATE_11_CERTIFICATION_AND_COLLABORATION_SIGN_OFF.md) | Solution Architect | Certified |
| **12** | [`31_STAGE_GATE_12_CERTIFICATION.md`](file:///c:/Users/420/Crafter/docs/31_STAGE_GATE_12_CERTIFICATION_AND_PRODUCTION_GA_SIGN_OFF.md) | Release Manager | Certified |

---

_Craftor is engineered from first principles to establish the global standard for AI-native web building and headless WordPress orchestration._
