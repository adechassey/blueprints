---
id: adapter-to-record
name: Prisma-to-Domain Adapter
description: "Static toRecord() parsing enums via Zod, converting dates to ISO strings, mapping Prisma fields to domain shape"
usage: Use for mapping Prisma model types to domain record types
project: server
layer: adapter
source: target/server/src/area/repository/area.adapter.ts:L5
---

# Prisma-to-Domain Adapter

## When to use

Use for mapping Prisma model types to domain record types

## Reference implementation

```typescript
import { type Area, AreaStatusSchema } from '@acme/schemas/area';
import { Area as PrismaArea } from '@prisma/client';

/**
 * @Blueprint adapter-to-record
 * @BlueprintName Prisma-to-Domain Adapter
 * @BlueprintUsage Use for mapping Prisma model types to domain record types
 * @BlueprintDescription Static toRecord() parsing enums via Zod, converting dates to ISO strings, mapping Prisma fields to domain shape
 */
export class AreaAdapter {
  static toRecord = (db: PrismaArea): Area => ({
    id: db.id,
    name: db.name,
    status: AreaStatusSchema.parse(db.status),
    companyId: db.companyId,
    createdAt: db.createdAt.toISOString(),
    updatedAt: db.updatedAt.toISOString(),
  });
}
```
