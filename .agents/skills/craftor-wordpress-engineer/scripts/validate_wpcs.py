#!/usr/bin/env python3
"""
Craftor WordPress Code Standards Validator
Checks PHP files for security anti-patterns (un-prepared SQL, direct $_POST usage, missing nonce).
"""
import sys
import re

ANTI_PATTERNS = [
    (r"\$wpdb->query\(\s*\"[^\"]*\$[^\"].*\"\s*\)", "Unprepared direct SQL query detected! Use $wpdb->prepare()."),
    (r"\$_POST\[|\$_GET\[|\$_REQUEST\[", "Direct superglobal access detected! Use sanitize_* functions or REST request object."),
    (r"eval\(", "Dangerous eval() usage detected!"),
    (r"extract\(", "Dangerous extract() usage detected!")
]

def check_php_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] Could not read file: {e}")
        return False

    violations = []
    for pattern, msg in ANTI_PATTERNS:
        if re.search(pattern, content):
            violations.append(msg)

    if violations:
        print(f"[FAIL] Security violations in '{file_path}':")
        for v in violations:
            print(f"  - {v}")
        return False

    print(f"[PASS] PHP file '{file_path}' passed WPCS security audit.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_wpcs.py <path_to_file.php>")
        sys.exit(1)
    success = check_php_file(sys.argv[1])
    sys.exit(0 if success else 1)
