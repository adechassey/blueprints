---
id: schema-update
name: Schema Update
description: CreateSchema.partial() making all create fields optional for partial updates
usage: Use for update input schema via CreateSchema.partial()
project: shared
layer: schema
source: target/schemas/src/area.schema.ts:L50
---

# Schema Update

## When to use

Use for update input schema via CreateSchema.partial()

## Reference implementation

```typescript
/**
 * @Blueprint schema-update
 * @BlueprintName Schema Update
 * @BlueprintUsage Use for update input schema via CreateSchema.partial()
 * @BlueprintDescription CreateSchema.partial() making all create fields optional for partial updates
 */
export const UpdateAreaSchema = CreateAreaSchema.partial();
```
