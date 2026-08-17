/**
 * Craftor Monorepo Package Release & Publishing Handler
 * Gracefully handles production npm publishing when NPM_TOKEN is provided,
 * or validates changeset release plan when running in dry-run / CI mode.
 */

const { execSync } = require('child_process');

console.log('================================================================');
console.log('         CRAFTOR PACKAGES RELEASE & PUBLISH RUNNER              ');
console.log('================================================================');

const npmToken = process.env.NPM_TOKEN;

if (npmToken && npmToken.trim().length > 0 && !npmToken.startsWith('${{')) {
  console.log('🔑 NPM_TOKEN detected. Executing changeset publish to npm registry...');
  try {
    execSync('npx changeset publish', { stdio: 'inherit' });
    console.log('✅ Changeset publish completed successfully!');
  } catch (err) {
    console.error('❌ Changeset publish failed:', err.message);
    process.exit(1);
  }
} else {
  console.log('ℹ️ No NPM_TOKEN configured in environment/secrets.');
  console.log('ℹ️ Running changeset publish status validation in dry-run mode...');
  try {
    execSync('npx changeset status', { stdio: 'inherit' });
    console.log('✅ Changeset status validated successfully (Dry-run mode).');
  } catch (err) {
    console.error('❌ Changeset status check failed:', err.message);
    process.exit(1);
  }
}
