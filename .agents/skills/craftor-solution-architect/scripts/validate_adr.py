#!/usr/bin/env python3
"""
Craftor ADR Validator Script
Validates that an Architecture Decision Record adheres to architectural guidelines.
"""
import sys
import re

REQUIRED_ADR_HEADERS = [
    "Status",
    "Context",
    "Decision",
    "Consequences"
]

def validate_adr_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] Could not read file: {e}")
        return False

    missing = []
    for header in REQUIRED_ADR_HEADERS:
        if not re.search(r"##\s+" + re.escape(header), content, re.IGNORECASE):
            missing.append(header)

    if missing:
        print(f"[FAIL] ADR '{file_path}' is missing required sections: {', '.join(missing)}")
        return False

    print(f"[PASS] ADR '{file_path}' conforms to architectural standards.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_adr.py <path_to_adr.md>")
        sys.exit(1)
    success = validate_adr_file(sys.argv[1])
    sys.exit(0 if success else 1)
