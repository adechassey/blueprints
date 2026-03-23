---
id: dto-create
name: DTO Create
description: CreateDto and CreateResultDto classes extending createZodDto for input and response
usage: Use for create input DTO and create result DTO as a pair
project: server
layer: dto
source: target/server/src/area/dto/area.dto.ts:L20
---

# DTO Create

## When to use

Use for create input DTO and create result DTO as a pair

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
 * @Blueprint dto-create
 * @BlueprintName DTO Create
 * @BlueprintUsage Use for create input DTO and create result DTO as a pair
 * @BlueprintDescription CreateDto and CreateResultDto classes extending createZodDto for input and response
 */
export class CreateAreaDto extends createZodDto(CreateAreaSchema) {}
```
