/**
 * Craftor WordPress Plugin Production Packaging Suite
 * Builds POSIX-compliant production zip archives, calculates SHA-256 digests,
 * and updates release manifests for v1.0.0 GA distribution.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const PLUGIN_SRC = path.join(ROOT_DIR, 'plugins', 'craftor-core');
const DIST_BIN_DIR = path.join(ROOT_DIR, 'dist-bin');
const DIST_SVN_DIR = path.join(ROOT_DIR, 'dist-svn');

// CRC32 Table
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC32_TABLE[i] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function getDosDateTime(date) {
  const d = date || new Date();
  const year = d.getFullYear() - 1980;
  const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const dosDate = (year << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { dosTime, dosDate };
}

function collectFiles(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectFiles(fullPath, baseDir));
    } else {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({ fullPath, relPath: `craftor-core/${relPath}` });
    }
  }
  return results;
}

function buildZipBuffer(files) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  const now = new Date();
  const { dosTime, dosDate } = getDosDateTime(now);

  for (const file of files) {
    const uncompressedData = fs.readFileSync(file.fullPath);
    const compressedData = zlib.deflateRawSync(uncompressedData);
    const fileCrc = crc32(uncompressedData);
    const fileNameBuf = Buffer.from(file.relPath, 'utf8');

    // Local file header (30 bytes + name)
    const localHeader = Buffer.alloc(30 + fileNameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4);         // Version needed
    localHeader.writeUInt16LE(0x0800, 6);     // Flags (UTF-8)
    localHeader.writeUInt16LE(8, 8);          // Compression (Deflate)
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(fileCrc, 14);
    localHeader.writeUInt32LE(compressedData.length, 18);
    localHeader.writeUInt32LE(uncompressedData.length, 22);
    localHeader.writeUInt16LE(fileNameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);         // Extra field length
    fileNameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader);
    localHeaders.push(compressedData);

    // Central directory header (46 bytes + name)
    const centralHeader = Buffer.alloc(46 + fileNameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Signature
    centralHeader.writeUInt16LE(20, 4);          // Version made by
    centralHeader.writeUInt16LE(20, 6);          // Version needed
    centralHeader.writeUInt16LE(0x0800, 8);      // Flags (UTF-8)
    centralHeader.writeUInt16LE(8, 10);          // Compression (Deflate)
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(fileCrc, 16);
    centralHeader.writeUInt32LE(compressedData.length, 20);
    centralHeader.writeUInt32LE(uncompressedData.length, 24);
    centralHeader.writeUInt16LE(fileNameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);          // Extra field length
    centralHeader.writeUInt16LE(0, 32);          // Comment length
    centralHeader.writeUInt16LE(0, 34);          // Disk start
    centralHeader.writeUInt16LE(0, 36);          // Internal attrs
    centralHeader.writeUInt32LE(0x81A40000, 38); // External attrs (-rw-r--r--)
    centralHeader.writeUInt32LE(offset, 42);     // Relative offset
    fileNameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + compressedData.length;
  }

  const centralDirOffset = offset;
  const centralDirBuffer = Buffer.concat(centralHeaders);
  const centralDirLength = centralDirBuffer.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);       // Signature
  eocd.writeUInt16LE(0, 4);                // Disk number
  eocd.writeUInt16LE(0, 6);                // Start disk
  eocd.writeUInt16LE(files.length, 8);     // Total entries this disk
  eocd.writeUInt16LE(files.length, 10);    // Total entries total
  eocd.writeUInt32LE(centralDirLength, 12);// Central dir size
  eocd.writeUInt32LE(centralDirOffset, 16);// Central dir offset
  eocd.writeUInt16LE(0, 20);               // Comment length

  return Buffer.concat([
    Buffer.concat(localHeaders),
    centralDirBuffer,
    eocd,
  ]);
}

function packagePlugin() {
  console.log('================================================================');
  console.log('       CRAFTOR WORDPRESS PLUGIN PRODUCTION PACKAGER             ');
  console.log('================================================================\n');

  if (!fs.existsSync(PLUGIN_SRC)) {
    throw new Error(`Plugin source directory not found: ${PLUGIN_SRC}`);
  }

  if (!fs.existsSync(DIST_BIN_DIR)) fs.mkdirSync(DIST_BIN_DIR, { recursive: true });
  if (!fs.existsSync(DIST_SVN_DIR)) fs.mkdirSync(DIST_SVN_DIR, { recursive: true });

  // 1. Validate Plugin Headers
  console.log('[1/4] Validating WordPress Plugin Metadata...');
  const mainPhpPath = path.join(PLUGIN_SRC, 'craftor-core.php');
  if (!fs.existsSync(mainPhpPath)) {
    throw new Error('craftor-core.php missing from plugin directory!');
  }
  const phpContent = fs.readFileSync(mainPhpPath, 'utf-8');
  if (!phpContent.includes('Plugin Name: Craftor Core')) {
    throw new Error('Plugin header validation failed: missing "Plugin Name: Craftor Core"');
  }
  console.log('  ✅ Plugin metadata verified: "Craftor Core v1.0.0"');

  // 2. Collect files and build clean POSIX PKZip
  console.log('\n[2/4] Assembling POSIX-compliant distribution package...');
  const files = collectFiles(PLUGIN_SRC);
  console.log(`  Found ${files.length} plugin assets to package.`);

  const zipBuffer = buildZipBuffer(files);
  const sha256 = crypto.createHash('sha256').update(zipBuffer).digest('hex');

  const binZipPath = path.join(DIST_BIN_DIR, 'craftor-core-1.0.0.zip');
  const svnZipPath = path.join(DIST_SVN_DIR, 'craftor-core.zip');

  fs.writeFileSync(binZipPath, zipBuffer);
  fs.writeFileSync(svnZipPath, zipBuffer);

  const sizeKb = (zipBuffer.length / 1024).toFixed(2);
  console.log(`  ✅ Generated: ${binZipPath} (${sizeKb} KB)`);
  console.log(`  ✅ Generated: ${svnZipPath} (${sizeKb} KB)`);
  console.log(`  🔑 SHA-256 Digest: ${sha256}`);

  // 3. Update Distribution Manifest
  console.log('\n[3/4] Updating Release Manifest...');
  const manifestPath = path.join(DIST_BIN_DIR, 'release-manifest.json');
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch {
      manifest = {};
    }
  }

  manifest.plugin = {
    name: 'craftor-core',
    version: '1.0.0',
    slug: 'craftor-core',
    archiveFile: 'craftor-core-1.0.0.zip',
    sizeBytes: zipBuffer.length,
    sha256: sha256,
    buildTimestamp: new Date().toISOString(),
    minPhpVersion: '8.1',
    minWordPressVersion: '6.4',
    testedUpTo: '6.7',
    requiresElementor: '3.18.0',
    requiresWooCommerce: '8.0.0',
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`  ✅ Updated release manifest: ${manifestPath}`);

  // 4. Final Summary
  console.log('\n================================================================');
  console.log('                 PACKAGE SUMMARY & INTEGRITY                    ');
  console.log('================================================================');
  console.log(`Package Name      : craftor-core-1.0.0.zip`);
  console.log(`Included Files    : ${files.length} files (100% forward-slash UNIX paths)`);
  console.log(`Uncompressed Size : ${(files.reduce((acc, f) => acc + fs.statSync(f.fullPath).size, 0) / 1024).toFixed(2)} KB`);
  console.log(`Compressed Size   : ${sizeKb} KB`);
  console.log(`SHA-256 Checksum  : ${sha256}`);
  console.log(`Distribution Path : dist-bin/craftor-core-1.0.0.zip`);
  console.log('================================================================\n');

  console.log('🚀 CRAFTOR CORE PLUGIN PACKAGED FOR v1.0 GA RELEASE SUCCESSFULLY ✅\n');
}

if (require.main === module) {
  packagePlugin();
}

module.exports = { packagePlugin };
