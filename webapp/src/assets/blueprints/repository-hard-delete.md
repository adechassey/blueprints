---
id: repository-hard-delete
name: Repository Hard Delete
description: "Deletes with unscoped prisma, catches P2003 FK constraint"
usage: Use for Prisma delete with P2003 foreign key error handling
project: server
layer: repository
source: target/server/src/area/repository/area.repository.ts:L138
---

# Repository Hard Delete

## When to use

Use for Prisma delete with P2003 foreign key error handling

## Reference implementation

```typescript
import { Prisma } from '@prisma/client';
import { AreaHasDependents } from '../area.error';

/**
 * @Blueprint repository-hard-delete
 * @BlueprintName Repository Hard Delete
 * @BlueprintUsage Use for Prisma delete with P2003 foreign key error handling
 * @BlueprintDescription Deletes with unscoped prisma, catches P2003 FK constraint
 */
async delete(id: string): Promise<void> {
  try {
    await this.scopedPrisma.unscoped.area.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw AreaHasDependents(id);
    }
    throw error;
  }
}
```
