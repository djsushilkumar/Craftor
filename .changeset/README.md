# Changesets in Craftor Monorepo

This directory contains configuration and pending changeset files for `@changesets/cli`.

## Adding a Changeset

When adding new features, fixing bugs, or updating packages, run:

```bash
pnpm changeset
```

Follow the interactive prompts to select the modified packages, choose the bump type (`patch`, `minor`, or `major`), and provide a release summary.

## Release Process

The automated GitHub Actions workflow (`.github/workflows/release.yml`) handles version bumping and publishing automatically on push to `main`.
