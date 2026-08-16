#!/usr/bin/env python3
"""
Craftor Design Tokens Validator
Validates hex formats and required token keys.
"""
import sys
import json
import re

HEX_REGEX = re.compile(r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")

def validate_tokens_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[ERROR] Could not parse JSON: {e}")
        return False

    if "colors" not in data or "typography" not in data:
        print("[FAIL] Missing top-level 'colors' or 'typography' keys.")
        return False

    # Check brand colors
    brand = data.get("colors", {}).get("brand", {})
    for key, val in brand.items():
        if not (HEX_REGEX.match(val) or val.startswith("rgba")):
            print(f"[FAIL] Invalid color value for brand.{key}: {val}")
            return False

    print(f"[PASS] Design tokens in '{file_path}' validated successfully.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_tokens.py <path_to_tokens.json>")
        sys.exit(1)
    success = validate_tokens_file(sys.argv[1])
    sys.exit(0 if success else 1)
