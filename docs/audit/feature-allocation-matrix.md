# Craftor Monorepo — 3-Product Feature Allocation Matrix

**Audit Date:** August 19, 2026  
**Auditor Roles:** Lead Software Architect, WordPress Plugin Architect, Product Manager  
**Scope:** Complete Module-to-Product Classification for 3-Product Architecture  

---

## 1. Product Definitions & Boundaries

```mermaid
graph TD
    subgraph Product 1: Craftor Core (Free Plugin)
        P1["plugins/craftor-core<br>• Standalone WordPress.org Free Plugin<br>• 100% Native Elementor Flexbox AST<br>• Core 3-Step Onboarding Wizard<br>• Zero-Trust Token Auth & Snapshots<br>• Basic 6 Archetype Templates"]
    end

    subgraph Product 2: Craftor Addons Pro (Premium Plugin)
        P2["plugins/craftor-addons-pro<br>• Commercial Premium WordPress Plugin<br>• Live Editor Canvas SSE Sync Engine<br>• WooCommerce Deep E-Commerce Engine<br>• Theme Builder (Header, Footer, Popup, Archive)<br>• Pro Dynamic Widgets & Global Kits<br>• Client-Side License Activation Engine"]
    end

    subgraph Product 3: Craftor SaaS (Cloud Control Plane)
        P3["apps/ & services/<br>• SaaS Web Studio Dashboard (Next.js)<br>• Licensing API (Keys, Seats, Domains)<br>• Stripe Billing & Webhook Subscriptions<br>• Secure OTA Update Service for Pro Binaries<br>• Multi-Site Fleet Telemetry & Health Monitoring<br>• API Gateway & OAuth2 Authentication"]
    end

    subgraph Shared Core Foundations
        P4["packages/<br>• shared-types (TypeScript Contracts)<br>• shared-utils (Logger, Crypto, Retry)<br>• elementor-ast (Pure AST Compiler)<br>• mcp-server (Universal MCP Tooling)"]
    end
```

---

## 2. Complete Module Classification Matrix

| Module / Package / Service | Current Location | Allocated Product | Target Location | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Elementor Flex AST Engine** | `packages/elementor-ast` | **Shared Package** | `packages/elementor-ast` | Core AST data structure compiler shared by all tools |
| **Core 3-Step AI Wizard** | `plugins/craftor-core` | **Craftor Core** | `plugins/craftor-core/src/Admin/WizardPage.php` | Free zero-prompt onboarding channel for all users |
| **REST Core & Handshake** | `plugins/craftor-core` | **Craftor Core** | `plugins/craftor-core/src/Api/` | Base communication bridge |
| **Snapshot & Rollback Engine** | `plugins/craftor-core` | **Craftor Core** | `plugins/craftor-core/src/Database/` | Fundamental safety and rollback invariant |
| **Live Canvas SSE Sync** | `plugins/craftor-core` | **Craftor Addons Pro** | `plugins/craftor-addons-pro/src/LiveSync/` | Commercial real-time streaming to Elementor editor |
| **WooCommerce Deep Bridge** | `plugins/craftor-core` | **Craftor Addons Pro** | `plugins/craftor-addons-pro/src/WooCommerce/` | Commercial product catalog, variation & checkout features |
| **Theme Builder & Global Kits** | `packages/elementor-ast` | **Craftor Addons Pro** | `plugins/craftor-addons-pro/src/ThemeBuilder/` | Pro header/footer/popup/archive template synthesizer |
| **Pro License Client** | *New Module* | **Craftor Addons Pro** | `plugins/craftor-addons-pro/src/Licensing/` | Local license key validation with SaaS API |
| **Licensing Microservice** | `services/licensing` | **Craftor SaaS** | `services/licensing` | Cloud license issuance, seat tracking & domain validation |
| **Billing & Stripe Webhooks** | `services/billing` | **Craftor SaaS** | `services/billing` | Cloud subscription payments & invoice handling |
| **OTA Update Service** | `services/update-service` | **Craftor SaaS** | `services/update-service` | Secure signed Pro binary release channel |
| **Telemetry & Fleet Analytics** | `services/analytics` | **Craftor SaaS** | `services/analytics` | Cloud aggregate metrics & crash reports |
| **Multi-Site Dashboard** | `apps/dashboard` | **Craftor SaaS** | `apps/dashboard` | Cloud portal for agencies & multi-site management |
| **API Gateway & Auth** | `apps/api-gateway` | **Craftor SaaS** | `apps/api-gateway` | Cloud routing, authentication & rate limiting |
| **Visual Intelligence Engine** | `packages/visual-intelligence` | **Craftor SaaS / Pro** | `packages/visual-intelligence` | Automated visual QA audits & screenshot verification |
| **Universal Types** | `packages/shared-types` | **Shared Package** | `packages/shared-types` | Universal TypeScript interfaces |
| **Universal Utilities** | `packages/shared-utils` | **Shared Package** | `packages/shared-utils` | Crypto, logging, retry, environment helpers |
| **MCP Server Daemon** | `packages/mcp-server` | **Shared Package** | `packages/mcp-server` | Universal Model Context Protocol server (94 tools) |
| **Client Adapters** | `packages/client-adapters` | **Shared Package** | `packages/client-adapters` | Cursor, Claude, Antigravity, VS Code adapters |
