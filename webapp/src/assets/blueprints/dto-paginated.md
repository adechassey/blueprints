---
id: dto-paginated
name: DTO Paginated
description: Class extending createZodDto(PaginatedSchema) with data array and pagination meta
usage: Use for paginated list response DTOs with data array and meta
project: server
layer: dto
source: target/server/src/area/dto/area.dto.ts:L37
---

# DTO Paginated

## When to use

Use for paginated list response DTOs with data array and meta

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
 * @Blueprint dto-paginated
 * @BlueprintName DTO Paginated
 * @BlueprintUsage Use for paginated list response DTOs with data array and meta
 * @BlueprintDescription Class extending createZodDto(PaginatedSchema) with data array and pagination meta
 */
export class PaginatedAreasDto extends createZodDto(PaginatedAreasSchema) {}
```
