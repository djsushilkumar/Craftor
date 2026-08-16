# ADR 001: Dual-Database Architecture (MySQL Local & PostgreSQL Cloud)

## Status

Accepted

## Context

Craftor serves two fundamentally different operational topologies:

1. Local WordPress execution environments where tools need low-latency, transactional access to `wp_posts`, postmeta, and `_elementor_data` with instant micro-rollback guarantees.
2. Centralized SaaS cloud operations managing multi-tenant organization workspaces, BYOK key vaults, global AI skill/agent marketplaces, Stripe seat billing, and high-throughput telemetry across thousands of client sites.

Attempting to force local WordPress nodes to stream every transaction to a remote database causes network failure points and unacceptable latency. Conversely, storing multi-tenant SaaS accounts within WordPress MySQL limits scalability.

## Decision

We adopt a **Decoupled Dual-Database Architecture**:

- **Local WordPress (MySQL / MariaDB):** Stores local operational records using the `$wpdb->prefix . 'craftor_'` schema (`craftor_snapshots`, `craftor_activity_logs`, `craftor_tokens`, local registries).
- **SaaS Cloud Control Plane (PostgreSQL 16+):** Manages multi-tenancy, Row-Level Security (RLS), billing, global registries, and monthly-partitioned analytics.

## Consequences

- Zero external network dependency for local AI mutations and rollbacks.
- Complete data isolation for SaaS tenants via PostgreSQL RLS.
- Requires dual migration pipelines: WordPress `dbDelta()` / Phinx for local plugins and Prisma Migrate for the SaaS cloud backend.
