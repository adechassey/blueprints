---
id: service-find-one
name: Service Find One
description: "Assigns logger context, checks permission, returns entity or throws NotFound error"
usage: Use for single entity retrieval with not-found error throwing
project: server
layer: service
source: target/server/src/area/area.service.ts:L71
---

# Service Find One

## When to use

Use for single entity retrieval with not-found error throwing

## Reference implementation

```typescript
import type {
  Area,
  AreaLookup,
  AreaStatus,
  CreateArea,
  PaginatedAreas,
  QueryAllAreas,
  QueryAreas,
  UpdateArea,
} from '@acme/schemas/area';
import { Permissions } from '@acme/schemas/permission';
import { AreaNotFound, DuplicateAreaName } from './area.error';

/**
 * @Blueprint service-find-one
 * @BlueprintName Service Find One
 * @BlueprintUsage Use for single entity retrieval with not-found error throwing
 * @BlueprintDescription Assigns logger context, checks permission, returns entity or throws NotFound error
 */
async findOneOrThrow(id: string): Promise<Area> {
  this.logger.assign({ areaId: id });
  this.permissionService.require(Permissions.AREA_READ);

  const area = await this.repository.findOne(id);
  if (!area) {
    throw AreaNotFound(id);
  }
  return area;
}
```
