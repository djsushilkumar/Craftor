#!/usr/bin/env python3
"""
Craftor Release Package Integrity Verifier
Calculates SHA-256 checksums and checks for blacklisted development files.
"""
import sys
import hashlib
import zipfile
import os

BLACKLISTED_FILES = [".git", "tests/", "phpunit.xml", "node_modules/"]

def verify_zip(zip_path):
    if not os.path.exists(zip_path):
        print(f"[ERROR] Zip file not found: {zip_path}")
        return False

    # 1. Checksum calculation
    sha256 = hashlib.sha256()
    with open(zip_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    checksum = sha256.hexdigest()
    print(f"SHA-256 Checksum: {checksum}")

    # 2. Inspect contents
    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            namelist = z.namelist()
            for name in namelist:
                for bl in BLACKLISTED_FILES:
                    if bl in name:
                        print(f"[FAIL] Package contains blacklisted development file: {name}")
                        return False
    except Exception as e:
        print(f"[ERROR] Corrupted zip file: {e}")
        return False

    print(f"[PASS] Package '{zip_path}' verified. Clean production bundle.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_package_integrity.py <path_to_plugin.zip>")
        sys.exit(1)
    success = verify_zip(sys.argv[1])
    sys.exit(0 if success else 1)
