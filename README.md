# Craftor — Universal MCP Platform for WordPress, Elementor & WooCommerce

**Craftor** is an industrial-strength, enterprise-grade Model Context Protocol (MCP) platform purpose-built for the WordPress, Elementor, and WooCommerce ecosystems.

Craftor allows any AI client—from **Claude Code, Claude Desktop, Cursor, Codex, Antigravity, VS Code, Gemini clients, to OpenAI-compatible agents**—to natively inspect, design, build, test, and manage WordPress and Elementor websites with zero-shot fidelity, live canvas streaming, and deterministic rollback guarantees.

---

## 🏛️ Monorepo Architecture & Core Products

```
craftor/
├── .changeset/                  # Automated SemVer & changelog management
├── .github/workflows/           # CI, Release, Test Matrix, and OTA workflows
├── .husky/                      # Git hooks (pre-commit, commit-msg, pre-push)
├── .agents/                     # Unified AI Skills & Agent Ecosystem
│   ├── agents/                  # Autonomous Agent Personas (Designer, Dev, Ops, Security)
│   ├── workflows/               # Declarative Multi-Step DAG Workflows
│   ├── templates/               # Reusable AST Container Templates
│   ├── evals/                   # Benchmark Evaluation Suites
│   └── skills/                  # 15 Antigravity Skills (8 Standardized Files Each)
├── apps/                        # Deployable applications & web portals
│   ├── dashboard/               # Next.js 14 SaaS Control Plane (app.craftor.ai)
│   ├── api-gateway/             # Fastify Cloud SSE Gateway & Managed AI Proxy
│   ├── documentation/           # VitePress Developer Docs & 240-Tool Catalog
│   └── marketing/               # Next.js Marketing & Public Website
├── packages/                    # Shared internal libraries, registries & adapters
│   ├── mcp-server/              # Universal MCP Server Daemon (stdio & SSE)
│   ├── tool-registry/           # SSOT 240+ Versioned Tool Registry & Dynamic Filters
│   ├── skill-registry/          # 15 Antigravity Domain Skills & Benchmark Evals
│   ├── agent-registry/          # Autonomous AI Agent Persona Orchestrator
│   ├── workflow-registry/       # Declarative Multi-Step Workflow Engine
│   ├── schemas/                 # Dedicated JSON Schema Draft-07 Registry
│   ├── client-adapters/         # Dedicated Adapters (Cursor, Claude, Antigrav, VS Code, Codex)
│   ├── elementor-ast/           # TypeScript AST Parser, Flex/Grid Mutator & Validator
│   ├── design-tokens/           # Design Tokens (HSL Colors, Spacing, Typography JSON)
│   ├── shared-ui/               # React / Tailwind Design System Component Library
│   ├── shared-types/            # Shared TypeScript Interfaces & JSON Schemas
│   └── shared-utils/            # Cryptography, HTTP/2 Client, Formatters & Logger
├── plugins/                     # WordPress Plugins (PHP 8.1+ / Composer)
│   ├── craftor-core/            # Free Tier: 40 Core MCP Tools & Basic AST (WP.org)
│   ├── craftor-pro/             # Pro Tier: 160 Tools, Live Sync, WooCommerce & Themes
│   └── craftor-enterprise/      # Enterprise Tier: 240+ Tools, WPMU, KMS Vault & SDK
├── services/                    # Microservices & Background Workers
│   ├── authentication/          # OAuth2, JWT & Scoped Bearer Token Service
│   ├── licensing/               # Cryptographic License Activation & Seat Manager
│   ├── analytics/               # High-Throughput Telemetry Ingestion Worker
│   ├── billing/                 # Stripe Webhooks & Usage Metering Service
│   ├── update-service/          # OTA Release Distribution & Package Signer
│   └── notification-service/    # Webhook, Email & Slack Event Dispatcher
├── tests/                       # Global End-to-End & Integration Test Suites
│   ├── contracts/               # JSON-RPC, MCP & Tool Schema Contract Tests
│   ├── e2e/                     # Playwright Multi-Client Browser Tests
│   ├── visual/                  # Pixelmatch Canvas Visual Regression Baselines
│   ├── prompts/                 # Promptfoo / DeepEval Automated Benchmark Evals
│   └── mocks/                   # Deterministic JSON Fixtures for AI Clients
├── docker/                      # Virtualized Multi-Version Testing Environments
│   ├── docker-compose.yml       # Local & CI Multi-Container Test Matrix
│   └── Dockerfile.php82         # Docker image for PHP 8.2-cli test bed
├── docs/                        # Specifications, PRDs, ADRs (001-004), Architecture
├── scripts/                     # verify-monorepo.js test suite & helper scripts
├── pnpm-workspace.yaml          # Workspace package boundary definitions
└── turbo.json                   # Turborepo task pipeline caching configuration
```

