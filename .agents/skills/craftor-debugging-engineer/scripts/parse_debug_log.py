#!/usr/bin/env python3
"""
Craftor Debug Log Parser
Scans WordPress debug.log for Fatal Errors, Exceptions, and Deprecated notices.
"""
import sys
import re

SEVERITY_PATTERNS = {
    "FATAL": re.compile(r"PHP Fatal error:\s*(.*)", re.IGNORECASE),
    "PARSE": re.compile(r"PHP Parse error:\s*(.*)", re.IGNORECASE),
    "WARNING": re.compile(r"PHP Warning:\s*(.*)", re.IGNORECASE),
    "DEPRECATED": re.compile(r"PHP Deprecated:\s*(.*)", re.IGNORECASE),
}

def parse_log(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
    except Exception as e:
        print(f"[ERROR] Could not read log file: {e}")
        return False

    summary = {"FATAL": [], "PARSE": [], "WARNING": [], "DEPRECATED": []}

    for line in lines:
        for sev, pat in SEVERITY_PATTERNS.items():
            match = pat.search(line)
            if match:
                summary[sev].append(match.group(1).strip())

    print(f"--- Debug Log Analysis for '{file_path}' ---")
    print(f"Fatal Errors: {len(summary['FATAL'])}")
    print(f"Parse Errors: {len(summary['PARSE'])}")
    print(f"Warnings: {len(summary['WARNING'])}")
    print(f"Deprecated Notices: {len(summary['DEPRECATED'])}")

    if summary["FATAL"]:
        print("\n[CRITICAL] Recent Fatal Errors:")
        for err in summary["FATAL"][-3:]:
            print(f"  - {err}")
        return False

    print("\n[PASS] No fatal errors detected in debug log.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_debug_log.py <path_to_debug.log>")
        sys.exit(1)
    success = parse_log(sys.argv[1])
    sys.exit(0 if success else 1)
