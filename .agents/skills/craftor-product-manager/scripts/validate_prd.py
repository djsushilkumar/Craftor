#!/usr/bin/env python3
"""
Craftor PRD Validator Script
Validates that a Product Requirements Document follows required structural standards.
"""
import sys
import re

REQUIRED_SECTIONS = [
    "Mission & Identity",
    "Target Personas",
    "User Stories",
    "MCP Tool Mappings",
    "Acceptance Criteria",
    "Non-Functional Requirements"
]

def validate_prd_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] Could not read file: {e}")
        return False

    missing = []
    for section in REQUIRED_SECTIONS:
        if not re.search(re.escape(section), content, re.IGNORECASE):
            missing.append(section)

    if missing:
        print(f"[FAIL] Missing required PRD sections: {', '.join(missing)}")
        return False

    # Check Gherkin structure
    if not ("Given" in content and "When" in content and "Then" in content):
        print("[FAIL] Missing Gherkin acceptance criteria (Given/When/Then)")
        return False

    print(f"[PASS] PRD file '{file_path}' satisfies all structural quality standards.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_prd.py <path_to_prd.md>")
        sys.exit(1)
    success = validate_prd_file(sys.argv[1])
    sys.exit(0 if success else 1)
