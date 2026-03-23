---
id: service-search
name: Service Search
description: "Checks permission, delegates to repository.find, wraps with buildPaginationMeta"
usage: Use for paginated search with permission check and buildPaginationMeta
project: server
layer: service
source: target/server/src/area/area.service.ts:L32
---

# Service Search

## When to use

Use for paginated search with permission check and buildPaginationMeta

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
import { buildPaginationMeta } from '../common/core/pagination.core';

/**
 * @Blueprint service-search
 * @BlueprintName Service Search
 * @BlueprintUsage Use for paginated search with permission check and buildPaginationMeta
 * @BlueprintDescription Checks permission, delegates to repository.find, wraps with buildPaginationMeta
 */
async find(query: QueryAreas): Promise<PaginatedAreas> {
  this.permissionService.require(Permissions.AREA_READ);

  const { data, total } = await this.repository.find(query);

  return {
    data,
    meta: buildPaginationMeta(query, total),
  };
}
```
