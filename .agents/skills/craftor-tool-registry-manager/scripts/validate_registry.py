#!/usr/bin/env python3
"""
Craftor Master Tool Registry Validator
Validates unique tool names, taxonomy groupings, and schema integrity.
"""
import sys
import json
import re

NAME_PATTERN = re.compile(r"^(wp|elementor|woo|seo|site|craftor|multisite)_[a-z0-9_]+$")

def validate_tool_entry(tool, seen_names):
    name = tool.get("name")
    if not name:
        return False, "Missing tool name"
    if not NAME_PATTERN.match(name):
        return False, f"Invalid tool name format '{name}' (must follow domain prefix + snake_case)"
    if name in seen_names:
        return False, f"Duplicate tool name '{name}'"
    seen_names.add(name)

    if not tool.get("description") or len(tool["description"]) < 10:
        return False, f"Tool '{name}' description too short or missing"

    schema = tool.get("inputSchema")
    if not schema or schema.get("type") != "object" or "properties" not in schema:
        return False, f"Tool '{name}' has invalid inputSchema structure"

    return True, "OK"

def main(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            tools = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to load registry JSON: {e}")
        return False

    if not isinstance(tools, list):
        print("[FAIL] Master registry must be an array of tool objects.")
        return False

    seen_names = set()
    for tool in tools:
        valid, msg = validate_tool_entry(tool, seen_names)
        if not valid:
            print(f"[FAIL] Registry validation error: {msg}")
            return False

    print(f"[PASS] Master Tool Registry '{file_path}' validated. Total valid tools: {len(seen_names)}")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_registry.py <path_to_registry.json>")
        sys.exit(1)
    success = main(sys.argv[1])
    sys.exit(0 if success else 1)
