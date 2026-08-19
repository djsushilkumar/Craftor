# Craftor 3-Product Architecture Topology & Design Guide

**Document Version:** 1.0.0  
**Status:** Production Refactored  
**Audience:** Architects, Developers, Release Engineers  

---

## 1. Executive Product Topology

Craftor is decomposed into three decoupled, standalone products operating across WordPress, Elementor, and Cloud environments:

```mermaid
graph TD
    subgraph Product 1: Craftor Core (Free Plugin)
        Core["plugins/craftor-core<br>• WordPress.org Free Plugin<br>• 100% Native Elementor Flexbox AST<br>• 3-Step AI Onboarding Wizard<br>• Zero-Trust Token Auth & Snapshots<br>• Pure PHP Archetype Engine"]
    end

    subgraph Product 2: Craftor Addons Pro (Premium Plugin)
        Pro["plugins/craftor-addons-pro<br>• Commercial Premium Plugin<br>• Live Editor Canvas SSE Sync Engine<br>• WooCommerce Deep E-Commerce<br>• Theme Builder & Global Kits<br>• SaaS License Activation Client"]
    end

    subgraph Product 3: Craftor SaaS (Cloud Control Plane)
        SaaS["apps/ & services/<br>• Licensing API (Keys, Domain Seats)<br>• Stripe Subscriptions & Billing Webhooks<br>• Secure OTA Update Delivery<br>• Fleet Health & Multi-Site Dashboard"]
    end

    subgraph Shared Core Libraries
        Shared["packages/<br>• @craftor/shared-types (Contracts)<br>• @craftor/shared-utils (Crypto & Logger)<br>• @craftor/elementor-ast (AST Synthesizer)<br>• @craftor/mcp-server (94-Tool MCP Daemon)"]
    end

    Pro -->|Requires & Extends| Core
    Pro -->|Validates License with| SaaS
    Core --> Shared
    Pro --> Shared
    SaaS --> Shared
```

---

## 2. Product 1: Craftor Core (`plugins/craftor-core`)

* **Repository Path:** `plugins/craftor-core`
* **Distribution Archive:** `dist-bin/craftor-core-1.0.0.zip`
* **Target Audience:** WordPress.org users, agency freelancers, and non-technical site owners.
* **Key Architecture Components:**
  * `src/Admin/AdminSettings.php`: Modern settings dashboard with 0 inline CSS/JS.
  * `src/Archetypes/`: Pure PHP 100% Native Elementor AST generators (`SaasArchetype`, `FitnessArchetype`, `RestaurantArchetype`, `AgencyArchetype`).
  * `src/Controllers/WizardController.php`: REST endpoint `POST /wp-json/craftor/v1/wizard/generate` supporting both `wp_rest` nonces and machine Bearer tokens.
  * `src/Auth/CraftorAuth.php`: Centralized Zero-Trust authentication and permission authority.
  * `src/Database/SchemaInstaller.php`: Transactional database migrations and snapshot tables.

---

## 3. Product 2: Craftor Addons Pro (`plugins/craftor-addons-pro`)

* **Repository Path:** `plugins/craftor-addons-pro`
* **Distribution Archive:** `dist-bin/craftor-addons-pro-1.0.0.zip`
* **Target Audience:** Commercial license holders, agencies managing multi-site fleets, and advanced e-commerce stores.
* **Key Architecture Components:**
  * `src/Licensing/LicenseManager.php`: Commercial key activation, domain quota enforcement, and local transient caching.
  * `src/LiveSync/LiveSyncEngine.php`: Real-time Server-Sent Events (SSE) stream `/wp-json/craftor/v1/editor/events` updating Elementor canvas without page refresh.
  * `src/WooCommerce/WooCommercePro.php`: Advanced product variations, stock telemetry, and custom checkout flows.
  * `src/ThemeBuilder/ThemeBuilderEngine.php`: Dynamic Header, Footer, Popup, and Archive AST template synthesizer.

---

## 4. Product 3: Craftor SaaS (`apps/` & `services/`)

* **Repository Path:** `apps/dashboard`, `apps/api-gateway`, `services/*`
* **Target Audience:** Agency fleet managers, cloud subscription subscribers.
* **Key Architecture Components:**
  * `services/licensing`: Cryptographic key issuance, domain seats, and heartbeat checks.
  * `services/billing`: Stripe subscription checkouts, invoice webhooks, and credit quotas.
  * `services/update-service`: Over-The-Air (OTA) signed package manifests and release binaries.
  * `services/analytics`: Fleet telemetry, widget generation latency, and error reporting.
  * `apps/dashboard`: Next.js web application for multi-site fleet operations.
