# Craftor — Team Responsibilities & Development Phases

**Document ID:** ORG-2026-001  
**Project Name:** Craftor  
**Version:** 1.0.0

---

## 1. Cross-Functional Team Responsibilities Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CRAFTOR CROSS-TEAM RACI MATRIX                                │
├──────────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│ Operational Domain       │ PM   │ SA   │ UI   │ WP   │ EL   │ MCP  │ QA   │ SEC  │ DOC  │ PRM  │
├──────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ PRD & Feature Scoping    │  A   │  C   │  C   │  I   │  I   │  I   │  C   │  I   │  I   │  C   │
│ Protocol & Arch Design   │  I   │  A   │  I   │  C   │  C   │  C   │  C   │  C   │  I   │  C   │
│ UI/UX Admin & Canvas     │  C   │  I   │  A   │  C   │  C   │  I   │  C   │  I   │  I   │  I   │
│ WordPress Core Backend   │  I   │  C   │  I   │  A   │  C   │  C   │  C   │  C   │  I   │  I   │
│ Elementor AST Engine     │  I   │  C   │  C   │  C   │  A   │  C   │  C   │  I   │  I   │  C   │
│ MCP Server & Transports  │  I   │  C   │  I   │  C   │  C   │  A   │  C   │  C   │  I   │  C   │
│ Testing & Verification   │  I   │  I   │  I   │  C   │  C   │  C   │  A   │  C   │  I   │  C   │
│ Security & CI/CD Ops     │  I   │  C   │  I   │  C   │  I   │  C   │  C   │  A   │  I   │  I   │
│ User Docs & API Catalog  │  C   │  I   │  I   │  I   │  I   │  I   │  I   │  I   │  A   │  C   │
│ System Prompts & Evals   │  C   │  I   │  I   │  I   │  C   │  C   │  C   │  I   │  C   │  A   │
└──────────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
Legend: A = Accountable, C = Consulted, I = Informed
```

### Team Operational Profiles

1. **Product Manager (PM):** Accountable for product vision, PRD specifications, client prioritization, and KPI validation.
2. **Solution Architect (SA):** Accountable for system architecture, JSON-RPC schema invariants, rollback state machines, and transport selection.
3. **UI/UX Designer (UI):** Accountable for the Craftor Design System, WordPress Admin UI, Elementor Canvas overlays, and visual diff viewer UX.
4. **WordPress Engineer (WP):** Accountable for the WordPress plugin backend, REST API controllers, CPT/taxonomy engines, and `$wpdb` transactional safety.
5. **Elementor Engineer (EL):** Accountable for the Elementor JSON AST parser, Flexbox/Grid container tools, Global Kit resources, and live canvas event synchronization.
6. **MCP Engineer (MCP):** Accountable for the core Model Context Protocol server daemon, `stdio`/`SSE` transports, 200+ tool handlers, and client adapter presets.
7. **QA and Debugging Engineer (QA):** Accountable for automated PHPUnit suites, Playwright E2E tests, visual regression testing, and cross-client compatibility certification.
8. **DevOps and Security Engineer (SEC):** Accountable for zero-trust token management, automated CI/CD release pipelines, Docker test grids, and vulnerability mitigation.
9. **Documentation Writer (DOC):** Accountable for 5-minute quickstart guides for all 8 AI clients, the exhaustive 200+ tool API catalog, and troubleshooting playbooks.
10. **Prompt Engineer (PRM):** Accountable for high-precision MCP tool descriptions, layout generation system prompts, and automated prompt evaluation benchmarks.

---

## 2. Development Phases & Stage Gate Protocols

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               STAGE GATE DEVELOPMENT LIFECYCLE                                  │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ GATE 1:           │ GATE 2:           │ GATE 3:           │ GATE 4:           │ GATE 5:         │
│ SPECIFICATION     │ CORE INTEGRATION  │ PROTOCOL & TOOLS  │ EVALS & AUDIT     │ RELEASE & OTA   │
├───────────────────┼───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ • PRD Approval    │ • WP REST Bridge  │ • 200+ Tool Call  │ • 98.5% Eval Pass │ • Signed Builds │
│ • Schema Invariant│ • Elementor AST   │   Handlers Active │ • 0 High/Crit CVEs│ • Client Guides │
│ • Design Sign-off │ • stdio Transport │ • SSE Server Live │ • Visual Fidelity │ • OTA Packaging │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

### Stage Gate 1: Specification & Invariants Sign-off

- **Prerequisites:** PRD, Architecture Decision Records (ADRs), and JSON schemas finalized.
- **Exit Criteria:** Solution Architect, Security Lead, and Product Manager formal approval.

### Stage Gate 2: Core Subsystem Integration

- **Prerequisites:** `craftor-core` plugin scaffolds WP REST endpoints; Elementor AST parser correctly serializes Flexbox containers; local `stdio` MCP server successfully completes handshake.
- **Exit Criteria:** Unit tests pass with $\ge 90\%$ code coverage; zero uncaught PHP exceptions.

### Stage Gate 3: Protocol & Complete Tool Implementation

- **Prerequisites:** All 200+ MCP tools registered with formal JSON schemas; SSE remote transport active; dual BYOK and Managed AI modes operational.
- **Exit Criteria:** Official Model Context Protocol Inspector test harness passes 100% of test assertions.

### Stage Gate 4: Prompt Evals, Security & Visual Audit

- **Prerequisites:** Automated Promptfoo/DeepEval benchmark suites executed across Claude 3.5 Sonnet, GPT-4o, and Gemini 2.0; SAST/DAST security scans completed; visual regression tests verified.
- **Exit Criteria:** $\ge 98.5\%$ first-pass tool invocation accuracy; 0 critical or high security vulnerabilities; 100% successful rollback recovery on 500 fault-injection tests.

### Stage Gate 5: Production Certification & Distribution

- **Prerequisites:** Client configuration presets validated on all 8 AI clients; documentation site published; release packages cryptographically signed.
- **Exit Criteria:** Public release readiness sign-off across all 10 teams.
