---
id: schema-paginated
name: Schema Paginated
description: "z.object with data: z.array(EntitySchema) and meta: PaginationMetaSchema"
usage: Use for paginated response schema with data array and PaginationMetaSchema
project: shared
layer: schema
source: target/schemas/src/area.schema.ts:L86
---

# Schema Paginated

## When to use

Use for paginated response schema with data array and PaginationMetaSchema

## Reference implementation

```typescript
import { z } from 'zod';
import { PaginationMetaSchema } from './common/pagination.schema.js';

/**
 * @Blueprint schema-paginated
 * @BlueprintName Schema Paginated
 * @BlueprintUsage Use for paginated response schema with data array and PaginationMetaSchema
 * @BlueprintDescription z.object with data: z.array(EntitySchema) and meta: PaginationMetaSchema
 */
export const PaginatedAreasSchema = z.object({
  data: z.array(AreaSchema).describe('List of areas'),
  meta: PaginationMetaSchema.describe('Pagination metadata'),
});
```
