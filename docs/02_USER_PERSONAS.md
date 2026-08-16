# Craftor — User Personas

**Document ID:** PER-2026-001  
**Project Name:** Craftor  
**Version:** 1.0.0

---

## 1. Persona Overview Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CRAFTOR TARGET USER PERSONAS                                  │
├──────────────────────┬────────────────────────┬──────────────────────┬───────────────────────────┤
│ Persona              │ Role & Organization    │ Primary AI Client    │ Core Motivation           │
├──────────────────────┼────────────────────────┼──────────────────────┼───────────────────────────┤
│ 1. Alex Vance        │ Agency Founder / Lead  │ Claude Desktop / Web │ Rapid client site builds, │
│                      │ (20+ Client Sites)     │ SaaS Dashboard       │ multi-site maintenance    │
├──────────────────────┼────────────────────────┼──────────────────────┼───────────────────────────┤
│ 2. Elena Rostova     │ Freelance Designer &   │ Cursor / Antigravity │ Flawless Elementor styling│
│                      │ Elementor Specialist   │ Elementor Canvas     │ pixel-perfect generation  │
├──────────────────────┼────────────────────────┼──────────────────────┼───────────────────────────┤
│ 3. Marcus Chen       │ Full-Stack WP Engineer │ Claude Code / VS Code│ Headless ops, custom CPTs,│
│                      │ (Custom Dev & Plugins) │ WP-CLI Terminal      │ automated testing & CI/CD │
├──────────────────────┼────────────────────────┼──────────────────────┼───────────────────────────┤
│ 4. Sophia Al-Mansoor │ E-Commerce Director    │ ChatGPT / Gemini     │ WooCommerce catalog, promo│
│                      │ (High-Volume Woo Store)│ SaaS Analytics Hub   │ funnels, order management │
├──────────────────────┼────────────────────────┼──────────────────────┼───────────────────────────┤
│ 5. David Miller      │ Enterprise WebOps Lead │ Cursor / OpenAI SDK  │ Security, WPMU governance,│
│                      │ (500+ Multi-Site Estate│ Staging/Prod Gateway │ audit logs, zero-loss sync│
└──────────────────────┴────────────────────────┴──────────────────────┴───────────────────────────┘
```

---

## 2. Deep Persona Profiles

### Persona 1: Alex Vance — The Agency Founder

- **Background:** Founder of "Vance Digital", a 12-person agency managing 45+ WordPress and Elementor websites for B2B and retail clients.
- **Tech Stack:** WordPress, Elementor Pro, WP Engine / Cloudways, Claude Desktop, Stripe.
- **Goals:**
  - Cut new client landing page turnaround time from 3 days to under 30 minutes.
  - Delegate routine maintenance (content updates, layout tweaks, banner promotions) to junior staff and AI agents without risking site breakages.
  - Centrally monitor and manage 45 client installations from a single dashboard.
- **Pain Points:**
  - Existing AI plugins only provide generic text copy or simple chatbots in the WP admin footer.
  - Manual site updates across 45 sites require logging into 45 separate wp-admin portals.
  - Client site updates frequently break widget layouts, requiring manual rollbacks.
- **How Craftor Solves It:**
  - Alex connects his central Claude Desktop or Craftor SaaS dashboard to all 45 client sites via secure MCP tokens.
  - Prompts Claude: _"Update the hero sections on all 12 Q1 client sites with the new spring promotion banner, match their respective Global Colors, and take a backup before applying."_
  - Craftor executes atomic updates across all sites, validates schemas, and generates instant visual diff reports.

---

### Persona 2: Elena Rostova — The Freelance Elementor Specialist

- **Background:** Top-rated freelance UI designer and Elementor expert building bespoke websites for lifestyle brands and startups.
- **Tech Stack:** Figma, Elementor Pro (Flexbox & Grid Containers), Cursor, Antigravity, Anthropic BYOK.
- **Goals:**
  - Instantly convert Figma design concepts and structured wireframe prompts into pixel-perfect Elementor Container trees.
  - Maintain strict global styling (Global Kits, typography scales, spacing variables) across multi-page builds.
  - Live-preview changes in the Elementor editor while chatting with her IDE AI agent.
- **Pain Points:**
  - Building complex nested flexbox structures with precise margins, paddings, and responsive tablet/mobile breakpoints is tedious.
  - Legacy AI page builders inject ugly inline CSS, break responsive layouts, and create unmaintainable messy markup.
- **How Craftor Solves It:**
  - Elena uses Cursor with Craftor MCP.
  - She passes design specs or wireframes directly to Cursor: _"Generate a 4-column modern pricing comparison container using our site's 'Accent-Primary' global color and 'Heading-XL' typography token."_
  - Craftor injects valid, cleanly nested Elementor AST JSON directly into her active canvas with live instant preview.

---

### Persona 3: Marcus Chen — The Full-Stack WordPress Engineer

- **Background:** Senior developer at a SaaS company building custom WordPress plugins, REST microservices, and headless frontends.
- **Tech Stack:** PHP 8.3, WP-CLI, Claude Code, VS Code, Git, Docker, PHPUnit.
- **Goals:**
  - Automate repetitive backend tasks: scaffolding Custom Post Types, taxonomies, ACF fields, and database schema migrations.
  - Execute headless WordPress operations directly from his terminal CLI via AI agents.
  - Ensure all AI-generated database operations are unit-tested, typed, and transactionally safe.
- **Pain Points:**
  - Hates clicking around the WordPress admin UI to configure forms, post types, and plugin settings.
  - Existing tools lack WP-CLI integrations and cannot be scripted or invoked from terminal AI workflows (like Claude Code or Codex).
- **How Craftor Solves It:**
  - Marcus fires up `claude` in his terminal with Craftor's stdio MCP server.
  - Commands Claude Code: _"Register a CPT 'Case Studies' with custom taxonomies 'Industry' and 'Tech Stack', populate 5 seed posts, and generate a corresponding Elementor single template."_
  - Craftor handles the full lifecycle via WP-CLI and internal REST controllers with complete rollback guarantees.

---

### Persona 4: Sophia Al-Mansoor — The E-Commerce Director

- **Background:** Heads e-commerce operations for a fast-growing fashion brand generating $4M/year on WooCommerce.
- **Tech Stack:** WooCommerce, Elementor Pro, Klaviyo, Google Gemini / ChatGPT, Stripe.
- **Goals:**
  - Rapidly launch flash sales, coupon campaigns, and dynamic product landing pages during peak seasons (Black Friday, Summer Sale).
  - Automate bulk catalog adjustments (pricing, category tagging, stock thresholds, cross-sell bundles).
  - Get instant conversational insights into store performance and customer cohorts.
- **Pain Points:**
  - Bulk updating 800+ product variations in WooCommerce is slow and error-prone.
  - Marketing team has to wait days for developers to build custom promotional sales funnels and countdown pages.
- **How Craftor Solves It:**
  - Sophia uses the Craftor SaaS Dashboard powered by Managed AI.
  - She prompts: _"Create a 20% discount flash sale landing page for our 'Summer Collection' category, set an active countdown timer widget ending in 48 hours, apply coupon 'SUMMER20' automatically at checkout, and show inventory badges on low-stock items."_
  - Craftor configures the WooCommerce coupon rules, filters product catalogs, and constructs the high-converting Elementor landing page in under 60 seconds.

---

### Persona 5: David Miller — The Enterprise WebOps Lead

- **Background:** Manages an enterprise network of 300+ regional corporate portals and multi-language subsites on WordPress Multisite (WPMU).
- **Tech Stack:** WordPress Multisite, Nginx clusters, Redis, AWS KMS, Cursor, Enterprise OpenAI Gateway.
- **Goals:**
  - Enforce strict compliance, security policies, and brand standards across all 300 network subsites.
  - Audit all AI-generated content and layout changes before they hit production.
  - Prevent catastrophic data loss, unauthorized plugin activations, or prompt-injection vulnerabilities.
- **Pain Points:**
  - Shadow AI usage: regional editors use random unverified AI browser extensions that leak sensitive company data.
  - No central audit trail of who generated what layout, when, and with what AI model.
- **How Craftor Solves It:**
  - David deploys `craftor-pro` across the entire WPMU network with centralized zero-trust licensing.
  - All AI actions must pass through Craftor's scoped MCP permission gateway, enforcing strict role-based tool access (e.g., editors can modify content widgets; only admins can modify site options or install plugins).
  - Full cryptographic audit logging records every prompt, tool call, and visual diff in the Craftor Enterprise Dashboard.
