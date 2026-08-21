/**
 * Craftor Script Console Reporting Utilities
 * Shared banner/summary rendering so every runner prints an identical 64-column report frame.
 */

const RULE_WIDTH = 64;
const RULE = '='.repeat(RULE_WIDTH);

function centerLine(text) {
  const value = String(text);
  if (value.length >= RULE_WIDTH) return value;
  const left = Math.floor((RULE_WIDTH - value.length) / 2);
  return ' '.repeat(left) + value + ' '.repeat(RULE_WIDTH - value.length - left);
}

/** Prints a `====` framed heading followed by a blank line. */
function printBanner(title) {
  console.log(RULE);
  console.log(centerLine(title));
  console.log(`${RULE}\n`);
}

/** Prints a `====` framed heading preceded by a blank line (for mid-script sections). */
function printSection(title) {
  console.log(`\n${RULE}`);
  console.log(centerLine(title));
  console.log(RULE);
}

/** Prints a `====` framed closing message. */
function printFooter(message) {
  console.log(`\n${RULE}`);
  console.log(message);
  console.log(`${RULE}\n`);
}

module.exports = { RULE, RULE_WIDTH, centerLine, printBanner, printSection, printFooter };
