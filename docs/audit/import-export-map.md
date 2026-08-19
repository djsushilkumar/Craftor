# Craftor Monorepo — Import/Export Relationship Map

**Audit Date:** August 19, 2026  
**Auditor Roles:** Lead Software Architect, TypeScript Specialist  
**Scope:** TypeScript and PHP API Boundary Audit  

---

## 1. Universal Shared Types (`@craftor/shared-types`)

### Key Exported Contracts:
* **AST Contracts:** `ElementorNode`, `ElementorTemplateData`, `ElementorContainerSettings`, `ElementorWidgetSettings`, `ElementorBreakpoint`
* **JSON-RPC Contracts:** `JsonRpcRequest`, `JsonRpcResponse`, `JsonRpcError`, `McpToolDefinition`, `McpToolCallResult`
* **WordPress Bridge Contracts:** `WordPressSiteInfo`, `WordPressPage`, `WordPressPost`, `WordPressPlugin`, `WordPressSnapshot`
* **Licensing & Billing Contracts:** `LicenseKey`, `LicenseValidationRequest`, `LicenseValidationResult`, `SubscriptionTier`

### Downstream Consumers:
* `packages/elementor-ast`
* `packages/wordpress-bridge`
* `packages/mcp-server`
* `packages/agent-runtime`
* `packages/visual-intelligence`
* `services/*` (All 8 microservices)

---

## 2. Elementor AST Engine (`@craftor/elementor-ast`)

### Key Exported API Symbols:
* `ElementorAstEngine` (Static compiler, tree traversal, node mutations, validators)
* `createFlexContainer(options)` (Flexbox container generator)
* `createGridContainer(options)` (CSS Grid container generator)
* `createWidgetNode(widgetType, settings, id)` (Native Elementor widget constructor)
* `createHeaderTemplate(options)` / `createFooterTemplate(options)` (Theme builder generators)

### Downstream Consumers:
* `packages/wordpress-bridge` (Document manager AST validation)
* `packages/visual-intelligence` (DOM-to-AST node boundary mapping)
* `packages/agent-runtime` (GoalDecomposer layout synthesizer)
* `packages/mcp-server` (94 MCP tools AST executor)

---

## 3. WordPress Bridge (`@craftor/wordpress-bridge`)

### Key Exported API Symbols:
* `WordPressClient` (REST client wrapper, authentication header injector)
* `ElementorDocumentManager` (Direct MariaDB `_elementor_data` persistence and validation)
* `WooCommerceBridge` (Products, orders, coupons, customer cohorts)
* `SnapshotManager` (Transactional pre-mutation snapshots and rollback hashes)

### Downstream Consumers:
* `packages/mcp-server` (WordPress & WooCommerce tools)
* `packages/agent-runtime` (Deployment execution supervisor)
* `scripts/` (Automated E2E deployment runners)

---

## 4. MCP Server & Tool Registry (`@craftor/mcp-server`)

### Key Exported API Symbols:
* `CraftorMcpServer` (Universal Model Context Protocol daemon)
* `runStdioServer()` / `runSseServer()` (Multi-transport entrypoints)
* `ToolRegistry` (Dynamic tool indexing, filtering, schema validation)

### Downstream Consumers:
* `apps/api-gateway` (Cloud gateway route handler)
* Client adapters (Cursor, Claude Desktop, Antigravity, VS Code)

---

## 5. Cloud Microservices (`services/*`)

| Service | Primary Exported Symbol | Key Route / Method |
| :--- | :--- | :--- |
| `services/licensing` | `LicensingEngine` | `validateKey(key, domain)`, `issueKey(tier, seats)` |
| `services/billing` | `BillingEngine` | `createCheckout(plan)`, `handleStripeWebhook(event)` |
| `services/update-service` | `UpdateEngine` | `getReleaseManifest(version)`, `getDownloadStream(token)` |
| `services/analytics` | `AnalyticsEngine` | `trackTelemetry(metric, value)`, `getFleetHealth()` |
| `services/authentication` | `AuthEngine` | `generateJwt(user)`, `verifyToken(jwt)` |
