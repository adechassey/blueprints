---
id: schema-create
name: Schema Create
description: "EntitySchema.omit({id, companyId, createdAt, updatedAt}) to derive create input"
usage: "Use for create input schema via EntitySchema.omit({id, companyId, timestamps})"
project: shared
layer: schema
source: target/schemas/src/area.schema.ts:L35
---

# Schema Create

## When to use

Use for create input schema via EntitySchema.omit({id, companyId, timestamps})

## Reference implementation

```typescript
/**
 * @Blueprint schema-create
 * @BlueprintName Schema Create
 * @BlueprintUsage Use for create input schema via EntitySchema.omit({id, companyId, timestamps})
 * @BlueprintDescription EntitySchema.omit({id, companyId, createdAt, updatedAt}) to derive create input
 */
export const CreateAreaSchema = AreaSchema.omit({
  id: true,
  companyId: true,
  createdAt: true,
  updatedAt: true,
});
```
