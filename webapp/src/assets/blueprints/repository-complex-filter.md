---
id: repository-complex-filter
name: Repository Complex Filter
description: "applyAllFilters with direct ActivityFilterableFields, relation() for belongsTo (createdBy), manyToMany() for junction tables (brands by FK)"
usage: "Use for building Prisma where clauses with direct, relational, and manyToMany filters via applyAllFilters"
project: server
layer: repository
source: target/server/src/activity/repository/activity.repository.ts:L489
---

# Repository Complex Filter

## When to use

Use for building Prisma where clauses with direct, relational, and manyToMany filters via applyAllFilters

## Reference implementation

```typescript
import {
  ActivityFilterableFields,
  ActivitySortableFields,
  type ActivityStatus,
  type QueryActivities,
} from '@acme/schemas/activity';
import { Prisma } from '@prisma/client';
import {
  applyAllFilters,
  manyToMany,
  relation,
} from '../../common/repository/relational-filter.core';

/**
 * @Blueprint repository-complex-filter
 * @BlueprintName Repository Complex Filter
 * @BlueprintUsage Use for building Prisma where clauses with direct, relational, and manyToMany filters via applyAllFilters
 * @BlueprintDescription applyAllFilters with direct ActivityFilterableFields, relation() for belongsTo (createdBy), manyToMany() for junction tables (brands by FK)
 */
private buildWhereClause(query: QueryActivities): Prisma.ActivityWhereInput {
  return applyAllFilters<Prisma.ActivityWhereInput>(query.filters, {
    direct: { fields: ActivityFilterableFields, model: 'Activity' },
    relational: {
      createdById: relation('createdBy', 'name'),
      brandId: manyToMany('brands', undefined, 'brandId'),
    },
  });
}
```
