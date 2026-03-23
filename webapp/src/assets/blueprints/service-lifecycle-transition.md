---
id: service-lifecycle-transition
name: Service Lifecycle Transition
description: "Requires permission, loads the entity, asserts the target transition, persists the new status, then emits audit and wide-event context"
usage: Use for service methods that perform a simple lifecycle transition without extra request data
project: server
layer: service
source: target/server/src/activity/activity.service.ts:L536
---

# Service Lifecycle Transition

## When to use

Use for service methods that perform a simple lifecycle transition without extra request data

## Reference implementation

```typescript
import { Permissions } from '@acme/schemas/permission';

/**
 * @Blueprint service-lifecycle-transition
 * @BlueprintName Service Lifecycle Transition
 * @BlueprintUsage Use for service methods that perform a simple lifecycle transition without extra request data
 * @BlueprintDescription Requires permission, loads the entity, asserts the target transition, persists the new status, then emits audit and wide-event context
 */
async returnToCreation(id: string): Promise<void> {
  this.logger.assign({ activityId: id, action: 'activity.return-to-creation' });
  this.permissionService.require(Permissions.ACTIVITY_UPDATE);

  const activity = await this.findOneWithDetailOrThrow(id);
  this.assertTransition(activity.status, 'created');

  await this.repository.updateStatusWithoutAdditionalData(id, 'created');

  const returned = await this.findOneWithDetailOrThrow(id);

  this.auditLogService.emit({
    processCode: 'AC',
    action: 'ACTIVITY_RETURN_TO_CREATION',
    recordKey: id,
    areaId: activity.areaId,
    subareaId: activity.subareaId,
    oldValue: activity,
    newValue: returned,
  });
}
```
