# Craftor — Architecture Review & Strategic Optimizations

**Document ID:** ARCH-REV-2026-001  
**Project:** Craftor — Universal MCP Platform for WordPress, Elementor & WooCommerce  
**Version:** 2.0.0 (Master Optimized Architecture)  
**Status:** Approved & Formally Integrated  

---

## 1. Executive Review & Strategic Appraisal

The 8 architectural review recommendations have been analyzed by the complete Craftor AI organization. Every recommendation elevates Craftor from a standard MCP bridge into an **Enterprise AI Operating System for WordPress & Elementor**.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 STRATEGIC REVIEW & IMPACT ANALYSIS                               │
├────────────────────────────┬─────────────────────────────────────────────────────────────────────┤
│ Review Recommendation      │ Strategic Impact & Competitive Moat                                 │
├────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 1. Staged Tool Rollout     │ Eliminates MVP delivery risk. Focuses Phase 1 on the 40 most        │
│    (40 -> 100 -> 160 -> 240)│ essential, rock-solid tools with >99% first-pass accuracy.          │
├────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 2. Tool Versioning Schema  │ Enforces semantic tool contracts (`version`, `permissions`,         │
│                            │ `deprecated`) preventing breaking changes across evolving models.   │
├────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 3. 3-Tier Plugin Split     │ Standardizes open-source distribution (WP.org `core`), agency e-comm│
│    (core / pro / enterprise│ (`pro`), and multi-site enterprise governance (`enterprise`).       │
├────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 4. Dashboard Agent/Skill   │ Elevates Craftor from a passive utility to an active **AI Agent &   │
│    Marketplace             │ Skill Ecosystem** where users discover and deploy custom workflows. │
├────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 5. Modular Elementor Engine│ Decouples Widget, Layout, Template, Global Style, and CSS Compiler  │
│                            │ into 5 isolated subsystems for sub-50ms processing.                 │
├────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 6. AI Client Adapter Layer │ Pluggable adapters (`claude`, `cursor`, `antigravity`, `vscode`)    │
│                            │ make onboarding future AI clients a 1-day task.                     │
├────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 7. The 4 Registries Core   │ **The Ultimate Differentiator:** Tool, Skill, Agent, and Workflow   │
│    Architecture            │ Registries make Craftor vastly superior to EMCP & Novamira.         │
├────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 8. Strict Pipeline Sequence│ Zero code until UI/UX, Design System, DB Review, Monorepo Setup, and│
│                            │ Development Standards are 100% complete and certified.              │
└────────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 4-Registry Universal Foundation

Craftor's core architectural differentiator is the formal unification of **4 First-Class Registries**:

```
                               ┌──────────────────────────────────────────────┐
                               │         CRAFTOR 4-REGISTRY PLATFORM          │
                               └──────────────────────┬───────────────────────┘
                                                      │
         ┌───────────────────────────┬────────────────┴──────────────────────────┬───────────────────────────┐
         │                           │                                           │                           │
┌────────▼────────┐         ┌────────▼────────┐                         ┌────────▼────────┐         ┌────────▼────────┐
│ 1. TOOL         │         │ 2. SKILL        │                         │ 3. AGENT        │         │ 4. WORKFLOW     │
│    REGISTRY     │         │    REGISTRY     │                         │    REGISTRY     │         │    REGISTRY     │
├─────────────────┤         ├─────────────────┤                         ├─────────────────┤         ├─────────────────┤
│• 240+ MCP Tools │         │• 15 Antigravity │                         │• Autonomous Role│         │• Multi-Step     │
│• SemVer Schemas │         │  Skills & Promp.│                         │  Personas (Dev, │         │  Chains (e.g.,  │
│• Permissions    │         │• Domain Evals   │                         │  Designer, Ops) │         │  Flash Sale)    │
│• Version Diffs  │         │• Few-Shot Packs │                         │• Execution Scope│         │• State Rollback │
└─────────────────┘         └─────────────────┘                         └─────────────────┘         └─────────────────┘
```

---

## 3. Staged 4-Phase Tool Rollout Matrix

To guarantee maximum reliability and $>99\%$ tool calling accuracy, tool releases are structured across 4 distinct phases:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       4-PHASE TOOL ROLLOUT SCHEDULE                                     │
├──────────────────────────┬──────────────────────────┬──────────────────────────┬────────────────────────┤
│         PHASE 1          │         PHASE 2          │         PHASE 3          │        PHASE 4         │
│     MVP CORE LAUNCH      │  PRO & LIVE SYNC ENGINE  │  ADVANCED & LOCAL MODELS │   ENTERPRISE SUITE     │
│       (40 TOOLS)         │       (100 TOOLS)        │       (160 TOOLS)        │      (240+ TOOLS)      │
├──────────────────────────┼──────────────────────────┼──────────────────────────┼────────────────────────┤
│ • 12 WP Core CRUD        │ • +20 Flex/Grid Layouts  │ • +20 WooCommerce Adv.   │ • +30 WPMU Multi-Site  │
│ • 10 Elementor Core AST  │ • +15 Global Style Kit   │ • +15 SEO & JSON-LD      │ • +25 White-Label SDK  │
│ • 8 WooCommerce Basics   │ • +15 Woo Orders & Stock │ • +15 Media AI & WebP    │ • +15 Advanced DB/CLI  │
│ • 6 Snapshot & Rollback  │ • +10 Theme Builder AST  │ • +10 Dynamic Loop Grids │ • +10 Custom Addon SDK │
│ • 4 Auth & Status Tools  │                          │                          │                        │
└──────────────────────────┴──────────────────────────┴──────────────────────────┴────────────────────────┘
```

### Phase 1 (MVP) — The 40 Core Foundation Tools:
1. `wp_get_post` (#001)
2. `wp_create_post` (#002)
3. `wp_update_post` (#003)
4. `wp_delete_post` (#004)
5. `wp_get_page` (#007)
6. `wp_create_page` (#008)
7. `wp_update_page` (#009)
8. `wp_query_posts` (#011)
9. `wp_get_post_meta` (#014)
10. `wp_update_post_meta` (#015)
11. `wp_register_cpt` (#017)
12. `wp_create_term` (#021)
13. `elementor_get_page_ast` (#036)
14. `elementor_set_page_ast` (#037)
15. `elementor_create_container` (#038)
16. `elementor_update_container` (#039)
17. `elementor_delete_container` (#040)
18. `elementor_add_widget` (#041)
19. `elementor_update_widget` (#042)
20. `elementor_delete_widget` (#043)
21. `elementor_build_hero_section` (#046)
22. `elementor_build_pricing_table` (#047)
23. `elementor_get_global_kit` (#076)
24. `elementor_get_global_colors` (#077)
25. `elementor_get_global_typography` (#081)
26. `elementor_clear_css_cache` (#070)
27. `woo_get_product` (#121)
28. `woo_create_simple_product` (#122)
29. `woo_update_product` (#125)
30. `woo_query_products` (#129)
31. `woo_get_order` (#156)
32. `woo_update_order_status` (#157)
33. `woo_create_coupon` (#166)
34. `woo_get_stock_inventory` (#162)
35. `craftor_create_snapshot` (#226)
36. `craftor_restore_snapshot` (#227)
37. `craftor_list_snapshots` (#228)
38. `craftor_get_visual_diff` (#229)
39. `craftor_verify_license` (#231)
40. `site_get_system_health` (#211)

---

## 4. Standardized Tool Versioning & Lifecycle Schema

Every tool in the Tool Registry strictly implements the versioned schema standard:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "id": "elementor_create_container",
  "version": "1.2.0",
  "category": "Elementor Canvas, Containers & Layouts",
  "permissions": ["edit_posts"],
  "deprecated": false,
  "deprecation_reason": null,
  "inputs": {
    "type": "object",
    "required": ["page_id", "flex_direction"],
    "properties": {
      "page_id": { "type": "integer", "description": "Target WordPress Post ID" },
      "flex_direction": { "type": "string", "enum": ["row", "column", "row-reverse", "column-reverse"] }
    }
  },
  "outputs": {
    "type": "object",
    "required": ["success", "node_id", "snapshot_id"],
    "properties": {
      "success": { "type": "boolean" },
      "node_id": { "type": "string" },
      "snapshot_id": { "type": "string" }
    }
  }
}
```

---

## 5. 3-Tier Plugin Architecture

```
plugins/
├── craftor-core/          # Tier 1: Free Open Source (WP.org)
│   ├── Basic REST Bridge & Auth
│   ├── 40 Core MCP Tools
│   ├── Basic Container AST Parser
│   └── Local Snapshot Engine (Max 5 revisions per page)
│
├── craftor-pro/           # Tier 2: Commercial License (Agencies / Pro Builders)
│   ├── 160 Advanced Tools
│   ├── Live Canvas Sync (Marionette JS bridge)
│   ├── Full WooCommerce Engine (Products, Orders, Subscriptions)
│   ├── Global Kits & Theme Builder Templates
│   └── Unlimited Snapshot History & Visual Diff Inspector
│
└── craftor-enterprise/    # Tier 3: Enterprise & Multi-Site (WPMU / Networks)
    ├── 240+ Complete Tool Catalog
    ├── WordPress Multisite (WPMU) Network Orchestration
    ├── White-Label Agency Branding & Client Portals
    ├── AES-256 KMS Vault & Zero-Trust Governance
    └── Custom 3rd-Party Elementor Addon Extensibility SDK
```

---

## 6. Decoupled 5-Engine Elementor Architecture

```
Elementor Engine Subsystem/
├── 1. Widget Engine         # Core/Pro Widget registration, controls stacks, and properties
├── 2. Layout Engine         # Modern Flexbox and CSS Grid container trees, margins, and gaps
├── 3. Template Engine       # Headers, Footers, Single Post, Archive, and Loop Grid templates
├── 4. Global Style Engine   # Global Colors, Global Typography, Theme Styles, and Breakpoints
└── 5. CSS Compiler          # Post-CSS cache compilation, minification, and cache flushing
```

---

## 7. Modular AI Client Adapter Layer

```
packages/client-adapters/
├── claude-adapter/         # claude_desktop_config.json & Claude Code CLI configurations
├── cursor-adapter/         # .cursor/mcp.json & Cursor Rules bindings
├── antigravity-adapter/    # Antigravity agent manifests & skill descriptors
├── codex-adapter/          # Codex headless scripting & environment definitions
├── vscode-adapter/         # VS Code settings.json MCP plugin profiles
└── openai-adapter/         # OpenAI Assistant function-calling schemas
```

---

## 8. Dashboard AI Marketplace & Entity Model

```
Craftor SaaS Dashboard (app.craftor.ai)
├── Sites            # Connected WordPress instances (Single & WPMU Networks)
├── AI Providers     # BYOK Key Vault (OpenAI, Anthropic, Gemini, OpenRouter, Local)
├── MCP Servers      # Active local stdio daemons & cloud SSE instances
├── Tools            # Tool catalog browser, version inspector, permission toggles
├── Skills           # Marketplace of verified Antigravity skills & prompt packs
├── Agents           # Specialized AI Agent personas (e.g., Designer Agent, Dev Agent)
├── Billing          # Stripe subscription tiers, seats, and usage credits
├── Licenses         # Domain activations and cryptographic license token manager
├── Updates          # Over-The-Air (OTA) channel management (Stable, Beta, Canary)
└── Analytics        # Token usage charts, tool call frequency, latency benchmarks
```

---

## 9. Updated Master Engineering Roadmap

```
Phase 1: Skills Ecosystem & PRD (DONE ✅)
Phase 2: Architecture & Foundation Design (DONE ✅)
Phase 3: Architecture Review & Optimizations (DONE ✅)
   │
   ▼
[NEXT STEP] ──► Phase 4: UI/UX Workshop (Admin UI, Canvas Overlay, Diff Viewer Mockups)
   │
   ▼
Phase 5: Design System & Tokens (Figma Tokens, HSL Palette, Typography Scale)
   │
   ▼
Phase 6: Database Schema Deep-Dive (PostgreSQL & MySQL Table DDL Specs)
   │
   ▼
Phase 7: Monorepo Setup (pnpm + Turborepo Workspace Scaffolding)
   │
   ▼
Phase 8: Development Standards & QA Test Harness
   │
   ▼
Phase 9: Sprint 1 Execution
   │
   ▼
Phase 10: Implementation & Coding
```
