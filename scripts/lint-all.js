/**
 * Craftor Monorepo ESLint Execution Runner
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('       CRAFTOR MONOREPO ESLINT EXECUTION RUNNER                 ');
console.log('================================================================\n');

const ESLINT_BIN = path.join(ROOT_DIR, 'node_modules', 'eslint', 'bin', 'eslint.js');

try {
  execSync(`"${process.execPath}" "${ESLINT_BIN}" packages apps services tests --ext .ts --max-warnings 0`, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
  console.log('\n🚀 ALL MONOREPO FILES PASSED ESLINT LINTING WITH 0 ERRORS & 0 WARNINGS!\n');
  process.exit(0);
} catch (err) {
  console.error('\n❌ ESLint check failed.');
  process.exit(1);
}
