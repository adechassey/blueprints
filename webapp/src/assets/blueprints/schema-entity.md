---
id: schema-entity
name: Schema Entity
description: z.object with all fields using .describe() for OpenAPI and i18n validation messages
usage: Use for base entity schema with .describe() for OpenAPI and i18n error messages
project: shared
layer: schema
source: target/schemas/src/area.schema.ts:L14
---

# Schema Entity

## When to use

Use for base entity schema with .describe() for OpenAPI and i18n error messages

## Reference implementation

```typescript
import { z } from 'zod';
import { m } from './paraglide/messages.js';

/**
 * @Blueprint schema-entity
 * @BlueprintName Schema Entity
 * @BlueprintUsage Use for base entity schema with .describe() for OpenAPI and i18n error messages
 * @BlueprintDescription z.object with all fields using .describe() for OpenAPI and i18n validation messages
 */
export const AreaSchema = z.object({
  id: z.string().describe('Area ID (UUID)'),
  name: z
    .string()
    .min(1, { error: m.area_validation_name_required() })
    .max(50, { error: m.area_validation_name_max() })
    .describe('Area name'),
  status: AreaStatusSchema.describe('Status: active or inactive'),
  companyId: z.string().describe('Company ID'),
  createdAt: z.iso.datetime().describe('Created timestamp'),
  updatedAt: z.iso.datetime().describe('Updated timestamp'),
});
```
