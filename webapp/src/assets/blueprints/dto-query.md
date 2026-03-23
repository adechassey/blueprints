---
id: dto-query
name: Query DTO Wrappers
description: "QueryDto, QueryAllDto, and IdParamDto classes extending createZodDto for search, lookup, and ID param validation"
usage: Use for query param and path param DTOs wrapping shared Zod schemas via createZodDto
project: server
layer: dto
source: target/server/src/area/dto/query-area.dto.ts:L5
---

# Query DTO Wrappers

## When to use

Use for query param and path param DTOs wrapping shared Zod schemas via createZodDto

## Reference implementation

```typescript
import { AreaIdParamSchema, QueryAllAreasSchema, QueryAreasSchema } from '@acme/schemas/area';
import { createZodDto } from 'nestjs-zod';

/**
 * @Blueprint dto-query
 * @BlueprintName Query DTO Wrappers
 * @BlueprintUsage Use for query param and path param DTOs wrapping shared Zod schemas via createZodDto
 * @BlueprintDescription QueryDto, QueryAllDto, and IdParamDto classes extending createZodDto for search, lookup, and ID param validation
 */
export class QueryAreasDto extends createZodDto(QueryAreasSchema) {}
```
