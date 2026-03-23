---
id: repository-search
name: Repository Search
description: "Parallel findMany + count with where clause from applyFilters, orderBy, skip/take"
usage: "Use for paginated queries with where clause, orderBy, skip/take, and parallel count"
project: server
layer: repository
source: target/server/src/area/repository/area.repository.ts:L24
---

# Repository Search

## When to use

Use for paginated queries with where clause, orderBy, skip/take, and parallel count

## Reference implementation

```typescript
import { AreaAdapter } from './area.adapter';
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
 * @Blueprint repository-search
 * @BlueprintName Repository Search
 * @BlueprintUsage Use for paginated queries with where clause, orderBy, skip/take, and parallel count
 * @BlueprintDescription Parallel findMany + count with where clause from applyFilters, orderBy, skip/take
 */
async find(query: FindAreasQuery): Promise<AreasRecord> {
  const skip = (query.page - 1) * query.limit;

  const where = this.buildWhereClause(query);
  const orderBy = this.buildOrderByClause(query);

  const [areas, total] = await Promise.all([
    this.scopedPrisma.db.area.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
    }),
    this.scopedPrisma.db.area.count({ where }),
  ]);

  return {
    data: areas.map(AreaAdapter.toRecord),
    total,
  };
}
```
