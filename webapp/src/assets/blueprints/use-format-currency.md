---
id: use-format-currency
name: Currency Formatting in Components
description: "Call useFormatCurrency() at the top of the component to get a stable formatter. Pass it to child components as a prop or use directly in JSX. For table columns, pass it into useMemo column factories."
usage: Use when displaying monetary values in organisms/pages that need currency formatting
project: webapp
layer: organism
source: target/webapp/src/ui/components/organisms/activity/ActivityFinancialSummary.tsx:L45
---

# Currency Formatting in Components

## When to use

Use when displaying monetary values in organisms/pages that need currency formatting

## Reference implementation

```tsx
import { toDecimal } from '@acme/schemas/decimal-core';
import { useFormatCurrency } from '@/core/currency/use-format-currency';
import { m } from '@/core/paraglide/messages';
import { StatCard, type statCardVariants } from '@/ui/components/molecules/stat-card/StatCard';

/**
 * @Blueprint use-format-currency
 * @BlueprintName Currency Formatting in Components
 * @BlueprintUsage Use when displaying monetary values in organisms/pages that need currency formatting
 * @BlueprintDescription Call useFormatCurrency() at the top of the component to get a stable formatter. Pass it to child components as a prop or use directly in JSX. For table columns, pass it into useMemo column factories.
 */
export function ActivityFinancialSummary(props: ActivityFinancialSummaryProps) {
  const kpiCards = buildKpiCards(props);
  const formatCurrency = useFormatCurrency();

  return (
    <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
      {kpiCards.map((kpiCard) => {
        const isErpZero = kpiCard.erpField && toDecimal(kpiCard.value).isZero();
        return (
          <StatCard
            key={kpiCard.label}
            label={kpiCard.label}
            value={isErpZero ? '—' : formatCurrency(kpiCard.value)}
            variant={kpiCard.variant}
            tooltip={isErpZero ? m.activity_kpi_erp_unavailable() : undefined}
          />
        );
      })}
    </div>
  );
}
```
