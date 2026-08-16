#!/usr/bin/env python3
"""
Craftor JSON-RPC 2.0 Validator
Validates JSON-RPC request and response packet payloads.
"""
import sys
import json

def validate_jsonrpc_packet(packet):
    if not isinstance(packet, dict):
        return False, "Packet must be a JSON object"

    if packet.get("jsonrpc") != "2.0":
        return False, "Missing or invalid 'jsonrpc' version string (must be '2.0')"

    if "id" not in packet and "method" in packet:
        # Notification is acceptable, but for tool calls we expect an id
        pass

    if "result" in packet and "error" in packet:
        return False, "Packet cannot contain both 'result' and 'error' keys"

    if "error" in packet:
        err = packet["error"]
        if not isinstance(err, dict) or "code" not in err or "message" not in err:
            return False, "Malformed JSON-RPC error object"

    return True, "OK"

def main(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to load JSON: {e}")
        return False

    valid, msg = validate_jsonrpc_packet(data)
    if not valid:
        print(f"[FAIL] JSON-RPC packet invalid: {msg}")
        return False

    print(f"[PASS] JSON-RPC packet in '{file_path}' conforms to 2.0 specification.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_jsonrpc.py <path_to_packet.json>")
        sys.exit(1)
    success = main(sys.argv[1])
    sys.exit(0 if success else 1)
