---
id: dto-codec
name: DTO with Codec
description: "createZodDto(Schema, { codec: true }) enables encode/decode for Decimal codec fields. Required when the schema contains codec fields; without it NestJS serialization won't encode Decimals to strings. Schemas without codecs omit the option."
usage: "Use when creating a DTO for a schema that contains codec fields (MoneySchema, PercentageSchema)"
project: server
layer: dto
source: target/server/src/activity/dto/activity.dto.ts:L16
---

# DTO with Codec

## When to use

Use when creating a DTO for a schema that contains codec fields (MoneySchema, PercentageSchema)

## Reference implementation

```typescript
import {
  ActivityDetailSchema,
  BudgetValidationResultSchema,
  CancelActivitySchema,
  CreateActivityResultSchema,
  CreateActivitySchema,
  PaginatedActivitiesSchema,
  UpdateActivitySchema,
  ValidateBudgetIncreaseSchema,
} from '@acme/schemas/activity';
import { createZodDto } from 'nestjs-zod';

/**
 * @Blueprint dto-codec
 * @BlueprintName DTO with Codec
 * @BlueprintUsage Use when creating a DTO for a schema that contains codec fields (MoneySchema, PercentageSchema)
 * @BlueprintDescription createZodDto(Schema, { codec: true }) enables encode/decode for Decimal codec fields. Required when the schema contains codec fields; without it NestJS serialization won't encode Decimals to strings. Schemas without codecs omit the option.
 */
export class ActivityDetailDto extends createZodDto(ActivityDetailSchema, { codec: true }) {}
```
