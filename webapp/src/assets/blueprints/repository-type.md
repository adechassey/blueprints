---
id: repository-type
name: Repository Interface Type
description: "Interface with find, findOne, findAllLookups, create, update, delete methods and schema-derived record types"
usage: Use for defining repository contract with domain record types derived from shared schemas
project: server
layer: repository
source: target/server/src/area/repository/area.repository.type.ts:L11
---

# Repository Interface Type

## When to use

Use for defining repository contract with domain record types derived from shared schemas

## Reference implementation

```typescript
import type {
  Area,
  AreaLookup,
  CreateArea,
  QueryAllAreas,
  QueryAreas,
  UpdateArea,
} from '@acme/schemas/area';

/**
 * @Blueprint repository-type
 * @BlueprintName Repository Interface Type
 * @BlueprintUsage Use for defining repository contract with domain record types derived from shared schemas
 * @BlueprintDescription Interface with find, findOne, findAllLookups, create, update, delete methods and schema-derived record types
 */
export type CreateAreaRecord = CreateArea & { companyId: string };
```
