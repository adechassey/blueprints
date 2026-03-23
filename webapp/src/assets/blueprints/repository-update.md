---
id: repository-update
name: Repository Update
description: Prisma update by ID with partial data object
usage: Use for Prisma update by ID with partial data
project: server
layer: repository
source: target/server/src/area/repository/area.repository.ts:L124
---

# Repository Update

## When to use

Use for Prisma update by ID with partial data

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
 * @Blueprint repository-update
 * @BlueprintName Repository Update
 * @BlueprintUsage Use for Prisma update by ID with partial data
 * @BlueprintDescription Prisma update by ID with partial data object
 */
async update(id: string, data: UpdateAreaRecord): Promise<AreaRecord> {
  const updated = await this.scopedPrisma.db.area.update({
    where: { id },
    data,
  });
  return AreaAdapter.toRecord(updated);
}
```
