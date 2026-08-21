/**
 * Craftor NPM Distribution Bundle Validator & Packager
 * Validates package.json metadata and creates distribution manifests for all public packages.
 */

const path = require('path');

const { ROOT_DIR, ensureDir, requireJsonFile, writeJsonFile } = require('./lib/fs-utils');
const { printBanner, printFooter } = require('./lib/report');

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

function packageNpmBundles() {
  printBanner('CRAFTOR NPM DISTRIBUTION BUNDLE PACKAGER');

  ensureDir(DIST_NPM_DIR);

  const manifest = [];

  for (const pkgRel of NPM_PACKAGES) {
    const pkgPath = path.join(ROOT_DIR, pkgRel, 'package.json');
    const pkgJson = requireJsonFile(pkgPath, `package.json missing for package: ${pkgRel}`);

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
  writeJsonFile(manifestFilePath, {
    packages: manifest,
    releaseDate: new Date().toISOString(),
  });

  console.log(`\n[NPM] Manifest generated -> ${path.relative(ROOT_DIR, manifestFilePath)}`);
  printFooter('NPM DISTRIBUTION BUNDLES VALIDATED SUCCESSFULLY ✅');
}

if (require.main === module) {
  packageNpmBundles();
}

module.exports = { packageNpmBundles };
