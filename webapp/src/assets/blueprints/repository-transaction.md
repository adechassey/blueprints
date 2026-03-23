---
id: repository-transaction
name: Repository Transaction
description: "scopedPrisma.db.$transaction(async (tx) => ...) with delete-many + create-many + update to atomically replace related records"
usage: Use for wrapping multiple Prisma operations in an interactive transaction for atomicity
project: server
layer: repository
source: target/server/src/subarea/repository/subarea.repository.ts:L157
---

# Repository Transaction

## When to use

Use for wrapping multiple Prisma operations in an interactive transaction for atomicity

## Reference implementation

```typescript
import {
  QuerySubareas,
  Subarea,
  SubareaFilterableFields,
  SubareaSortableFields,
} from '@acme/schemas/subarea';
import { SubareaAdapter } from './subarea.adapter';
import {
  CreateSubareaRecord,
  FindAllSubareasQuery,
  FindSubareasQuery,
  ISubareaRepository,
  SubareaLookupRecord,
  SubareasRecord,
  UpdateSubareaRecord,
} from './subarea.repository.type';

/**
 * @Blueprint repository-transaction
 * @BlueprintName Repository Transaction
 * @BlueprintUsage Use for wrapping multiple Prisma operations in an interactive transaction for atomicity
 * @BlueprintDescription scopedPrisma.db.$transaction(async (tx) => ...) with delete-many + create-many + update to atomically replace related records
 */
async update(id: string, data: UpdateSubareaRecord): Promise<Subarea> {
  const { brandIds, ...subareaData } = data;
  const brandsData = brandIds?.map((brandId) => ({ subareaId: id, brandId }));

  return this.scopedPrisma.db.$transaction(async (tx) => {
    if (brandsData !== undefined) {
      await tx.subareaBrands.deleteMany({ where: { subareaId: id } });
      await tx.subareaBrands.createMany({ data: brandsData });
    }
    await tx.subarea.update({ where: { id }, data: subareaData });

    const result = await tx.subarea.findUniqueOrThrow({
      where: { id },
      include: DETAIL_INCLUDE,
    });
    return SubareaAdapter.toSubarea(result);
  });
}
```
