# Craftor Monorepo — Code Health & Hygiene Report

**Audit Date:** August 19, 2026  
**Auditor Roles:** Lead Software Architect, QA Engineer, Monorepo Specialist  
**Scope:** Static Code Quality, Dead Code, Redundant Logic & Hygiene Audit  

---

## 1. Summary of Findings

| Health Metric | Count / Status | Severity | Recommended Action |
| :--- | :--- | :--- | :--- |
| **Duplicate Archetype Logic** | 2 locations (PHP & Node.js) | Medium | Normalize archetype definitions into shared JSON contracts |
| **Inline PHP CSS/JS** | 1 file (`admin-settings.php`) | Medium | Extract to compiled `.min.css` and `.min.js` assets |
| **Legacy Plugin Stubs** | 2 plugins (`craftor-pro`, `craftor-enterprise`) | Low | Consolidate into single `craftor-addons-pro` plugin |
| **Dead / Orphaned Scripts** | 4 experimental test scripts | Low | Prune or move to `scripts/archive/` |
| **Unused Dependencies** | 0 detected in root | Healthy | pnpm deduplicated clean tree |
| **TypeScript Build Health** | 100% (37 projects compile cleanly) | Clean | 0 type errors |
| **Linting Compliance** | 100% clean | Clean | 0 ESLint errors |

---

## 2. Duplicate Code Detection

### Finding 1: Dual AST Synthesis (TypeScript vs Pure PHP)
* **Location A:** `packages/agent-runtime/src/planner/intent.ts` (TypeScript Archetypes)
* **Location B:** `plugins/craftor-core/src/controllers/wizard-controller.php` (PHP Archetypes)
* **Impact:** Modifying an archetype layout currently requires updating both TypeScript generator and PHP generator.
* **Resolution for Refactoring:** Store archetype blueprints as pure declarative JSON AST schemas in `packages/schemas/archetypes/*.json` so both PHP and TypeScript engines load the identical AST contract without duplication.

---

## 3. Inline Styles & Asset Hygiene

### Finding 2: Inline CSS and Embedded JS in Admin Settings
* **Location:** `plugins/craftor-core/src/admin/admin-settings.php`
* **Impact:** 240+ lines of inline `<style>` and `<script>` tags inside PHP strings. This violates WordPress.org VIP coding standards and prevents CSP (Content Security Policy) enforcement.
* **Resolution for Refactoring:** Extract all styles to `plugins/craftor-core/assets/css/admin-wizard.css` and scripts to `plugins/craftor-core/assets/js/admin-wizard.js`, enqueueing them via standard WordPress `wp_enqueue_style` and `wp_enqueue_script` with localized nonce objects.

---

## 4. Legacy Modules & Stubs

### Finding 3: Empty Plugin Stubs (`craftor-pro` and `craftor-enterprise`)
* **Location:** `plugins/craftor-pro/` (33 LOC) and `plugins/craftor-enterprise/` (33 LOC)
* **Impact:** These are empty stub directories created during early prototyping.
* **Resolution for Refactoring:** Merge and replace with a single, production-grade commercial extension: `plugins/craftor-addons-pro`.

---

## 5. Experimental Test Script Inventory

| Script File | Purpose | Retention Recommendation |
| :--- | :--- | :--- |
| `scripts/deploy-nextgen-ai-landing-page.js` | 100% Native NextGen AI E2E deployment | Retain as E2E test fixture in `tests/e2e/` |
| `scripts/deploy-ccepl-elevate-vision-homepage.js` | 100% Native CCEPL clone deployment | Retain as E2E test fixture in `tests/e2e/` |
| `scripts/user-acceptance-test-aetherflow.js` | Real user simulation script | Retain as E2E benchmark |
| `scripts/test-wizard-rest-endpoint.js` | REST endpoint validation test | Retain in `tests/integration/` |
| `scripts/package-plugin.js` | Production POSIX zip packager | Retain in `scripts/` (Core release pipeline) |
