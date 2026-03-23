---
id: decimal-core-logic
name: Decimal Core Logic
description: "Pure functions using Decimal method-chaining (.plus(), .minus(), .mul(), .div(), .gt(), .equals()) with ZERO/HUNDRED constants and maxDecimal/sumDecimals helpers"
usage: Use when writing pure business logic that performs arithmetic on monetary/percentage values
project: server
layer: core
source: target/server/src/activity/activity.core.ts:L239
---

# Decimal Core Logic

## When to use

Use when writing pure business logic that performs arithmetic on monetary/percentage values

## Reference implementation

```typescript
import type { Decimal } from '@acme/schemas/decimal-core';

/**
 * @Blueprint decimal-core-logic
 * @BlueprintName Decimal Core Logic
 * @BlueprintUsage Use when writing pure business logic that performs arithmetic on monetary/percentage values
 * @BlueprintDescription Pure functions using Decimal method-chaining (.plus(), .minus(), .mul(), .div(), .gt(), .equals()) with ZERO/HUNDRED constants and maxDecimal/sumDecimals helpers
 */
export function computeSpent(committed: Decimal, effective: Decimal): Decimal {
  return committed.plus(effective);
}
```
