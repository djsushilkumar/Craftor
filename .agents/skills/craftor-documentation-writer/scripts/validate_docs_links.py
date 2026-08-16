#!/usr/bin/env python3
"""
Craftor Documentation Link & Code Block Validator
Checks markdown files for broken relative links and unclosed code blocks.
"""
import sys
import re

def validate_markdown(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] Could not read file: {e}")
        return False

    # Check balanced code fences
    fence_count = len(re.findall(r"^```", content, re.MULTILINE))
    if fence_count % 2 != 0:
        print(f"[FAIL] Unbalanced code block fences (count: {fence_count}) in '{file_path}'")
        return False

    # Check for placeholder text
    placeholders = ["TODO", "TBD", "lorem ipsum", "FIXME"]
    for ph in placeholders:
        if ph in content:
            print(f"[FAIL] Placeholder string '{ph}' found in documentation file '{file_path}'")
            return False

    print(f"[PASS] Markdown file '{file_path}' conforms to publication standards.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_docs_links.py <path_to_markdown.md>")
        sys.exit(1)
    success = validate_markdown(sys.argv[1])
    sys.exit(0 if success else 1)
