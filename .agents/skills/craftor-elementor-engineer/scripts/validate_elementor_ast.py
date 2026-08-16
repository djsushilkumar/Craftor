#!/usr/bin/env python3
"""
Craftor Elementor AST Validator
Validates AST structure, checks for unique UUIDs and valid container/widget hierarchies.
"""
import sys
import json

def validate_node(node, seen_ids):
    if not isinstance(node, dict):
        return False, "Node must be a JSON object"
    
    node_id = node.get("id")
    if not node_id:
        return False, "Node is missing required 'id' attribute"
    
    if node_id in seen_ids:
        return False, f"Duplicate node ID detected: '{node_id}'"
    seen_ids.add(node_id)

    el_type = node.get("elType")
    if el_type not in ["container", "section", "column", "widget"]:
        return False, f"Invalid elType '{el_type}' in node '{node_id}'"

    if el_type == "widget" and not node.get("widgetType"):
        return False, f"Widget node '{node_id}' is missing 'widgetType'"

    for child in node.get("elements", []):
        valid, msg = validate_node(child, seen_ids)
        if not valid:
            return False, msg

    return True, "OK"

def validate_ast_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[ERROR] Could not parse AST JSON: {e}")
        return False

    if not isinstance(data, list):
        print("[FAIL] Root AST structure must be a JSON array of nodes.")
        return False

    seen_ids = set()
    for root_node in data:
        valid, msg = validate_node(root_node, seen_ids)
        if not valid:
            print(f"[FAIL] AST validation failed: {msg}")
            return False

    print(f"[PASS] Elementor AST in '{file_path}' is structurally valid. Total nodes: {len(seen_ids)}")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_elementor_ast.py <path_to_ast.json>")
        sys.exit(1)
    success = validate_ast_file(sys.argv[1])
    sys.exit(0 if success else 1)
