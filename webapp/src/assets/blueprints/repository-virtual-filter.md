---
id: repository-virtual-filter
name: Repository Virtual Filter
description: "applyAllFilters with direct fields, relation() for belongsTo, and virtual() via helper functions for dual-column/dual-relation OR filtering"
usage: Use for building Prisma where clauses with virtual() filters that apply custom OR logic across multiple columns or relations
project: server
layer: repository
source: target/server/src/budget-version-reassign/repository/budget-version-reassign.repository.ts:L302
---

# Repository Virtual Filter

## When to use

Use for building Prisma where clauses with virtual() filters that apply custom OR logic across multiple columns or relations

## Reference implementation

```typescript
import type {
  BudgetVersionReassign,
  BudgetVersionReassignDetail,
  QueryBudgetVersionReassigns,
} from '@acme/schemas/budget-version-reassign';
import {
  BudgetVersionReassignFilterableFields,
  BudgetVersionReassignSortableFields,
} from '@acme/schemas/budget-version-reassign';
import type { FilterItem } from '@acme/schemas/common/list-query';
import { Prisma } from '@prisma/client';
import { applyOrderBy, operatorToPrismaCondition } from '../../common/repository/query.core';
import {
  applyAllFilters,
  manyToMany,
  relation,
  virtual,
} from '../../common/repository/relational-filter.core';
import { dualFilter } from '../budget-version-reassign.core';

/**
 * @Blueprint repository-virtual-filter
 * @BlueprintName Repository Virtual Filter
 * @BlueprintUsage Use for building Prisma where clauses with virtual() filters that apply custom OR logic across multiple columns or relations
 * @BlueprintDescription applyAllFilters with direct fields, relation() for belongsTo, and virtual() via helper functions for dual-column/dual-relation OR filtering
 */
private buildWhereClause(
  query: QueryBudgetVersionReassigns
): Prisma.BudgetVersionReassignWhereInput {
  return applyAllFilters<Prisma.BudgetVersionReassignWhereInput>(query.filters, {
    direct: { fields: BudgetVersionReassignFilterableFields, model: 'BudgetVersionReassign' },
    relational: {
      fiscalYear: relation('budgetVersion', 'fiscalYear', { transform: Number }),
      versionName: relation('budgetVersion', 'name'),
      requestedById: relation('requestedBy', 'name'),
      areaId: virtual((filter: FilterItem) => {
        const cond = operatorToPrismaCondition(
          'areaId',
          filter.operator,
          filter.value,
          filter.variant,
          false
        );
        return dualFilter({ sourceSubarea: cond }, { targetSubarea: cond }, filter.operator);
      }),
      subareaId: dualFieldFilter('sourceSubareaId', 'targetSubareaId'),
      segmentId: dualFieldFilter('sourceSegmentId', 'targetSegmentId'),
      macroProjectId: dualFieldFilter('sourceMacroProjectId', 'targetMacroProjectId'),
      budgetType: dualFieldFilter('sourceIsDiscretionary', 'targetIsDiscretionary'),
      brandId: manyToMany('itemReassigns', undefined, 'brandId'),
    },
  });
}
```
