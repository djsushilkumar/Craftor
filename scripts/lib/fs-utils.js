/**
 * Craftor Script Filesystem Utilities
 * Shared directory/JSON helpers used by the packaging, configuration and verification runners.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

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

/** Reads and parses a JSON file, returning `fallback` when it is missing or malformed. */
function readJsonFile(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

/** Reads and parses a JSON file, throwing `message` when it is missing or malformed. */
function requireJsonFile(filePath, message) {
  const parsed = readJsonFile(filePath, undefined);
  if (parsed === undefined) {
    throw new Error(message || `Invalid or missing JSON file: ${filePath}`);
  }
  return parsed;
}

function writeJsonFile(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function requirePath(targetPath, message) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(message || `Required path not found: ${targetPath}`);
  }
  return targetPath;
}

/** Asserts that `filePath` exists and contains every string in `requiredFragments`. */
function requireFileContains(filePath, requiredFragments, describe) {
  requirePath(filePath, `${describe || path.basename(filePath)} missing: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const fragment of requiredFragments) {
    if (!content.includes(fragment)) {
      throw new Error(
        `${describe || path.basename(filePath)} validation failed: missing "${fragment}"`,
      );
    }
  }
  return content;
}

module.exports = {
  ROOT_DIR,
  ensureDir,
  copyDirRecursive,
  readJsonFile,
  requireJsonFile,
  writeJsonFile,
  requirePath,
  requireFileContains,
};
