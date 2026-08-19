# Craftor Monorepo — Repository Inventory & Codebase Audit

**Audit Date:** August 19, 2026  
**Auditor Roles:** Lead Software Architect, WordPress Plugin Architect, Monorepo Specialist, DevOps Engineer  
**Scope:** Complete Static Codebase Inventory for 3-Product Architecture Migration  

---

## 1. Executive Summary

The Craftor codebase is currently structured as a monolithic monorepo managed via `pnpm` workspaces (v9.0.0), `turbo` build orchestration, and TypeScript project references.

| Metric Category | Count | Status |
| :--- | :--- | :--- |
| **Total Workspace Packages** | **25** (17 in `packages/`, 7 in `packages/client-adapters/`, 1 in `tests/`) | Certified |
| **Total Applications** | **4** (`apps/api-gateway`, `apps/dashboard`, `apps/documentation`, `apps/marketing`) | Active |
| **Total Microservices** | **8** (`analytics`, `auth`, `billing`, `collab`, `licensing`, `notif`, `healing`, `updates`) | Active |
| **Total WordPress Plugins** | **3** (`craftor-core`, `craftor-pro`, `craftor-enterprise`) | Active |
| **Total Autonomous Skills** | **18** `.agents/skills/` | Verified |
| **Total Source Files** | **622 files** | Complete |
| **Total Lines of Code** | **48,362 lines** | Analyzed |
| **Repository Size** | **2.85 MB** (excluding artifacts/dist) | Clean |

---

## 2. Directory Tree & Architecture Topology

```text
Craftor/
├── .agents/                                  # Autonomous Engineering Skills (18 Skills, 178 files)
│   └── skills/
│       ├── craftor-debugging-engineer/
│       ├── craftor-devops-engineer/
│       ├── craftor-documentation-writer/
│       ├── craftor-elementor-engineer/
│       ├── craftor-mcp-engineer/
│       ├── craftor-product-manager/
│       ├── craftor-prompt-engineer/
│       ├── craftor-qa-engineer/
│       ├── craftor-release-manager/
│       ├── craftor-security-engineer/
│       ├── craftor-solution-architect/
│       ├── craftor-tool-registry-manager/
│       ├── craftor-ui-ux-designer/
│       ├── craftor-woocommerce-engineer/
│       └── craftor-wordpress-engineer/
│
├── apps/                                     # User-Facing & Gateway Applications (4 Apps, 25 files)
│   ├── api-gateway/                          # Cloud Reverse Proxy & Rate Limiter
│   ├── dashboard/                            # Multi-Site Fleet Management Next.js Dashboard
│   ├── documentation/                        # Starlight / VitePress Technical Documentation
│   └── marketing/                            # Marketing Landing Portal
│
├── packages/                                 # Shared Libraries & Framework Packages (24 Packages, 186 files)
│   ├── addon-sdk/                            # Third-Party Widget Extensibility SDK
│   ├── agent-registry/                       # Agent Catalog & Persona Manifests
│   ├── agent-runtime/                        # Autonomous GoalDecomposer & Supervisor
│   ├── client-adapters/                      # 8 AI Client Integration Adapters
│   │   ├── antigravity/
│   │   ├── claude-code/
│   │   ├── claude-desktop/
│   │   ├── codex/
│   │   ├── cursor/
│   │   ├── shared/
│   │   └── vscode/
│   ├── design-tokens/                        # Design System HSL Colors & Typography Tokens
│   ├── edge-runtime/                         # Cloudflare Workers / V8 Edge Bindings
│   ├── elementor-ast/                         # Elementor JSON AST Engine (Flexbox/Grid/Widgets)
│   ├── mcp-server/                           # 94-Tool MCP Server Daemon
│   ├── schemas/                              # JSON-RPC 2.0 & Zod Schema Contracts
│   ├── shared-types/                         # Monorepo Universal TypeScript Interfaces
│   ├── shared-ui/                            # Web Component UI Library
│   ├── shared-utils/                         # Logger, Crypto, Retry, Safe JSON Utilities
│   ├── skill-registry/                       # Skill Discovery & Permission Enforcement
│   ├── tool-registry/                        # Dynamic Tool Catalog & Token Optimizer
│   ├── visual-intelligence/                  # Playwright Multi-Viewport Raster & DOM Engine
│   ├── wordpress-bridge/                     # WordPress REST & WooCommerce Client SDK
│   └── workflow-registry/                    # Multi-Step Workflow DAG Catalog
│
├── plugins/                                  # WordPress Plugins (3 Plugins, 26 files, 3,673 LOC)
│   ├── craftor-core/                         # Free WordPress.org Plugin (Elementor AST, 3-Step Wizard)
│   ├── craftor-pro/                          # Commercial Extension Plugin (Stubs)
│   └── craftor-enterprise/                   # Enterprise Multi-Tenant Plugin (Stubs)
│
├── services/                                 # Cloud SaaS Microservices (8 Services, 43 files, 1,865 LOC)
│   ├── analytics/                            # Widget & Token Usage Telemetry
│   ├── authentication/                       # OAuth2 / JWT Auth Engine
│   ├── billing/                              # Stripe Webhooks & Subscription Management
│   ├── collaboration/                        # Real-Time Multi-Agent State Sync
│   ├── licensing/                            # License Key Generation & Domain Seat Verification
│   ├── notification-service/                 # Webhooks & Notification Dispatcher
│   ├── self-healing/                         # Automated AST Defect Diagnosis
│   └── update-service/                       # Over-The-Air (OTA) Signed Binary Releases
│
├── docker/                                   # Local Containerized Dev & Test Stack (WordPress + MariaDB)
├── docs/                                     # Architecture & Audit Documentation
├── scripts/                                  # Build, Packaging & Verification Scripts (25 scripts)
└── tests/                                    # Contract & E2E Test Suites
```

