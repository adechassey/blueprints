---
id: service-lookup
name: Service Lookup
description: "Checks requireAtLeastOneOf permissions, delegates to repository.findAllLookups"
usage: Use for lookup endpoints needing requireAtLeastOneOf permission check
project: server
layer: service
source: target/server/src/area/area.service.ts:L49
---

# Service Lookup

## When to use

Use for lookup endpoints needing requireAtLeastOneOf permission check

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

/**
 * @Blueprint service-lookup
 * @BlueprintName Service Lookup
 * @BlueprintUsage Use for lookup endpoints needing requireAtLeastOneOf permission check
 * @BlueprintDescription Checks requireAtLeastOneOf permissions, delegates to repository.findAllLookups
 */
async findAllLookups(query: QueryAllAreas): Promise<AreaLookup[]> {
  this.permissionService.requireAtLeastOneOf([
    Permissions.AREA_READ,
    Permissions.SUBAREA_READ,
    Permissions.ACTIVITY_READ,
    Permissions.BUDGET_VERSION_READ,
    Permissions.BUDGET_VERSION_MOVEMENT_READ,
    Permissions.BUDGET_VERSION_REASSIGN_READ,
  ]);
  return this.repository.findAllLookups(query);
}
```
