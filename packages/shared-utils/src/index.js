'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.logger = void 0;
exports.generateHexUuid = generateHexUuid;
exports.computeSha256 = computeSha256;
const crypto = require('crypto');
function generateHexUuid(length = 7) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}
function computeSha256(payload) {
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}
exports.logger = {
  info: (message, context) => {
    process.stderr.write(`[INFO] ${message} ${context ? JSON.stringify(context) : ''}\n`);
  },
  error: (message, error) => {
    process.stderr.write(
      `[ERROR] ${message} ${error instanceof Error ? error.stack : String(error)}\n`,
    );
  },
  debug: (message, context) => {
    process.stderr.write(`[DEBUG] ${message} ${context ? JSON.stringify(context) : ''}\n`);
  },
};
//# sourceMappingURL=index.js.map