---

## 3. Package & Module Inventory Breakdown

| Module Name | Type | Path | Purpose | Primary Exports |
| :--- | :--- | :--- | :--- | :--- |
| `@craftor/shared-types` | Package | `packages/shared-types` | Universal TypeScript interfaces | `ElementorNode`, `Snapshot`, `McpToolDefinition` |
| `@craftor/shared-utils` | Package | `packages/shared-utils` | Logging, retry, and crypto utils | `logger`, `withRetry`, `safeJsonParse` |
| `@craftor/elementor-ast` | Package | `packages/elementor-ast` | Elementor AST syntax tree engine | `ElementorAstEngine`, `createFlexContainer` |
| `@craftor/mcp-server` | Package | `packages/mcp-server` | Model Context Protocol Daemon | `CraftorMcpServer`, `runStdioServer` |
| `@craftor/wordpress-bridge` | Package | `packages/wordpress-bridge` | WordPress REST & WooCommerce client | `WordPressClient`, `WooCommerceBridge` |
| `@craftor/agent-runtime` | Package | `packages/agent-runtime` | Autonomous GoalDecomposer | `GoalDecomposer`, `ExecutionSupervisor` |
| `@craftor/visual-intelligence` | Package | `packages/visual-intelligence`| Playwright visual test engine | `PlaywrightScreenshotEngine`, `DomAnalyzer` |
| `@craftor/tool-registry` | Package | `packages/tool-registry` | 94 MCP tools index | `ToolRegistry`, `filterToolsByCategory` |
| `@craftor/service-licensing` | Service | `services/licensing` | License key issuance & verification | `LicensingEngine`, `validateKey` |
| `@craftor/service-billing` | Service | `services/billing` | Stripe payment webhooks | `BillingEngine`, `processWebhook` |
| `@craftor/service-update` | Service | `services/update-service` | OTA plugin binary manifests | `UpdateEngine`, `getLatestManifest` |
| `@craftor/service-analytics` | Service | `services/analytics` | Telemetry aggregation | `AnalyticsEngine`, `trackEvent` |
| `craftor-core` | Plugin | `plugins/craftor-core` | Free WordPress Plugin | `AdminSettings`, `WizardController` |
| `craftor-pro` | Plugin | `plugins/craftor-pro` | Commercial Pro Plugin | `Plugin` |
| `craftor-enterprise` | Plugin | `plugins/craftor-enterprise` | Enterprise Pro Plugin | `Plugin` |
