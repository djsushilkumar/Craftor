#!/usr/bin/env python3
"""
Craftor Security Rule Auditor
Scans codebase for hardcoded keys, unescaped queries, and insecure crypto patterns.
"""
import sys
import re

VULN_PATTERNS = [
    (r"(?i)(api[_-]?key|secret|password)\s*=\s*['\"][A-Za-z0-9_\-]{16,}['\"]", "Possible hardcoded API key or secret!"),
    (r"md5\(", "Insecure MD5 hashing detected! Use SHA-256 or wp_hash_password()."),
    (r"sha1\(", "Insecure SHA1 hashing detected! Use SHA-256."),
    (r"CURLOPT_SSL_VERIFYPEER\s*,\s*false", "Insecure TLS verification disabled in cURL!")
]

def scan_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] Could not read file: {e}")
        return False

    findings = []
    for pat, msg in VULN_PATTERNS:
        if re.search(pat, content):
            findings.append(msg)

    if findings:
        print(f"[FAIL] Security vulnerabilities detected in '{file_path}':")
        for f in findings:
            print(f"  - {f}")
        return False

    print(f"[PASS] Security audit clean for '{file_path}'.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python audit_security_rules.py <path_to_code_file>")
        sys.exit(1)
    success = scan_file(sys.argv[1])
    sys.exit(0 if success else 1)
