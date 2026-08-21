/**
 * Craftor WordPress.org SVN Repository Packager
 * Generates official SVN structure (assets, trunk, tags/1.0.0) and validates readme.txt format.
 */

const fs = require('fs');
const path = require('path');

const {
  ROOT_DIR,
  ensureDir,
  copyDirRecursive,
  requirePath,
  requireFileContains,
} = require('./lib/fs-utils');
const { printBanner, printFooter } = require('./lib/report');

const PLUGIN_SRC = path.join(ROOT_DIR, 'plugins', 'craftor-core');
const SVN_DIST_DIR = path.join(ROOT_DIR, 'dist-svn', 'craftor-core');

function packageWordPressOrg() {
  printBanner('CRAFTOR WORDPRESS.ORG SVN PACKAGING SUITE');

  requirePath(PLUGIN_SRC, `Plugin source directory not found: ${PLUGIN_SRC}`);

  const trunkDir = path.join(SVN_DIST_DIR, 'trunk');
  const tagDir = path.join(SVN_DIST_DIR, 'tags', '1.0.0');
  const assetsDir = path.join(SVN_DIST_DIR, 'assets');

  ensureDir(trunkDir);
  ensureDir(tagDir);
  ensureDir(assetsDir);

  // 1. Copy plugin files to trunk and tags/1.0.0
  copyDirRecursive(PLUGIN_SRC, trunkDir);
  copyDirRecursive(PLUGIN_SRC, tagDir);

  // 2. Generate SVN Banner and Icon placeholders in assets/
  const bannerPath = path.join(assetsDir, 'banner-772x250.png.txt');
  fs.writeFileSync(bannerPath, 'Craftor Official WordPress.org Banner Asset (772x250)', 'utf-8');
  const iconPath = path.join(assetsDir, 'icon-256x256.png.txt');
  fs.writeFileSync(iconPath, 'Craftor Official WordPress.org Icon Asset (256x256)', 'utf-8');

  // 3. Validate readme.txt
  requireFileContains(
    path.join(trunkDir, 'readme.txt'),
    ['=== Craftor Core', 'Tested up to:', 'Requires PHP:', 'Stable tag:'],
    'readme.txt',
  );

  console.log(`[SVN] Trunk populated -> ${path.relative(ROOT_DIR, trunkDir)}`);
  console.log(`[SVN] Tag 1.0.0 populated -> ${path.relative(ROOT_DIR, tagDir)}`);
  console.log(`[SVN] Assets populated -> ${path.relative(ROOT_DIR, assetsDir)}`);
  console.log('[SVN] readme.txt verified successfully ✅');

  printFooter('WORDPRESS.ORG SVN PACKAGE PREPARED SUCCESSFULLY ✅');
}

if (require.main === module) {
  packageWordPressOrg();
}

module.exports = { packageWordPressOrg };
