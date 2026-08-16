# ADR 004: Three-Tier WordPress Plugin Distribution Model

## Status

Accepted

## Context

Craftor targets three distinct market segments:

1. Open-source developers looking for a free WordPress bridge on WordPress.org.
2. Agencies and visual builders requiring live Elementor canvas sync, WooCommerce catalog operations, and Global Style Kits.
3. Large enterprises and hosting networks managing WordPress Multisite (WPMU), AES-256 KMS key vaults, and white-label client portals.

A monolithic plugin bundling enterprise features into the open-source release adds unnecessary code bloat and complicates licensing.

## Decision

We structure the WordPress plugin codebase into 3 isolated tiers:

- `plugins/craftor-core/` — Free / Open-Source (WP.org compliant, 40 core tools, 5-revision snapshots).
- `plugins/craftor-pro/` — Commercial (160 tools, Live Canvas sync, WooCommerce engine, Global Kits, Visual Diff).
- `plugins/craftor-enterprise/` — Multi-Site & Enterprise (240+ complete tool catalog, WPMU network control, KMS vault, White-label).

## Consequences

- Clean packaging, licensing, and update distribution pathways.
- Low footprint for free users while enabling clean monetization upsells for Pro and Enterprise users.
