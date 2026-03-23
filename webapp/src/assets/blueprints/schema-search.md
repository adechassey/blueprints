---
id: schema-search
name: Schema Search
description: Reuses ListQuerySchema with typed FilterableFields and SortableFields const arrays
usage: Use for search query schema with FilterableFields and SortableFields arrays
project: shared
layer: schema
source: target/schemas/src/area.schema.ts:L70
---

# Schema Search

## When to use

Use for search query schema with FilterableFields and SortableFields arrays

## Reference implementation

```typescript
import { ListQuerySchema, type SearchableFields } from './common/list-query.schema.js';

/**
 * @Blueprint schema-search
 * @BlueprintName Schema Search
 * @BlueprintUsage Use for search query schema with FilterableFields and SortableFields arrays
 * @BlueprintDescription Reuses ListQuerySchema with typed FilterableFields and SortableFields const arrays
 */
export const QueryAreasSchema = ListQuerySchema;
```
