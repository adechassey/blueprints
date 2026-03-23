---
id: decimal-schema-refinement
name: Decimal Schema Refinement
description: Pure validation functions using sumDecimals + .equals() for Zod .refine() callbacks on schemas containing Decimal fields
usage: Use when adding cross-field Zod refinements that compare or aggregate Decimal values
project: shared
layer: core
source: target/schemas/src/activity.core.ts:L19
---

# Decimal Schema Refinement

## When to use

Use when adding cross-field Zod refinements that compare or aggregate Decimal values

## Reference implementation

```typescript
import { type Decimal, HUNDRED, sumDecimals } from './decimal.core';

/**
 * @Blueprint decimal-schema-refinement
 * @BlueprintName Decimal Schema Refinement
 * @BlueprintUsage Use when adding cross-field Zod refinements that compare or aggregate Decimal values
 * @BlueprintDescription Pure validation functions using sumDecimals + .equals() for Zod .refine() callbacks on schemas containing Decimal fields
 */
export const forecastSumMatchesInvestment = (data: {
  forecasts: Record<string, Decimal>;
  totalInvestment: Decimal;
}): boolean => {
  const forecastSum = sumDecimals(Object.values(data.forecasts));
  return forecastSum.equals(data.totalInvestment);
};
```
