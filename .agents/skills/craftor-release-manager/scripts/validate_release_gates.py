#!/usr/bin/env python3
"""
Craftor Release Stage Gate Validator
Verifies that all 5 Stage Gates have recorded approvals before authorizing release.
"""
import sys
import re

REQUIRED_GATES = [
    "Gate 1: Specification",
    "Gate 2: Architecture",
    "Gate 3: Implementation",
    "Gate 4: Evals & QA",
    "Gate 5: Distribution"
]

def validate_signoff_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] Could not read file: {e}")
        return False

    missing_gates = []
    for gate in REQUIRED_GATES:
        if not re.search(re.escape(gate), content, re.IGNORECASE):
            missing_gates.append(gate)

    if missing_gates:
        print(f"[FAIL] Missing Stage Gate approvals: {', '.join(missing_gates)}")
        return False

    if "APPROVED" not in content or "AUTHORIZED" not in content:
        print("[FAIL] Missing explicit APPROVED / AUTHORIZED status badges.")
        return False

    print(f"[PASS] All 5 Stage Gates verified. Release '{file_path}' is certified for distribution.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_release_gates.py <path_to_gate_signoff.md>")
        sys.exit(1)
    success = validate_signoff_file(sys.argv[1])
    sys.exit(0 if success else 1)
