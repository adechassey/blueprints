---
id: service-admin-lifecycle-transition
name: Service Admin Lifecycle Transition
description: "Requires admin permission, loads the entity, asserts the target transition, delegates status persistence or cleanup to the repository, then emits audit and wide-event context"
usage: Use for admin-only service methods that move an entity through a lifecycle transition with repository-managed side effects
project: server
layer: service
source: target/server/src/activity/activity.service.ts:L403
---

# Service Admin Lifecycle Transition

## When to use

Use for admin-only service methods that move an entity through a lifecycle transition with repository-managed side effects

## Reference implementation

```typescript
import {
  ActivityNotEditableInStatus,
  ActivityNotFound,
  ActivityStatusMustBeCreatedToSendToApproval,
  AttachmentUrlNotFound,
  AuthorizedFieldsNotEditable,
  BrandInactive,
  BudgetIncreaseMustBeGreater,
  BudgetVersionNotFoundForActivity,
  DateOutsideFiscalYear,
  DuplicateBrandAllocation,
  GlobalCodeGenerationFailed,
  InsufficientBudget,
  InvalidCustomFields,
  InvalidDateRange,
  InvalidStatusTransition,
  SegmentInactive,
  SegmentInvalidLevel,
} from './activity.error';

/**
 * @Blueprint service-admin-lifecycle-transition
 * @BlueprintName Service Admin Lifecycle Transition
 * @BlueprintUsage Use for admin-only service methods that move an entity through a lifecycle transition with repository-managed side effects
 * @BlueprintDescription Requires admin permission, loads the entity, asserts the target transition, delegates status persistence or cleanup to the repository, then emits audit and wide-event context
 */
async authorize(id: string): Promise<void> {
  this.logger.assign({ activityId: id, action: 'activity.authorize' });
  this.permissionService.requireAdmin();

  const activity = await this.findOneWithDetailOrThrow(id);
  if (activity.status !== 'pending_authorization') {
    throw InvalidStatusTransition(activity.status, 'authorized');
  }

  await this.repository.updateStatusAndCleanupBeforeAuthorized(id, 'authorized');

  const updated = await this.findOneWithDetailOrThrow(id);

  this.auditLogService.emit({
    processCode: 'AC',
    action: 'ACTIVITY_AUTHORIZE',
    recordKey: id,
    areaId: activity.areaId,
    subareaId: activity.subareaId,
    oldValue: activity,
    newValue: updated,
  });
}
```
