---
id: repository-create
name: Repository Create
description: "Destructures companyId, creates with company connect, maps through adapter"
usage: Use for Prisma create with company relation connect and adapter mapping
project: server
layer: repository
source: target/server/src/area/repository/area.repository.ts:L105
---

# Repository Create

## When to use

Use for Prisma create with company relation connect and adapter mapping

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
 * @Blueprint repository-create
 * @BlueprintName Repository Create
 * @BlueprintUsage Use for Prisma create with company relation connect and adapter mapping
 * @BlueprintDescription Destructures companyId, creates with company connect, maps through adapter
 */
async create(data: CreateAreaRecord): Promise<AreaRecord> {
  const { companyId, ...areaData } = data;

  const created = await this.scopedPrisma.db.area.create({
    data: {
      ...areaData,
      company: { connect: { id: companyId } },
    },
  });

  return AreaAdapter.toRecord(created);
}
```
