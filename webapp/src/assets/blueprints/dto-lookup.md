---
id: dto-lookup
name: DTO Lookup
description: Class extending createZodDto(LookupSchema) for id/name pair responses
usage: Use for lookup response DTOs returning id/name pairs
project: server
layer: dto
source: target/server/src/area/dto/area.dto.ts:L45
---

# DTO Lookup

## When to use

Use for lookup response DTOs returning id/name pairs

## Reference implementation

```typescript
import {
  AreaLookupSchema,
  AreaSchema,
  CreateAreaResultSchema,
  CreateAreaSchema,
  PaginatedAreasSchema,
  UpdateAreaSchema,
} from '@acme/schemas/area';
import { createZodDto } from 'nestjs-zod';

/**
 * @Blueprint dto-lookup
 * @BlueprintName DTO Lookup
 * @BlueprintUsage Use for lookup response DTOs returning id/name pairs
 * @BlueprintDescription Class extending createZodDto(LookupSchema) for id/name pair responses
 */
export class AreaLookupDto extends createZodDto(AreaLookupSchema) {}
```
