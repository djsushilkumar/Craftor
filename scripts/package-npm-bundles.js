/**
 * Craftor NPM Distribution Bundle Validator & Packager
 * Validates package.json metadata and creates distribution manifests for all public packages.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_NPM_DIR = path.join(ROOT_DIR, 'dist-npm');

const NPM_PACKAGES = [
  'packages/mcp-server',
  'packages/elementor-ast',
  'packages/wordpress-bridge',
  'packages/design-tokens',
  'packages/shared-utils',
  'packages/tool-registry',
  'packages/shared-types',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function packageNpmBundles() {
  console.log('================================================================');
  console.log('       CRAFTOR NPM DISTRIBUTION BUNDLE PACKAGER                ');
  console.log('================================================================\n');

  ensureDir(DIST_NPM_DIR);

  const manifest = [];

  for (const pkgRel of NPM_PACKAGES) {
    const pkgPath = path.join(ROOT_DIR, pkgRel, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error(`package.json missing for package: ${pkgRel}`);
    }
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    if (!pkgJson.name || !pkgJson.version) {
      throw new Error(`Invalid package.json in ${pkgRel}: missing name or version`);
    }

    manifest.push({
      name: pkgJson.name,
      version: pkgJson.version,
      main: pkgJson.main || 'dist/index.js',
      types: pkgJson.types || 'dist/index.d.ts',
    });

    console.log(`[NPM] Package validated: ${pkgJson.name}@${pkgJson.version}`);
  }

  const manifestFilePath = path.join(DIST_NPM_DIR, 'npm-release-manifest.json');
  fs.writeFileSync(manifestFilePath, JSON.stringify({ packages: manifest, releaseDate: new Date().toISOString() }, null, 2), 'utf-8');

  console.log(`\n[NPM] Manifest generated -> ${path.relative(ROOT_DIR, manifestFilePath)}`);
  console.log('\n================================================================');
  console.log('NPM DISTRIBUTION BUNDLES VALIDATED SUCCESSFULLY ✅');
  console.log('================================================================\n');
}

if (require.main === module) {
  packageNpmBundles();
}

module.exports = { packageNpmBundles };
