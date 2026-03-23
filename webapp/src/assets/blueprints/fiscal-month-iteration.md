---
id: fiscal-month-iteration
name: Fiscal Month Iteration
description: "As-const FISCAL_MONTHS array with derived types (FiscalMonth, FiscalMonthName, ForecastAmountKey, MonthAmountKey, MonthMovementKey) and key arrays (FORECAST_AMOUNT_KEYS, MONTH_MOVEMENT_KEYS). Consumers destructure {amountKey}, {movementKey}, {name}, {fiscalMonth} in reduce (totals), map (transformations), for-of (mutations), and some (predicates)."
usage: "Use for iterating over fiscal months to compute totals, transform month-keyed records, or build month-indexed data structures"
project: shared
layer: unknown
source: target/schemas/src/fiscal-month.constant.ts:L2
---

# Fiscal Month Iteration

## When to use

Use for iterating over fiscal months to compute totals, transform month-keyed records, or build month-indexed data structures

## Reference implementation

```typescript
/**
 * @Blueprint fiscal-month-iteration
 * @BlueprintName Fiscal Month Iteration
 * @BlueprintUsage Use for iterating over fiscal months to compute totals, transform month-keyed records, or build month-indexed data structures
 * @BlueprintDescription As-const FISCAL_MONTHS array with derived types (FiscalMonth, FiscalMonthName, ForecastAmountKey, MonthAmountKey, MonthMovementKey) and key arrays (FORECAST_AMOUNT_KEYS, MONTH_MOVEMENT_KEYS). Consumers destructure {amountKey}, {movementKey}, {name}, {fiscalMonth} in reduce (totals), map (transformations), for-of (mutations), and some (predicates).
 */
export const FISCAL_MONTHS = [
  { name: 'july', amountKey: 'julyAmount', movementKey: 'julyMovement', fiscalMonth: 1 },
  { name: 'august', amountKey: 'augustAmount', movementKey: 'augustMovement', fiscalMonth: 2 },
  {
    name: 'september',
    amountKey: 'septemberAmount',
    movementKey: 'septemberMovement',
    fiscalMonth: 3,
  },
  { name: 'october', amountKey: 'octoberAmount', movementKey: 'octoberMovement', fiscalMonth: 4 },
  {
    name: 'november',
    amountKey: 'novemberAmount',
    movementKey: 'novemberMovement',
    fiscalMonth: 5,
  },
  {
    name: 'december',
    amountKey: 'decemberAmount',
    movementKey: 'decemberMovement',
    fiscalMonth: 6,
  },
  { name: 'january', amountKey: 'januaryAmount', movementKey: 'januaryMovement', fiscalMonth: 7 },
  {
    name: 'february',
    amountKey: 'februaryAmount',
    movementKey: 'februaryMovement',
    fiscalMonth: 8,
  },
  { name: 'march', amountKey: 'marchAmount', movementKey: 'marchMovement', fiscalMonth: 9 },
  { name: 'april', amountKey: 'aprilAmount', movementKey: 'aprilMovement', fiscalMonth: 10 },
  { name: 'may', amountKey: 'mayAmount', movementKey: 'mayMovement', fiscalMonth: 11 },
  { name: 'june', amountKey: 'juneAmount', movementKey: 'juneMovement', fiscalMonth: 12 },
] as const;
```