---

## 📑 Master Architecture & Blueprint Index

| # | Document Title | Description | Link |
| :-: | :--- | :--- | :--- |
| **01** | **Product Requirements Document (PRD)** | Complete functional requirements, non-functional performance specs, and KPIs. | [01_PRODUCT_REQUIREMENTS_DOCUMENT.md](file:///c:/Users/420/Crafter/docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md) |
| **02** | **User Personas** | 5 detailed persona profiles across Agencies, Visual Builders, Devs, and Enterprises. | [02_USER_PERSONAS.md](file:///c:/Users/420/Crafter/docs/02_USER_PERSONAS.md) |
| **03** | **User Journeys** | End-to-end lifecycle flows, sequence diagrams, and safe rollback workflows. | [03_USER_JOURNEYS.md](file:///c:/Users/420/Crafter/docs/03_USER_JOURNEYS.md) |
| **04** | **Feature Prioritization & MVP Scope** | MoSCoW tiering, RICE scoring matrix, and strict MVP v1.0 Definition of Done. | [04_FEATURE_PRIORITIZATION_AND_MVP.md](file:///c:/Users/420/Crafter/docs/04_FEATURE_PRIORITIZATION_AND_MVP.md) |
| **05** | **Product Roadmap** | 4-Quarter strategic roadmap from MVP Core Launch to Enterprise Ecosystem. | [05_PRODUCT_ROADMAP.md](file:///c:/Users/420/Crafter/docs/05_PRODUCT_ROADMAP.md) |
| **06** | **Team Responsibilities & Phases** | 10 specialized AI teams, cross-functional RACI matrix, and 5 Stage Gates. | [06_TEAM_RESPONSIBILITIES_AND_PHASES.md](file:///c:/Users/420/Crafter/docs/06_TEAM_RESPONSIBILITIES_AND_PHASES.md) |
| **07** | **200+ MCP Tools Catalog** | Complete taxonomy and specifications for **240 specialized active tools**. | [07_200_PLUS_MCP_TOOLS_CATALOG.md](file:///c:/Users/420/Crafter/docs/07_200_PLUS_MCP_TOOLS_CATALOG.md) |
| **08** | **Skill Factory Roadmap** | Comprehensive master blueprint for all 15 skills. | [08_SKILL_FACTORY_ROADMAP.md](file:///c:/Users/420/Crafter/docs/08_SKILL_FACTORY_ROADMAP.md) |
| **09** | **Skills Audit & Collaboration Workflow** | Skills gap analysis, boundary disambiguation, optimized matrix & workflow. | [09_SKILLS_AUDIT_AND_OPTIMIZATION.md](file:///c:/Users/420/Crafter/docs/09_SKILLS_AUDIT_AND_OPTIMIZATION.md) |
| **10** | **Complete System Architecture Specification** | Exhaustive architecture spanning all 16 domains (Monorepo, MCP, AST, DB, APIs). | [10_SYSTEM_ARCHITECTURE_SPECIFICATION.md](file:///c:/Users/420/Crafter/docs/10_SYSTEM_ARCHITECTURE_SPECIFICATION.md) |
| **11** | **Architecture Review & Optimizations** | Strategic appraisal of the 8 review points, 4 registries, and 3-tier plugin architecture. | [11_ARCHITECTURE_REVIEW_AND_OPTIMIZATIONS.md](file:///c:/Users/420/Crafter/docs/11_ARCHITECTURE_REVIEW_AND_OPTIMIZATIONS.md) |
| **12** | **Complete UI/UX Workshop Specification** | Full wireframes, component trees, interaction specs across all 11 interfaces. | [12_UI_UX_WORKSHOP_SPECIFICATION.md](file:///c:/Users/420/Crafter/docs/12_UI_UX_WORKSHOP_SPECIFICATION.md) |
| **13** | **Complete Design System & Token Specification** | HSL color system (Light/Dark), type scale, component library & micro-interactions. | [13_DESIGN_SYSTEM_SPECIFICATION.md](file:///c:/Users/420/Crafter/docs/13_DESIGN_SYSTEM_SPECIFICATION.md) |
| **14** | **Complete Database Schema & DDL Deep-Dive** | Complete MySQL/MariaDB & PostgreSQL 16+ schemas, ERDs, and encryption policies. | [14_DATABASE_SCHEMA_SPECIFICATION.md](file:///c:/Users/420/Crafter/docs/14_DATABASE_SCHEMA_SPECIFICATION.md) |
| **15** | **Complete Monorepo & Workspace Scaffolding Spec**| Polyglot monorepo layout (`apps/`, `packages/`, `plugins/`, `services/`), Turbo pipelines. | [15_MONOREPO_WORKSPACE_SPECIFICATION.md](file:///c:/Users/420/Crafter/docs/15_MONOREPO_WORKSPACE_SPECIFICATION.md) |
| **16** | **Official Engineering Handbook & QA Test Harness**| Coding guidelines (TS & PHP), Git flow, Definition of Done, 4-tier testing & security. | [16_ENGINEERING_HANDBOOK_AND_STANDARDS.md](file:///c:/Users/420/Crafter/docs/16_ENGINEERING_HANDBOOK_AND_STANDARDS.md) |
| **17** | **Complete Sprint 1 Backlog & Execution Plan**| 8 Epics, 16 User Stories (80 SP), Gherkin acceptance, dependency DAG, risk matrix. | [17_SPRINT_1_BACKLOG_AND_EXECUTION_PLAN.md](file:///c:/Users/420/Crafter/docs/17_SPRINT_1_BACKLOG_AND_EXECUTION_PLAN.md) |
| **18** | **Final Architecture Freeze & Certification**| 100% Certified readiness report, MVP scope lock, risk & dependency matrix. | [18_FINAL_ARCHITECTURE_FREEZE_AND_READINESS_CERTIFICATION.md](file:///c:/Users/420/Crafter/docs/18_FINAL_ARCHITECTURE_FREEZE_AND_READINESS_CERTIFICATION.md) |
| **19** | **Day 1 Infrastructure Completion Report** | Verification audit report (208/208 checks passed), .agents integration, and tooling. | [19_DAY_1_INFRASTRUCTURE_COMPLETION_REPORT.md](file:///c:/Users/420/Crafter/docs/19_DAY_1_INFRASTRUCTURE_COMPLETION_REPORT.md) |
| **ADR** | **Architecture Decision Records (001–004)** | Dual DB (001), 4 Registries (002), Client Adapters (003), 3-Tier Plugins (004). | [docs/adr/](file:///c:/Users/420/Crafter/docs/adr/) |

---

## 🚦 Sprint 1 10-Day Implementation Roadmap

```
[COMPLETED] Day 01: Monorepo Scaffolding & Workspace Bootstrapping (208/208 Checks Passed) ✅
     │
     ▼
[NEXT UP]   Day 02: WordPress Database Persistence Layer (12 Tables & dbDelta Migrations) 🗄️
     │
     ▼
            Day 03: WordPress Plugin Bootloader & PSR-4 Service Container
     │
     ▼
            Day 04: WordPress REST API Bridge & Handshake Controller (/wp-json/craftor/v1/*)
     │
     ▼
            Day 05: Constant-Time SHA-256 Token Auth Middleware & AES-256 Key Vault
     │
     ▼
            Day 06: Transactional Snapshot Engine & 1-Click Micro-Rollback State Machine
     │
     ▼
            Day 07: Elementor Bi-Directional JSON AST Parser & Flexbox Container Mutator
     │
     ▼
            Day 08: Universal Node/TS MCP Server Core Daemon (stdio JSON-RPC 2.0 Router)
     │
     ▼
            Day 09: Phase 1 (40 Core Tools) Registry Implementation & Client Adapters
     │
     ▼
            Day 10: Docker Testing Matrix, Playwright E2E Certification & v1.0.0 Release
```

---

*Craftor is engineered from first principles to establish the universal standard for AI-native web building and headless WordPress orchestration.*
