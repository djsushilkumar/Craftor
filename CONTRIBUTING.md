# Contributing to Craftor

Thank you for your interest in contributing to **Craftor** — the Universal Model Context Protocol (MCP) platform for WordPress, Elementor & WooCommerce!

This document outlines the guidelines and best practices for developing, testing, and submitting contributions to the Craftor monorepo.

---

## 🏛️ Architecture & Repository Structure

Craftor is organized as a high-performance polyglot monorepo managed with **pnpm workspaces** and **Turborepo**:

- `packages/`: Core TypeScript engines, shared types, utilities, and registries (`mcp-server`, `tool-registry`, `elementor-ast`, `schemas`, `client-adapters`, etc.).
- `plugins/`: WordPress plugin tiers (`craftor-core`, `craftor-pro`, `craftor-enterprise`).
- `apps/`: Web portals, API gateway, documentation site, and SaaS control planes (`dashboard`, `api-gateway`, `documentation`, `marketing`).
- `services/`: Cloud microservices (`authentication`, `licensing`, `analytics`, `billing`, `update-service`, `notification-service`).
- `.agents/`: Autonomous agent personas, 15 specialized domain skills, and evaluation benchmark suites.
- `tests/`: Contract test suites, Playwright E2E suites, visual regression fixtures, and prompt benchmarks.

---

## 🛠️ Prerequisites & Setup

### Required Tooling

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0` (Recommended: `pnpm@11.22.0`)
- **PHP**: `>= 8.1` with Composer (for WordPress plugin development)
- **Docker & Docker Compose**: (for running multi-version matrix integration environments)

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/craftor-ai/craftor.git
cd craftor

# 2. Install workspace dependencies
pnpm install

# 3. Build all packages and applications
pnpm build

# 4. Verify full monorepo integrity (208+ automated assertions)
pnpm verify
```

---

## 💻 Development Workflow

### Available Root Scripts

| Command                  | Description                                                                           |
| :----------------------- | :------------------------------------------------------------------------------------ |
| `pnpm build`             | Compiles all 29 TypeScript packages, services, and applications                       |
| `pnpm dev`               | Starts Turborepo watch mode in parallel across all packages                           |
| `pnpm lint`              | Executes ESLint with zero-warning threshold across all packages                       |
| `pnpm test`              | Runs contract test suites against schemas and crypto engines                          |
| `pnpm verify`            | Executes monorepo structure, schema, and `.agents` validation                         |
| `pnpm verify:all`        | Runs full end-to-end verification pipeline (Build + Lint + Tests + Composer + DevOps) |
| `pnpm validate:composer` | Validates PSR-4 autoloading and `composer.json` manifests for all plugins             |
| `pnpm validate:devops`   | Validates GitHub Actions workflow schemas and Docker configs                          |
| `pnpm changeset`         | Generates a changeset declaration for version bumping and changelogs                  |

---

## 📝 Commit Convention & Style

We strictly enforce **Conventional Commits** via `@commitlint/cli` and `husky`. All commit messages must follow the format:

```
<type>(<scope>): <subject>
```

### Allowed Types

- `feat`: A new user-facing feature or tool
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style / formatting changes (no production logic change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `build`: Build system or external dependency updates
- `ci`: CI/CD workflow configuration changes
- `chore`: Maintenance tasks, repo tooling, or housekeeping
- `revert`: Reverting a previous commit

### Allowed Scopes

`mcp-server`, `tool-registry`, `skill-registry`, `agent-registry`, `workflow-registry`, `schemas`, `client-adapters`, `elementor-ast`, `design-tokens`, `shared-ui`, `shared-types`, `shared-utils`, `craftor-core`, `craftor-pro`, `craftor-enterprise`, `dashboard`, `api-gateway`, `documentation`, `marketing`, `monorepo`.

**Example:**

```bash
git commit -m "feat(elementor-ast): add grid container template generator"
git commit -m "fix(tool-registry): correct schema validator for custom post type tool"
```

---

## 📦 Versioning & Changesets

If your pull request introduces changes to published packages or plugins:

1. Run `pnpm changeset`.
2. Select the affected packages (e.g. `@craftor/elementor-ast`, `@craftor/mcp-server`).
3. Choose the appropriate SemVer bump (`patch`, `minor`, `major`).
4. Enter a concise summary of the change.
5. Commit the generated `.changeset/*.md` file alongside your code changes.

---

## 🧪 Pre-Submission Checklist

Before opening a pull request, ensure all quality gates pass locally:

- [ ] Code is formatted cleanly (`npx prettier --check .`)
- [ ] ESLint passes with zero warnings (`pnpm lint`)
- [ ] All packages compile cleanly (`pnpm build`)
- [ ] Contract tests pass (`pnpm test`)
- [ ] Full monorepo verification succeeds (`pnpm verify:all`)
- [ ] Git working tree is clean with conventional commit history

---

## 🛡️ Security & Disclosure

If you discover a potential security vulnerability, please do NOT open a public issue. Instead, report it privately to `security@craftor.ai`.
