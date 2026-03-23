---
id: adapter-to-detail-record
name: Prisma-to-Domain Detail Adapter
description: "Static toDetailRecord() accepting a Prisma intersection type (entity & { children[] }), maps parent fields and delegates child mapping via db.fields.map(Adapter.toFieldRecord)"
usage: Use for mapping a Prisma entity with included relations to a domain detail type
project: server
layer: adapter
source: target/server/src/activity-template/repository/activity-template.adapter.ts:L39
---

# Prisma-to-Domain Detail Adapter

## When to use

Use for mapping a Prisma entity with included relations to a domain detail type

## Reference implementation

```typescript
import {
  type ActivityTemplate,
  type ActivityTemplateDetail,
  ActivityTemplateStatusSchema,
  type TemplateField,
  TemplateFieldTypeSchema,
} from '@acme/schemas/activity-template';

/**
 * @Blueprint adapter-to-detail-record
 * @BlueprintName Prisma-to-Domain Detail Adapter
 * @BlueprintUsage Use for mapping a Prisma entity with included relations to a domain detail type
 * @BlueprintDescription Static toDetailRecord() accepting a Prisma intersection type (entity & { children[] }), maps parent fields and delegates child mapping via db.fields.map(Adapter.toFieldRecord)
 */
static toDetailRecord = (db: PrismaTemplateWithFields): ActivityTemplateDetail => ({
  id: db.id,
  name: db.name,
  status: ActivityTemplateStatusSchema.parse(db.status),
  companyId: db.companyId,
  createdAt: db.createdAt.toISOString(),
  updatedAt: db.updatedAt.toISOString(),
  fields: db.fields.map(ActivityTemplateAdapter.toFieldRecord),
});
```
