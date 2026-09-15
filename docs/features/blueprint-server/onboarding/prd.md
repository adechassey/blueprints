# Onboarding — PRD

## Goal

Help first-time users get value quickly: understand what the platform is, find a
blueprint, and publish one. Lightweight, client-side only (no schema change).

## Scope

### 1. Welcome banner (home)
- Shown to logged-in users whose account is < 14 days old (`users.createdAt`)
- Dismissible (persisted in `localStorage`, keyed by user id)
- Links to semantic search and the CLI token page

### 2. Getting-started checklist (home)
- 3 steps: Sign in (auto-done) → Open a blueprint (tracked in `localStorage`
  on blueprint detail visits) → Publish a blueprint (via `/users/:id/blueprints`)
- Hidden when dismissed or when all steps are complete

### 3. Enriched empty state
- When a user has no blueprints, the empty state suggests a semantic search example

### 4. CLI onboarding
- After a successful `auth login`, the CLI suggests `search` and `list` as first commands

## Non-Goals

- Multi-step wizard/tour, email sequences, analytics funnels
