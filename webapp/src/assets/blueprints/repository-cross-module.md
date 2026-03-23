---
id: repository-cross-module
name: Repository Cross-Module Query
description: "findMany with domain-specific where clause, selective includes, and dedicated adapter mapping; consumed via a BypassPermissions service method from the calling module"
usage: Use for repository methods that expose domain data tailored for consumption by another module
project: server
layer: repository
source: target/server/src/activity/repository/activity.repository.ts:L505
---

# Repository Cross-Module Query

## When to use

Use for repository methods that expose domain data tailored for consumption by another module

## Reference implementation

```typescript
import { Prisma } from '@prisma/client';
import { ActivityAdapter } from './activity.adapter';
import type {
  ActivitiesRecord,
  ActivityDetailRecord,
  ActivityStatusWithoutAdditionalData,
  BudgetTrackingActivityFilters,
  BudgetTrackingActivityRecord,
  CreateActivityRecord,
  FindActivitiesQuery,
  IActivityRepository,
  UpdateActivityRecord,
} from './activity.repository.type';

/**
 * @Blueprint repository-cross-module
 * @BlueprintName Repository Cross-Module Query
 * @BlueprintUsage Use for repository methods that expose domain data tailored for consumption by another module
 * @BlueprintDescription findMany with domain-specific where clause, selective includes, and dedicated adapter mapping; consumed via a BypassPermissions service method from the calling module
 */
async findForBudgetTracking(
  fiscalYear: number,
  filters?: BudgetTrackingActivityFilters
): Promise<BudgetTrackingActivityRecord[]> {
  const where: Prisma.ActivityWhereInput = {
    fiscalYear,
    status: { notIn: BUDGET_TRACKING_EXCLUDED_STATUSES },
  };

  if (filters?.areaId?.length) {
    where.areaId = { in: filters.areaId };
  }
  if (filters?.subareaId?.length) {
    where.subareaId = { in: filters.subareaId };
  }
  if (filters?.segmentId?.length) {
    where.segmentId = { in: filters.segmentId };
  }
  if (filters?.macroProjectId?.length) {
    where.macroProjectId = { in: filters.macroProjectId };
  }
  if (filters?.brandId?.length) {
    where.brands = { some: { brandId: { in: filters.brandId } } };
  }

  const rows = await this.scopedPrisma.db.activity.findMany({
    where,
    include: {
      area: { select: { name: true } },
      subarea: { select: { name: true } },
      segment: { select: { name: true } },
      macroProject: { select: { name: true } },
      forecast: true,
      brands: {
        where: filters?.brandId?.length ? { brandId: { in: filters.brandId } } : undefined,
        include: { brand: { select: { name: true } } },
      },
    },
  });

  return rows.map(ActivityAdapter.toBudgetTrackingRecord);
}
```
