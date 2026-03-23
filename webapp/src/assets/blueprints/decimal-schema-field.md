---
id: decimal-schema-field
name: Decimal Schema Field
description: "Using MoneySchema/PercentageSchema and their refinement factories (NonnegativeMoneySchema(), PositiveMoneySchema(), PercentageRangeSchema()) as field types in entity schemas. Pass an optional message to override the default translated error."
usage: Use when adding a monetary or percentage field to a Zod entity schema
project: shared
layer: schema
source: target/schemas/src/activity.schema.ts:L45
---

# Decimal Schema Field

## When to use

Use when adding a monetary or percentage field to a Zod entity schema

## Reference implementation

```typescript
import { z } from 'zod';
import {
  MoneySchema,
  NonnegativeMoneySchema,
  PercentageRangeSchema,
  PercentageSchema,
  PositiveMoneySchema,
} from './decimal.schema.js';

  /**
   * @Blueprint decimal-schema-field
   * @BlueprintName Decimal Schema Field
   * @BlueprintUsage Use when adding a monetary or percentage field to a Zod entity schema
   * @BlueprintDescription Using MoneySchema/PercentageSchema and their refinement factories (NonnegativeMoneySchema(), PositiveMoneySchema(), PercentageRangeSchema()) as field types in entity schemas. Pass an optional message to override the default translated error.
   */
  totalInvestment: NonnegativeMoneySchema().describe('Total investment amount'),
  startDate: z.iso.datetime().describe('Activity start date'),
  endDate: z.iso.datetime().describe('Activity end date'),
  description: z.string().max(300).nullable().describe('Activity description'),
  status: ActivityStatusSchema.describe('Activity status'),
  committed: NonnegativeMoneySchema().describe('SAP/ERP: amounts reserved/obligated'),
  effective: NonnegativeMoneySchema().describe('SAP/ERP: amounts actually paid/invoiced'),
  consumptionUpdatedAt: z.iso.datetime().nullable().describe('Last SAP consumption sync timestamp'),
  cancellationReason: z.string().max(500).nullable().describe('Reason for cancellation'),
  companyId: z.string().describe('Company ID'),
  areaId: z.string().describe('Area ID'),
  subareaId: z.string().describe('Subarea ID'),
  geographyIds: z.array(z.string()).describe('Geography IDs'),
  channelIds: z.array(z.string()).describe('Channel IDs'),
  macroProjectId: z.string().describe('Macro Project ID'),
  createdById: z.string().describe('Creator user ID'),
  templateId: z.string().nullable().describe('Activity template ID'),
  segmentId: z.string().describe('Segment ID'),
  fiscalYear: z.number().int().describe('Fiscal year (July-June)'),
  createdAt: z.iso.datetime().describe('Created timestamp'),
  updatedAt: z.iso.datetime().describe('Updated timestamp'),
});
```
