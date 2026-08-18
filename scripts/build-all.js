/**
 * Craftor Monorepo TypeScript Build Execution Runner
 * Compiles all packages, services, and applications using tsc in topological DAG order.
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const BUILD_TARGETS = [
  // 1. Leaf Packages
  'packages/shared-types',
  'packages/schemas',
  'packages/design-tokens',

  // 2. Foundation Libraries
  'packages/shared-utils',
  'packages/tool-registry',
  'packages/skill-registry',
  'packages/workflow-registry',
  'packages/client-adapters/shared',
  'packages/shared-ui',

  // 3. Sub-Adapters & Core Engines
  'packages/agent-registry',
  'packages/elementor-ast',
  'packages/addon-sdk',
  'packages/edge-runtime',
  'packages/client-adapters/cursor',

  'packages/client-adapters/claude-desktop',
  'packages/client-adapters/antigravity',
  'packages/client-adapters/vscode',
  'packages/client-adapters/claude-code',
  'packages/client-adapters/codex',
  'packages/client-adapters',

  // 4. Daemon, Bridge & Microservices
  'packages/wordpress-bridge',
  'services/authentication',
  'services/licensing',
  'services/analytics',
  'services/billing',
  'services/update-service',
  'services/notification-service',
  'services/self-healing',
  'services/collaboration',
  'packages/mcp-server',
  'packages/agent-runtime',



  // 5. Applications
  'apps/api-gateway',
  'apps/dashboard',
  'apps/marketing',

  // 6. Test Suites
  'tests/contracts',
  'tests/e2e',
];

console.log('================================================================');
console.log('       CRAFTOR MONOREPO RUNTIME BUILD EXECUTION PROOF            ');
console.log('================================================================\n');

let successCount = 0;
let failCount = 0;
const TSC_BIN = path.join(ROOT_DIR, 'node_modules', 'typescript', 'bin', 'tsc');

BUILD_TARGETS.forEach((target) => {
  const tsconfigPath = path.join(ROOT_DIR, target, 'tsconfig.json');
  process.stdout.write(`[BUILDING] ${target}... `);
  try {
    execSync(`"${process.execPath}" "${TSC_BIN}" -p "${tsconfigPath}"`, { cwd: ROOT_DIR, stdio: 'pipe' });
    console.log('✅ COMPILED');
    successCount++;
  } catch (err) {
    console.log('❌ FAILED');
    console.error(err.stdout ? err.stdout.toString() : err.message);
    failCount++;
  }
});

console.log('\n================================================================');
console.log(
  `BUILD SUMMARY: ${successCount} Packages/Apps Compiled Successfully | ${failCount} Failed`,
);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🚀 ALL MONOREPO TYPESCRIPT TARGETS COMPILED WITH ZERO ERRORS!\n');
  process.exit(0);
}
