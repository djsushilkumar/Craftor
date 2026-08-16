# Craftor — Official Engineering Handbook, Coding Guidelines & QA Test Harness

**Document ID:** ENG-HB-2026-001  
**Project:** Craftor — Universal MCP Platform for WordPress, Elementor & WooCommerce  
**Version:** 1.0.0 (Master Engineering Standard)  
**Status:** Mandatory for All Development & Contribution

---

## 1. Coding Standards

### 1.1 TypeScript Standards (Monorepo Packages & Applications)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TYPESCRIPT CODING INVARIANTS                              │
├───────────────────┬────────────────────────────┬───────────────────────────────────────┤
│ Concept           │ Standard Convention        │ Concrete Example                      │
├───────────────────┼────────────────────────────┼───────────────────────────────────────┤
│ Types / Interfaces│ `PascalCase` (No `I` prefix│ `ToolDefinition`, `SnapshotPayload`   │
│ Functions / Vars  │ `camelCase`                │ `executeToolCall()`, `activeSession`  │
│ File Names        │ `kebab-case.ts`            │ `ast-parser.ts`, `auth-middleware.ts` │
│ React Components  │ `PascalCase.tsx`           │ `VisualDiffSlider.tsx`, `Modal.tsx`   │
│ Folder Names      │ `kebab-case`               │ `tool-registry/`, `client-adapters/`  │
│ Constants / Enums │ `UPPER_SNAKE_CASE`         │ `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` │
└───────────────────┴────────────────────────────┴───────────────────────────────────────┘
```

#### TypeScript Rules & Guidelines:

1. **Strict Type Safety:** `"strict": true` is enforced in all `tsconfig.json` files. The `any` type is strictly prohibited (`@typescript-eslint/no-explicit-any: error`). Use `unknown` with type narrowing or generic constraints.
2. **Explicit Exports & Imports:** Favor named exports over default exports for all library code in `packages/` to ensure tree-shaking and deterministic IDE auto-imports.
3. **Error Handling Architecture:** All errors must inherit from the base `CraftorError` class containing a structured error code, HTTP status, and JSON-RPC mapping:
   - `CraftorProtocolError` (JSON-RPC framing and protocol code violations)
   - `CraftorValidationError` (JSON Schema validation failures)
   - `CraftorSecurityError` (Authentication, token, and capability breaches)
   - `CraftorExecutionError` (WordPress or Elementor mutation failures)
4. **Structured Logging:** Never use raw `console.log()` in production server code. Use `@craftor/shared-utils` structured logger outputting JSON with timestamps, log levels (`debug`, `info`, `warn`, `error`), and correlation IDs. In `stdio` transport mode, all logs must write to `process.stderr`.
5. **Documentation Requirements:** Every exported function, interface, and tool handler must contain TSDoc docstrings with `@param`, `@returns`, and `@throws` annotations.

---

### 1.2 PHP Standards (WordPress Plugins: `craftor-core`, `pro`, `enterprise`)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PHP CODING INVARIANTS                                  │
├───────────────────┬────────────────────────────┬───────────────────────────────────────┤
│ Concept           │ Standard Convention        │ Concrete Example                      │
├───────────────────┼────────────────────────────┼───────────────────────────────────────┤
│ Namespace Root    │ `Craftor\` (PSR-4)         │ `Craftor\Core\Plugin`, `Craftor\Rest` │
│ Class Names       │ `PascalCase`               │ `SnapshotManager`, `AstParser`        │
│ Class File Names  │ `ClassName.php`            │ `SnapshotManager.php`, `Plugin.php`   │
│ Methods & Vars    │ `snake_case` (WP Standard) │ `get_snapshot_by_uuid()`, `$post_id`  │
│ Action Hooks      │ `craftor/{domain}/{action}`│ `craftor/snapshot/created`            │
│ Filter Hooks      │ `craftor/{domain}/{filter}`│ `craftor/tools/registered_list`       │
│ REST API Routes   │ `/wp-json/craftor/v1/*`    │ `/wp-json/craftor/v1/elementor/mutate`│
└───────────────────┴────────────────────────────┴───────────────────────────────────────┘
```

#### PHP Rules & Guidelines:

1. **PSR-4 Autoloading:** All classes must reside under `includes/` mapped via Composer PSR-4 autoloading (`"Craftor\\": "includes/"`).
2. **WordPress Coding Standards (WPCS):** 100% compliance with `WordPress-Core`, `WordPress-Docs`, and `WordPress-Extra` PHP_CodeSniffer rulesets. Zero errors and zero warnings allowed in CI.
3. **Database Transactions & Sanitization:**
   - All database mutations must use prepared statements (`$wpdb->prepare()`).
   - Never access `$_POST`, `$_GET`, or `$_REQUEST` directly; use the `WP_REST_Request` object.
   - Sanitize all inputs (`sanitize_text_field()`, `wp_kses_post()`, `absint()`).
   - Escape all outputs (`esc_html()`, `esc_attr()`, `wp_json_encode()`).
4. **REST API Controllers:** All endpoints must extend `WP_REST_Controller`, define explicit `args` JSON validation schemas, and enforce `permission_callback` capability checks.
5. **Error Propagation:** Never suppress errors with `@`. Wrap operations in `try-catch` blocks and return `WP_Error` objects with standard HTTP response codes.

---

## 2. Git & Version Control Standards

### 2.1 Branching Strategy (Trunk-Based Git Flow)

Craftor follows a strict **Trunk-Based Development** workflow with short-lived feature branches merging into `main`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BRANCH NAMING CONVENTIONS                                 │
├───────────────────┬──────────────────────────────────┬─────────────────────────────────┤
│ Branch Prefix     │ Purpose                          │ Example Branch Name             │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ `feat/`           │ New feature or MCP tool addition │ `feat/elementor-grid-support`   │
│ `fix/`            │ Defect or bug fix                │ `fix/jsonrpc-stdio-disconnect`  │
│ `perf/`           │ Performance or token optimization│ `perf/ast-semantic-compression` │
│ `refactor/`       │ Code restructuring without feats │ `refactor/snapshot-controller`  │
│ `docs/`           │ Documentation updates            │ `docs/cursor-quickstart-guide`  │
│ `release/`        │ Staged release candidate branch  │ `release/v1.0.0-rc.1`           │
└───────────────────┴──────────────────────────────────┴─────────────────────────────────┘
```

---

### 2.2 Conventional Commit Message Standards

All commits must satisfy the **Conventional Commits** specification enforced via Commitlint:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scopes:** `mcp-server`, `tool-reg`, `ast`, `wp-core`, `woo`, `dashboard`, `tokens`, `ui`, `evals`.
- **Example:**
  ```
  feat(ast): add CSS Grid container mutation support to elementor engine

  Implements programmatic grid column and row definitions with responsive fr units.
  Closes #104
  ```

---

### 2.3 Pull Request Template & Review Standards

#### Mandatory PR Submission Checklist:

```markdown
## Description

<!-- Brief summary of changes and architectural intent -->

## Type of Change

- [ ] New MCP Tool (#001–#240)
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] Performance improvement / Token compression
- [ ] Breaking change (requires MAJOR SemVer bump)

## Testing & Quality Verification

- [ ] Unit Tests added/passing (Vitest / PHPUnit) (Coverage >= 90%)
- [ ] E2E Playwright tests passing on Docker matrix
- [ ] Visual Regression diff verified (<0.01% pixel diff)
- [ ] Promptfoo Evals executed (>98.5% pass rate on benchmark dataset)
- [ ] PHPCS and ESLint passing with 0 warnings

## Security & Safety Checklist

- [ ] Pre-mutation snapshot captured before any database write
- [ ] Input parameters sanitized and schema-validated
- [ ] WordPress capabilities verified (`edit_posts` / `manage_options`)
- [ ] Zero plain-text credentials in code or logs
```

- **Review Workflow:** Every PR requires at least **2 peer review approvals** (including one from a domain lead) and green CI matrix status before merging.

---

## 3. Testing Standards & 4-Tier Test Pyramid

```
                                  / \
                                 /   \
                                / E2E \       Tier 4: Playwright Multi-Client Browser
                               /-------\
                              / Visual  \     Tier 3: Pixelmatch Canvas Visual Diff
                             /-----------\
                            / Integration \   Tier 2: WordPress REST Bridge & PHPUnit
                           /---------------\
                          /   Unit Tests    \ Tier 1: Vitest AST & PHPUnit Isolation
                         /-------------------\
```

### 3.1 Unit Testing Standards (Vitest & PHPUnit)

- **Execution Target:** Sub-50ms per test file; completely decoupled from live network, database, or external AI APIs.
- **Coverage Threshold:** Minimum **90% line coverage**, **95% function coverage**, and **85% branch coverage** across all packages.
- **PHPUnit Isolation:** Use BrainMonkey and WP_Mock to mock WordPress functions (`add_action`, `wp_insert_post`, `get_post_meta`).

### 3.2 Integration Testing Standards

- **Scope:** Validates transactional database writes, snapshot creation, schema serialization, and hook firing inside ephemeral Docker containers.
- **Assertions:** Must assert both the returned JSON-RPC result and the physical database row in MySQL.

### 3.3 End-to-End (E2E) Browser Testing (Playwright)

- **Scope:** Simulates real developer actions in Cursor, Claude Desktop, and the WordPress Admin Elementor canvas.
- **Matrix:** Executed across Chromium, Firefox, and WebKit at Desktop ($1440\text{px}$), Tablet ($768\text{px}$), and Mobile ($375\text{px}$).

### 3.4 Visual Regression Standards (Pixelmatch)

- **Golden Baselines:** Stored in `tests/visual/baselines/`.
- **Tolerance:** Maximum allowed pixel difference ratio is strictly $\le 0.01\%$. Any unexpected layout shift fails the CI pipeline.

### 3.5 Prompt Evaluation Standards (Promptfoo / DeepEval)

- **Benchmark Dataset:** 200 gold-standard user prompt test cases spanning simple to compound layouts.
- **Accuracy Threshold:** Minimum $\ge 98.5\%$ first-pass tool invocation accuracy across Claude 3.5 Sonnet, GPT-4o, and Gemini 2.0.

### 3.6 Contract & Conformance Testing

- **MCP Inspector:** 100% passing rate on official Model Context Protocol conformance test harness.

---

## 4. Definition of Done (DoD)

A feature, tool, or bugfix is certified as **DONE** only when all 7 quality dimensions are satisfied:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               DEFINITION OF DONE (DoD) GATE                            │
├────────────────────┬───────────────────────────────────────────────────────────────────┤
│ Dimension          │ Mandatory Verification Criterion                                  │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 1. Code & Typing   │ 100% typed (zero `any`), WPCS & ESLint passing with 0 warnings.   │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 2. Unit Tests      │ Automated unit tests passing with >=90% code coverage.            │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 3. Integration/E2E │ E2E Playwright test passing across the multi-version WP matrix.   │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 4. Safety & Roll   │ Pre-mutation snapshot captured; rollback tested and verified.     │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 5. Error & Logging │ Graceful error envelopes; structured diagnostic logging enabled.  │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 6. Accessibility   │ WCAG 2.1 AA verified; keyboard navigation and focus rings active. │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 7. Documentation   │ Tool documented in 240-tool API catalog with verified JSON sample.│
└────────────────────┴───────────────────────────────────────────────────────────────────┘
```

---

## 5. Security & Threat Mitigation Standards

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY DEFENSE MATRIX                                   │
├──────────────────────┬─────────────────────────────────────────────────────────────────┤
│ Security Pillar      │ Mandatory Engineering Standard                                  │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Authentication**   │ Bearer tokens stored ONLY as SHA-256 hashes; constant-time      │
│                      │ `hash_equals()` verification. Zero plaintext secrets.           │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Authorization**    │ Native WordPress capability verification (`current_user_can`)   │
│                      │ on every REST endpoint and tool call handler.                   │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Encryption**       │ AES-256-GCM encryption at rest for all BYOK API keys.           │
│                      │ TLS 1.3 enforced for all remote SSE and cloud communications.   │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Input / Output**   │ Strict JSON Schema validation on input payloads; sanitization   │
│                      │ and context-aware escaping on all outputs.                      │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **SSRF Protection**  │ All media sideloading URLs must pass public IP validation;       │
│                      │ private IP subnets (`127.0.0.0/8`, `169.254.169.254`) blocked.  │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Prompt Injection** │ System prompt shields filter instruction hijacking; destructive │
│                      │ database actions strictly require explicit confirmation flags.  │
└──────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 6. Release & Versioning Standards

### 6.1 Semantic Versioning (SemVer 2.0.0)

`MAJOR.MINOR.PATCH` format:

- **MAJOR:** Incompatible MCP protocol changes or breaking database migrations.
- **MINOR:** Backward-compatible new tools, skills, or features added.
- **PATCH:** Backward-compatible bug fixes, security patches, or token optimizations.

### 6.2 Progressive Canary Deployment Strategy

All Over-The-Air (OTA) updates follow progressive deployment stages:

```
[Release Candidate] ──► [Canary Stage: 1%] ──► [Beta Stage: 10%] ──► [General Availability: 100%]
                              │                      │
                              ▼ (If Error >0.05%)    ▼ (If Error >0.05%)
                        [Auto-Rollback]        [Auto-Rollback]
```

- **Automated Rollback Trigger:** If telemetry detects an error rate $>0.05\%$ or crash reports increase during canary stages, the OTA distribution is instantly paused and reverted.

---

## 7. Documentation Standards

Craftor documentation follows the **Diátaxis Documentation Framework**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DIÁTAXIS DOCUMENTATION MATRIX                             │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ Quadrant                 │ Focus & Purpose          │ Concrete Example                 │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ **Tutorials** (Learning) │ Step-by-step onboarding  │ "Building your first Elementor   │
│                          │ for beginners            │  landing page with Cursor in 5m" │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ **How-To Guides** (Task) │ Practical solutions for  │ "How to configure a WooCommerce  │
│                          │ specific user goals      │  Flash Sale campaign via AI"     │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ **Reference** (Info)     │ Exhaustive technical     │ "240-Tool MCP Schema Reference   │
│                          │ descriptions & schemas   │  and Parameter Catalog"          │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ **Explanation** (Theory) │ Architecture, concepts,  │ "Understanding Transactional     │
│                          │ and design decisions     │  Snapshots and AST Serialization"│
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

### 7.1 MCP Tool Documentation Requirements

Every tool in the documentation must include:

1. **Title & Version:** `### elementor_create_container (v1.2.0)`
2. **Action Summary:** 1–2 sentence description of functional intent.
3. **Parameters Table:** Parameter name, type, required status, and description.
4. **Copy-Pasteable Example Request:** Formatted JSON payload.
5. **Copy-Pasteable Example Response:** Formatted JSON result.
6. **Error Scenarios:** Descriptions and resolution steps for error codes.

---

_This handbook represents the mandatory engineering standard for Craftor. All team members, autonomous AI agents, and code contributions must adhere strictly to these rules._
