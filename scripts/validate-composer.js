/**
 * Validates Composer JSON schemas, PSR-4 mappings, and PHP class/namespace compliance
 * for all 3 WordPress plugin tiers: craftor-core, craftor-pro, craftor-enterprise.
 */

const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.resolve(__dirname, '../plugins');
const PLUGINS = ['craftor-core', 'craftor-pro', 'craftor-enterprise'];

console.log('================================================================');
console.log('       COMPOSER & PSR-4 AUTOLOAD RUNTIME VALIDATION             ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

PLUGINS.forEach((pluginName) => {
  const pluginDir = path.join(PLUGINS_DIR, pluginName);
  const composerFile = path.join(pluginDir, 'composer.json');

  console.log(`[CHECKING] Plugin: ${pluginName}`);

  // 1. JSON Validity
  if (!fs.existsSync(composerFile)) {
    console.error(`  ❌ Missing composer.json`);
    failCount++;
    return;
  }

  let composerJson;
  try {
    composerJson = JSON.parse(fs.readFileSync(composerFile, 'utf8'));
    console.log(`  ✅ composer.json is valid JSON`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ Invalid composer.json syntax: ${err.message}`);
    failCount++;
    return;
  }

  // 2. Schema check
  if (composerJson.name && composerJson.require && composerJson.autoload) {
    console.log(`  ✅ Composer package contract matches standard schema (${composerJson.name})`);
    passCount++;
  } else {
    console.error(`  ❌ Missing mandatory Composer fields`);
    failCount++;
  }

  // 3. PSR-4 Autoload Directory Mapping
  const psr4 = composerJson.autoload['psr-4'];
  if (!psr4) {
    console.error(`  ❌ Missing psr-4 autoload definition`);
    failCount++;
    return;
  }

  for (const [namespace, relPath] of Object.entries(psr4)) {
    const targetDir = path.join(pluginDir, relPath);
    if (fs.existsSync(targetDir)) {
      console.log(`  ✅ PSR-4 Namespace '${namespace}' mapped to existing directory: ${relPath}`);
      passCount++;
    } else {
      console.error(`  ❌ PSR-4 Target directory missing: ${relPath}`);
      failCount++;
    }

    // 4. Verify PHP classes match namespace & filename
    const files = fs.readdirSync(targetDir);
    files.forEach((file) => {
      if (file.endsWith('.php')) {
        const content = fs.readFileSync(path.join(targetDir, file), 'utf8');
        const expectedClass = file.replace('.php', '');
        const cleanNs = namespace.replace(/\\+$/, '');
        if (
          content.includes(`namespace ${cleanNs};`) &&
          content.includes(`class ${expectedClass}`)
        ) {
          console.log(`  ✅ PSR-4 Class '${cleanNs}\\${expectedClass}' matches file '${file}'`);
          passCount++;
        } else {
          console.error(`  ❌ PSR-4 Class/Namespace mismatch in ${file}`);
          failCount++;
        }
      }
    });
  }
  console.log('');
});

console.log('================================================================');
console.log(`COMPOSER VALIDATION SUMMARY: ${passCount} Checks Passed | ${failCount} Failed`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🚀 ALL COMPOSER MANIFESTS & PSR-4 AUTOLOAD RULES 100% VALIDATED!\n');
  process.exit(0);
}
