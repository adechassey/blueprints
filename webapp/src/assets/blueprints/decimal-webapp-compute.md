---
id: decimal-webapp-compute
name: Webapp Decimal Computation
description: "Webapp-side Decimal arithmetic using toDecimal() to parse wire strings, method-chaining for computation, .toDecimalPlaces() for precision, sumDecimals/ZERO/HUNDRED helpers"
usage: Use when writing webapp utility functions that compute monetary or percentage values
project: webapp
layer: unknown
source: target/webapp/src/core/activity/activity-brands.util.ts:L24
---

# Webapp Decimal Computation

## When to use

Use when writing webapp utility functions that compute monetary or percentage values

## Reference implementation

```typescript
import { type Decimal, HUNDRED, sumDecimals, ZERO } from '@acme/schemas/decimal-core';

/**
 * @Blueprint decimal-webapp-compute
 * @BlueprintName Webapp Decimal Computation
 * @BlueprintUsage Use when writing webapp utility functions that compute monetary or percentage values
 * @BlueprintDescription Webapp-side Decimal arithmetic using toDecimal() to parse wire strings, method-chaining for computation, .toDecimalPlaces() for precision, sumDecimals/ZERO/HUNDRED helpers
 */
export function calculateAmount(percentage: Decimal, totalInvestment: Decimal): Decimal {
  return percentage.times(totalInvestment).dividedBy(HUNDRED).toDecimalPlaces(AMOUNT_PRECISION);
}
```
