# Craftor Monorepo — Migration Risk & Complexity Assessment

**Audit Date:** August 19, 2026  
**Auditor Roles:** Lead Software Architect, DevOps Engineer, QA Engineer, Release Manager  
**Scope:** Risk Modeling & Effort Estimation for 3-Product Refactoring  

---

## 1. Overall Refactoring Complexity Score: `4.2 / 10` (Low-to-Medium Risk)

```text
Complexity Score Breakdown:
┌──────────────────────────────────────┬───────┬───────────────────────────────┐
│ Metric Dimension                     │ Score │ Rationale                     │
├──────────────────────────────────────┼───────┼───────────────────────────────┤
│ Circular Dependency Risk             │ 0 / 10│ 0 cycles detected across repo │
│ Monorepo Workspace Coupling          │ 3 / 10│ pnpm workspaces already in use│
│ Plugin Architecture Refactoring      │ 5 / 10│ PHP MVC refactoring needed    │
│ Cloud SaaS Decoupling                │ 4 / 10│ Services already modularized  │
│ Backward Compatibility & Tests       │ 5 / 10│ 26/26 contract suites active  │
├──────────────────────────────────────┼───────┼───────────────────────────────┤
│ COMPOSITE RISK SCORE                 │ 4.2/10│ LOW-TO-MEDIUM COMPLEXITY      │
└──────────────────────────────────────┴───────┴───────────────────────────────┘
```

---

## 2. Module Risk Classification

```mermaid
graph TD
    subgraph High Risk (Score 7-10)
        H1["No modules currently in High Risk tier"]
    end

    subgraph Medium Risk (Score 4-6)
        M1["plugins/craftor-core MVC Restructure<br>(Extracting assets & splitting Pro features)"]
        M2["plugins/craftor-addons-pro Construction<br>(Integrating LiveSync, ThemeBuilder & License Client)"]
        M3["services/licensing & billing SaaS Unification<br>(Connecting apps/dashboard with services/*)"]
    end

    subgraph Low Risk (Score 1-3)
        L1["packages/shared-types & shared-utils<br>(Zero structural changes needed)"]
        L2["packages/elementor-ast<br>(Self-contained compiler logic)"]
        L3["packages/client-adapters<br>(Independent adapter manifests)"]
        L4["apps/api-gateway & apps/documentation<br>(Clean configuration boundaries)"]
    end
```

---

## 3. Migration Effort & Timeline Estimation

| Milestone | Scope | Estimated Engineering Effort | Testing & QA Effort |
| :--- | :--- | :--- | :--- |
| **Milestone 1** | Modernize `plugins/craftor-core` into clean MVC (Zero inline styles, dedicated archetype classes) | 4 Hours | 2 Hours (PHPUnit + WP-CLI) |
| **Milestone 2** | Construct `plugins/craftor-addons-pro` (Live-Sync SSE, WooCommerce bridge, ThemeBuilder, License Client) | 6 Hours | 3 Hours (Elementor Canvas tests) |
| **Milestone 3** | Unify `Craftor SaaS` (`apps/dashboard` + `services/licensing` + `services/billing` + `services/update-service`) | 6 Hours | 3 Hours (API contract tests) |
| **Milestone 4** | End-to-End Certification & Architecture Documentation | 2 Hours | 2 Hours (Playwright multi-viewport) |
| **TOTAL** | **Full 3-Product Migration** | **18 Hours** | **10 Hours** |

---

## 4. Rollback Complexity Assessment

* **Rollback Complexity Rating:** **1.5 / 10 (Very Low)**
* **Safety Invariant:** All refactoring is branched from safety backup `backup/pre-3-product-refactor`.
* **State Preservation:** Docker MariaDB database schemas use versioned snapshot tables (`wp_craftor_snapshots`), ensuring zero database data loss during refactoring.
