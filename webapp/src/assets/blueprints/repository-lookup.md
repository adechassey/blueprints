---
id: repository-lookup
name: Repository Lookup
description: "findMany with select {id, name}, optional status/relation where clause"
usage: "Use for findMany with select {id, name} and optional status filter"
project: server
layer: repository
source: target/server/src/area/repository/area.repository.ts:L52
---

# Repository Lookup

## When to use

Use for findMany with select {id, name} and optional status filter

## Reference implementation

```typescript
import { Prisma } from '@prisma/client';
import {
  AreaLookupRecord,
  AreaRecord,
  AreasRecord,
  CreateAreaRecord,
  FindAllAreasQuery,
  FindAreasQuery,
  IAreaRepository,
  UpdateAreaRecord,
} from './area.repository.type';

/**
 * @Blueprint repository-lookup
 * @BlueprintName Repository Lookup
 * @BlueprintUsage Use for findMany with select {id, name} and optional status filter
 * @BlueprintDescription findMany with select {id, name}, optional status/relation where clause
 */
async findAllLookups(query: FindAllAreasQuery): Promise<AreaLookupRecord[]> {
  const status = query.status ?? 'active';

  const where: Prisma.AreaWhereInput = {};

  if (status !== 'all') {
    where.status = status;
  }

  if (query.budgetVersionId) {
    where.subareas = {
      some: { budgetItems: { some: { budgetVersionId: query.budgetVersionId } } },
    };
  }

  return this.scopedPrisma.db.area.findMany({
    where,
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
```
