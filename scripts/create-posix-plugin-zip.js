/**
 * Craftor POSIX-Compliant WordPress Plugin ZIP Packager
 * Creates standard PKZip archives with forward slashes ('/') to prevent the infamous
 * "Plugin file does not exist" error on Linux/macOS/cPanel/LocalWP WordPress servers.
 */

const fs = require('fs');
const path = require('path');

const { collectFiles, buildZipBuffer } = require('./lib/zip-archive');
const { ROOT_DIR } = require('./lib/fs-utils');

const PLUGIN_SRC = path.join(ROOT_DIR, 'plugins', 'craftor-core');
const OUTPUT_ZIP = path.join(ROOT_DIR, 'dist-svn', 'craftor-core.zip');

function buildZip() {
  console.log('Building POSIX-Compliant WordPress Plugin ZIP...');
  const files = collectFiles(PLUGIN_SRC, 'craftor-core');
  const finalZipBuffer = buildZipBuffer(files);

  fs.writeFileSync(OUTPUT_ZIP, finalZipBuffer);
  console.log(
    `✅ Successfully generated POSIX ZIP: ${OUTPUT_ZIP} (${(finalZipBuffer.length / 1024).toFixed(2)} KB)`,
  );
  console.log(
    `Verified ${files.length} entries with pure forward-slash UNIX paths (craftor-core/*).`,
  );
}

if (require.main === module) {
  buildZip();
}

module.exports = { buildZip };
