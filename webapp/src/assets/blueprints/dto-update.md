---
id: dto-update
name: DTO Update
description: Class extending createZodDto(UpdateSchema) for partial input validation
usage: Use for update input DTO wrapping a partial schema
project: server
layer: dto
source: target/server/src/area/dto/area.dto.ts:L29
---

# DTO Update

## When to use

Use for update input DTO wrapping a partial schema

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
 * @Blueprint dto-update
 * @BlueprintName DTO Update
 * @BlueprintUsage Use for update input DTO wrapping a partial schema
 * @BlueprintDescription Class extending createZodDto(UpdateSchema) for partial input validation
 */
export class UpdateAreaDto extends createZodDto(UpdateAreaSchema) {}
```
