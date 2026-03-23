---
id: dto-entity
name: DTO Entity
description: Class extending createZodDto(EntitySchema) for response serialization
usage: Use for the main entity DTO class wrapping a Zod schema
project: server
layer: dto
source: target/server/src/area/dto/area.dto.ts:L12
---

# DTO Entity

## When to use

Use for the main entity DTO class wrapping a Zod schema

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
 * @Blueprint dto-entity
 * @BlueprintName DTO Entity
 * @BlueprintUsage Use for the main entity DTO class wrapping a Zod schema
 * @BlueprintDescription Class extending createZodDto(EntitySchema) for response serialization
 */
export class AreaDto extends createZodDto(AreaSchema) {}
```
