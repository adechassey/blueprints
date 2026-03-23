---
id: repository-count
name: Repository Count
description: "Prisma count with where clause and nested relation filter, returns Promise<number>"
usage: Use for Prisma count queries with where clause returning a single number
project: server
layer: repository
source: target/server/src/inbox-notification/repository/inbox-notification.repository.ts:L53
---

# Repository Count

## When to use

Use for Prisma count queries with where clause returning a single number

## Reference implementation

```typescript
/**
 * @Blueprint repository-count
 * @BlueprintName Repository Count
 * @BlueprintUsage Use for Prisma count queries with where clause returning a single number
 * @BlueprintDescription Prisma count with where clause and nested relation filter, returns Promise<number>
 */
async countPendingTasks(userId: string, companyId: string): Promise<number> {
  return this.scopedPrisma.db.approvalUserTask.count({
    where: {
      userId,
      status: 'ASSIGNED',
      task: { instance: { companyId } },
    },
  });
}
```
