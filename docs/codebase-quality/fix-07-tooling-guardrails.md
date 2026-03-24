# Fix 07: Tooling Guardrails — Prevent Regressions

**Severity**: High (preventive)
**Report refs**: All — this fix ensures issues from the report never reappear

## Problem

Current tooling allows:
- `as any` with a biome-ignore comment (no hard ban)
- `console.log`/`console.error` in API production code
- No enforcement against `Record<string, unknown>` in API payloads
- No lint rule preventing direct `db` imports in route files (coupling)
- Coverage only enforced on `*.core.ts` — other files can have 0%

## Solution

### Biome: Ban `any` and `console` in production code

Update `biome.json` to:
1. Promote `noExplicitAny` from warning to **error** (remove all biome-ignore suppressions)
2. Ban `console` usage in `api/src/` (except tests and scripts)
3. Enable `noNonNullAssertion` as error (force proper null handling)

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error",
        "noConsole": "warn"
      },
      "style": {
        "noNonNullAssertion": "error"
      }
    }
  },
  "overrides": [
    {
      "includes": ["api/src/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "error"
          }
        }
      }
    },
    {
      "includes": ["**/*.test.ts", "**/*.spec.ts", "scripts/**", "api/scripts/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          }
        }
      }
    },
    {
      "includes": ["cli/src/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          }
        }
      }
    }
  ]
}
```

### Vitest: Expand coverage scope

Currently only `*.core.ts` files are covered. Add minimum thresholds for all source files:

```typescript
// api/vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/db/migrations/**'],
      thresholds: {
        // Strict on pure functions
        'src/**/*.core.ts': {
          lines: 100, functions: 100, branches: 100, statements: 100,
        },
        // Baseline for everything else (raise over time)
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
});
```

### Lefthook: Add biome format check separately

```yaml
pre-commit:
  parallel: true
  commands:
    check:
      run: pnpm check
    check-types:
      run: pnpm check-types
    test:
      run: pnpm test
    knip:
      run: pnpm knip
```

No changes needed — already comprehensive.

### TypeScript: Tighten strict options

Add `noUncheckedIndexedAccess` to all tsconfig files to catch array/object access without null checks:

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

### Knip: Ensure new files are always covered

The current knip config is good. Just verify it catches new hook/lib files by keeping the glob patterns broad.

## Files to modify

- `biome.json` — add overrides, promote rules to error
- `api/vitest.config.ts` — expand coverage thresholds
- `webapp/vitest.config.ts` — expand coverage thresholds
- `cli/vitest.config.ts` — expand coverage thresholds
- `api/tsconfig.json` — add `noUncheckedIndexedAccess`
- `webapp/tsconfig.app.json` — add `noUncheckedIndexedAccess`
- `cli/tsconfig.json` — add `noUncheckedIndexedAccess`

## Acceptance criteria

- [ ] `as any` anywhere in source code causes a biome error (not warning)
- [ ] `console.log` in `api/src/` causes a biome error
- [ ] `console.log` in tests and CLI is allowed
- [ ] `noUncheckedIndexedAccess` enabled in all packages
- [ ] Coverage thresholds set for all source files (not just `*.core.ts`)
- [ ] `pnpm check && pnpm check-types && pnpm test` passes after all other fixes are applied
