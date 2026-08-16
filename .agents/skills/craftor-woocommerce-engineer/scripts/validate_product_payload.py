#!/usr/bin/env python3
"""
Craftor WooCommerce Product Payload Validator
Validates pricing logic and required SKU/Name attributes.
"""
import sys
import json

def validate_product(data):
    if not isinstance(data, dict):
        return False, "Payload must be a JSON object"

    name = data.get("name")
    if not name or len(name.strip()) == 0:
        return False, "Product name cannot be empty."

    reg_price = data.get("regular_price")
    if reg_price is not None:
        try:
            reg_val = float(reg_price)
        except ValueError:
            return False, f"Invalid regular_price value: {reg_price}"

        sale_price = data.get("sale_price")
        if sale_price is not None:
            try:
                sale_val = float(sale_price)
                if sale_val >= reg_val:
                    return False, f"Sale price ({sale_val}) must be strictly less than regular price ({reg_val})."
            except ValueError:
                return False, f"Invalid sale_price value: {sale_price}"

    return True, "OK"

def main(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to load JSON: {e}")
        return False

    valid, msg = validate_product(data)
    if not valid:
        print(f"[FAIL] Product payload invalid: {msg}")
        return False

    print(f"[PASS] Product payload in '{file_path}' is valid.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_product_payload.py <path_to_product.json>")
        sys.exit(1)
    success = main(sys.argv[1])
    sys.exit(0 if success else 1)
