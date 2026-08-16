#!/usr/bin/env python3
"""
Craftor Token Cost & Compression Calculator
Estimates token counts and costs across Anthropic, OpenAI, and Gemini models.
"""
import sys

# Average estimation: ~4 chars per token for English text/JSON
CHARS_PER_TOKEN = 4.0

MODEL_PRICING_PER_M = {
    "Claude 3.5 Sonnet (Input)": 3.00,
    "Claude 3.5 Sonnet (Output)": 15.00,
    "GPT-4o (Input)": 2.50,
    "GPT-4o (Output)": 10.00,
    "Gemini 1.5 Pro (Input)": 1.25,
    "Gemini 1.5 Pro (Output)": 5.00,
}

def analyze_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] Could not read file: {e}")
        return False

    char_count = len(content)
    token_est = int(char_count / CHARS_PER_TOKEN)

    print(f"--- Token Analysis for '{file_path}' ---")
    print(f"Characters: {char_count:,}")
    print(f"Estimated Tokens: {token_est:,}")
    print("\nEstimated Input Cost per 1,000 Invocations:")
    for model, price in MODEL_PRICING_PER_M.items():
        if "Input" in model:
            cost = (token_est / 1_000_000) * price * 1000
            print(f"  - {model}: ${cost:.4f}")

    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python calculate_token_cost.py <path_to_prompt_or_schema.json>")
        sys.exit(1)
    analyze_file(sys.argv[1])
