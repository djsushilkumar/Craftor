# Changelog

All notable changes to the **Craftor** monorepo and its workspace packages will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-17

### 🚀 Initial Certified Enterprise Release

Initial production baseline release of the Craftor Universal Model Context Protocol (MCP) Platform for WordPress, Elementor & WooCommerce.

#### 📦 Core Packages & MCP Engines

- **`@craftor/mcp-server`**: Universal MCP server daemon supporting `stdio` and `SSE` (Server-Sent Events) transports with auto-negotiated JSON-RPC 2.0 schemas.
- **`@craftor/elementor-ast`**: High-performance TypeScript AST engine for parsing, validating, and mutating Elementor JSON documents with immutable transform guarantees.
- **`@craftor/tool-registry`**: Single-source-of-truth index housing 240+ specialized tools across Core WP, Elementor, WooCommerce, Theme Builder, Security, and Database domains.
- **`@craftor/schemas`**: Dedicated JSON Schema Draft-07 registry for JSON-RPC 2.0 requests, responses, tool definitions, and live canvas event envelopes.
- **`@craftor/shared-utils`**: AES-256-GCM encryption, constant-time SHA-256 comparison (`timingSafeEqual`), structured JSON logger, and resilient exponential backoff retry mechanics.
- **`@craftor/shared-types`**: Polyglot TypeScript type definitions and interfaces spanning JSON-RPC, MCP methods, Elementor AST, and transactional snapshot state.
- **`@craftor/design-tokens`**: Master token registry for HSL color system (Light/Dark mode), typography scale, spacing grids, and elevation shadows.
- **`@craftor/client-adapters`**: Multi-client auto-configuration generators for Cursor, Claude Code, Claude Desktop, Google Antigravity, VS Code, and Codex.

#### 🔌 WordPress Plugins

- **`craftor-core`**: Free open-source tier offering 40 core MCP tools, AST query/mutation, and local JSON-RPC endpoint bridge with PSR-4 autoloading.
- **`craftor-pro`**: Pro agency tier featuring 160 tools, real-time Elementor canvas live streaming, dynamic tags, WooCommerce product controllers, and theme templates.
- **`craftor-enterprise`**: Enterprise multi-site tier featuring 240+ tools, WordPress Multisite (WPMU) tenancy, KMS secret vaults, and custom workflow execution.

#### 🤖 Autonomous Agent Ecosystem (`.agents/`)

- **15 Standardized Domain Skills**: Certified skill implementations for Solution Architect, DevOps, MCP, Security, QA, Documentation, Release, WordPress, Elementor, UI/UX, WooCommerce, Prompt Engineering, and Registry Management.
- **Declarative Workflows**: Multi-step DAG orchestration for landing page generation, e-commerce catalogue setup, and disaster recovery rollback.
- **Evaluation Benchmarks**: Test datasets and prompt fixtures achieving >98% tool selection precision.

#### 🛡️ Cloud & SaaS Services (`services/` & `apps/`)

- **`authentication`**: OAuth2, scoped JWT, and bearer token verification with SHA-256 hashing.
- **`licensing`**: Cryptographic license activation, domain seat binding, and tier entitlement verification.
- **`analytics`**: Real-time execution telemetry ingestion and error aggregation.
- **`billing`**: Usage metering and Stripe webhook synchronization.
- **`update-service`**: Over-The-Air (OTA) canary/beta distribution with SHA-256 cryptographic package signing.
- **`apps/dashboard`**: Next.js SaaS control plane for multi-site monitoring and token management.
- **`apps/api-gateway`**: Fastify Cloud SSE gateway and managed AI proxy.
- **`apps/documentation`**: VitePress interactive developer documentation and 240-tool interactive catalog.

#### 🧪 Quality Assurance & CI/CD

- **Contract Tests**: 100% passing test assertions on JSON-RPC protocols, AST mutations, and cryptographic utilities.
- **ESLint & Prettier**: Zero errors, zero warnings across all TypeScript source files.
- **GitHub Actions**: Automated CI (`ci.yml`), Changeset release (`release.yml`), multi-version PHP/WordPress matrix (`test-matrix.yml`), and OTA canary packaging (`ota-release.yml`).
