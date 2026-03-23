---
id: repository-find-one
name: Repository Find One
description: "findUnique by ID, maps result through Adapter.toRecord or returns null"
usage: Use for findUnique by ID with adapter mapping to domain record
project: server
layer: repository
source: target/server/src/area/repository/area.repository.ts:L80
---

# Repository Find One

## When to use

Use for findUnique by ID with adapter mapping to domain record

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
 * @Blueprint repository-find-one
 * @BlueprintName Repository Find One
 * @BlueprintUsage Use for findUnique by ID with adapter mapping to domain record
 * @BlueprintDescription findUnique by ID, maps result through Adapter.toRecord or returns null
 */
async findOne(id: string): Promise<AreaRecord | null> {
  const area = await this.scopedPrisma.db.area.findUnique({
    where: { id },
  });

  return area ? AreaAdapter.toRecord(area) : null;
}
```
