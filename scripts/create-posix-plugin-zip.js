/**
 * Craftor POSIX-Compliant WordPress Plugin ZIP Packager
 * Creates standard PKZip archives with forward slashes ('/') to prevent the infamous
 * "Plugin file does not exist" error on Linux/macOS/cPanel/LocalWP WordPress servers.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT_DIR = path.resolve(__dirname, '..');
const PLUGIN_SRC = path.join(ROOT_DIR, 'plugins', 'craftor-core');
const OUTPUT_ZIP = path.join(ROOT_DIR, 'dist-svn', 'craftor-core.zip');

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

function buildZip() {
  console.log('Building POSIX-Compliant WordPress Plugin ZIP...');
  const files = collectFiles(PLUGIN_SRC);
  
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

  const finalZipBuffer = Buffer.concat([
    Buffer.concat(localHeaders),
    centralDirBuffer,
    eocd,
  ]);

  fs.writeFileSync(OUTPUT_ZIP, finalZipBuffer);
  console.log(`✅ Successfully generated POSIX ZIP: ${OUTPUT_ZIP} (${(finalZipBuffer.length / 1024).toFixed(2)} KB)`);
  console.log(`Verified ${files.length} entries with pure forward-slash UNIX paths (craftor-core/*).`);
}

buildZip();
