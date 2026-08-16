#!/usr/bin/env python3
"""
Craftor QA Test Coverage & Status Auditor
Inspects test result files and verifies coverage thresholds.
"""
import sys
import json

MIN_COVERAGE = 90.0

def audit_coverage(summary_file):
    try:
        with open(summary_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[ERROR] Could not parse test summary: {e}")
        return False

    coverage = data.get("line_coverage", 0.0)
    failed_tests = data.get("failed_count", 0)

    print(f"--- QA Test Audit Report ---")
    print(f"Total Tests Executed: {data.get('total_count', 0)}")
    print(f"Failed Tests: {failed_tests}")
    print(f"Line Coverage: {coverage:.1f}%")

    if failed_tests > 0:
        print(f"[FAIL] {failed_tests} automated tests failed.")
        return False

    if coverage < MIN_COVERAGE:
        print(f"[FAIL] Line coverage ({coverage}%) is below minimum threshold ({MIN_COVERAGE}%).")
        return False

    print("[PASS] Release satisfies all QA quality standards.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_test_audit.py <path_to_test_summary.json>")
        sys.exit(1)
    success = audit_coverage(sys.argv[1])
    sys.exit(0 if success else 1)
