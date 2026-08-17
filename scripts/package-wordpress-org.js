/**
 * Craftor WordPress.org SVN Repository Packager
 * Generates official SVN structure (assets, trunk, tags/1.0.0) and validates readme.txt format.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PLUGIN_SRC = path.join(ROOT_DIR, 'plugins', 'craftor-core');
const SVN_DIST_DIR = path.join(ROOT_DIR, 'dist-svn', 'craftor-core');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function packageWordPressOrg() {
  console.log('================================================================');
  console.log('       CRAFTOR WORDPRESS.ORG SVN PACKAGING SUITE                ');
  console.log('================================================================\n');

  if (!fs.existsSync(PLUGIN_SRC)) {
    throw new Error(`Plugin source directory not found: ${PLUGIN_SRC}`);
  }

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
  const readmePath = path.join(trunkDir, 'readme.txt');
  if (!fs.existsSync(readmePath)) {
    throw new Error('readme.txt missing from plugin trunk!');
  }
  const readmeContent = fs.readFileSync(readmePath, 'utf-8');
  const requiredHeaders = ['=== Craftor Core', 'Tested up to:', 'Requires PHP:', 'Stable tag:'];
  for (const header of requiredHeaders) {
    if (!readmeContent.includes(header)) {
      throw new Error(`readme.txt validation failed: missing header "${header}"`);
    }
  }

  console.log(`[SVN] Trunk populated -> ${path.relative(ROOT_DIR, trunkDir)}`);
  console.log(`[SVN] Tag 1.0.0 populated -> ${path.relative(ROOT_DIR, tagDir)}`);
  console.log(`[SVN] Assets populated -> ${path.relative(ROOT_DIR, assetsDir)}`);
  console.log('[SVN] readme.txt verified successfully ✅');

  console.log('\n================================================================');
  console.log('WORDPRESS.ORG SVN PACKAGE PREPARED SUCCESSFULLY ✅');
  console.log('================================================================\n');
}

if (require.main === module) {
  packageWordPressOrg();
}

module.exports = { packageWordPressOrg };
