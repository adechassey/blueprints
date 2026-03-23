---
id: adapter-prisma-type
name: Adapter Prisma Type
description: "Private type alias using Prisma.XxxGetPayload<{include: ...}> to match repository query shape, ensuring type safety between include clause and adapter mapping"
usage: Use for deriving adapter input types from Prisma include clauses via GetPayload utility
project: server
layer: adapter
source: target/server/src/inbox-notification/repository/inbox-notification.adapter.ts:L6
---

# Adapter Prisma Type

## When to use

Use for deriving adapter input types from Prisma include clauses via GetPayload utility

## Reference implementation

```typescript
import type { Prisma } from '@prisma/client';

/**
 * @Blueprint adapter-prisma-type
 * @BlueprintName Adapter Prisma Type
 * @BlueprintUsage Use for deriving adapter input types from Prisma include clauses via GetPayload utility
 * @BlueprintDescription Private type alias using Prisma.XxxGetPayload<{include: ...}> to match repository query shape, ensuring type safety between include clause and adapter mapping
 */
type UserTaskWithRelations = Prisma.ApprovalUserTaskGetPayload<{
  include: {
    task: {
      include: {
        instance: {
          include: { requestedBy: { select: { name: true; email: true } } };
        };
      };
    };
  };
}>;
```
