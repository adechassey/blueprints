---
id: service-lifecycle-transition-with-reason
name: Service Lifecycle Transition With Reason
description: "Requires permission, loads the entity, asserts the target transition, persists status plus reason via repository, then emits audit and wide-event context including the reason"
usage: Use for service methods that perform a lifecycle transition and persist a required reason payload such as cancellation
project: server
layer: service
source: target/server/src/activity/activity.service.ts:L506
---

# Service Lifecycle Transition With Reason

## When to use

Use for service methods that perform a lifecycle transition and persist a required reason payload such as cancellation

## Reference implementation

```typescript
import { Permissions } from '@acme/schemas/permission';

/**
 * @Blueprint service-lifecycle-transition-with-reason
 * @BlueprintName Service Lifecycle Transition With Reason
 * @BlueprintUsage Use for service methods that perform a lifecycle transition and persist a required reason payload such as cancellation
 * @BlueprintDescription Requires permission, loads the entity, asserts the target transition, persists status plus reason via repository, then emits audit and wide-event context including the reason
 */
async cancel(id: string, reason: string): Promise<void> {
  this.logger.assign({ activityId: id, action: 'activity.cancel' });
  this.permissionService.require(Permissions.ACTIVITY_UPDATE);

  const activity = await this.findOneWithDetailOrThrow(id);
  this.assertTransition(activity.status, 'canceled');

  await this.repository.cancel(id, reason);

  const canceled = await this.findOneWithDetailOrThrow(id);

  this.auditLogService.emit({
    processCode: 'AC',
    action: 'ACTIVITY_CANCEL',
    recordKey: id,
    areaId: activity.areaId,
    subareaId: activity.subareaId,
    oldValue: activity,
    newValue: canceled,
  });
}
```
