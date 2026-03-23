---
id: schema-lookup
name: Schema Lookup
description: z.object with optional status enum and optional relation ID filters
usage: Use for lookup query schema with optional status and relation filters
project: shared
layer: schema
source: target/schemas/src/area.schema.ts:L103
---

# Schema Lookup

## When to use

Use for lookup query schema with optional status and relation filters

## Reference implementation

```typescript
import { z } from 'zod';

/**
 * @Blueprint schema-lookup
 * @BlueprintName Schema Lookup
 * @BlueprintUsage Use for lookup query schema with optional status and relation filters
 * @BlueprintDescription z.object with optional status enum and optional relation ID filters
 */
export const QueryAllAreasSchema = z.object({
  status: QueryAreaStatusSchema.optional().describe(
    'Filter by status. Use "all" for both active and inactive'
  ),
  budgetVersionId: z
    .uuid()
    .optional()
    .describe('Filter by budget version (areas with budget items in this version)'),
});
```
