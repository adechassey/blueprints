---
id: service-submit-for-approval
name: Service Submit For Approval
description: "Requires update permission, loads the entity, validates the target transition and pre-submit rules, delegates to ApprovalExecutionService.submit, then emits audit and wide-event context"
usage: Use for service methods that submit an entity into the approval workflow after transition and business validation checks
project: server
layer: service
source: target/server/src/activity/activity.service.ts:L348
---

# Service Submit For Approval

## When to use

Use for service methods that submit an entity into the approval workflow after transition and business validation checks

## Reference implementation

```typescript
import { Permissions } from '@acme/schemas/permission';
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
 * @Blueprint service-submit-for-approval
 * @BlueprintName Service Submit For Approval
 * @BlueprintUsage Use for service methods that submit an entity into the approval workflow after transition and business validation checks
 * @BlueprintDescription Requires update permission, loads the entity, validates the target transition and pre-submit rules, delegates to ApprovalExecutionService.submit, then emits audit and wide-event context
 */
async sendToApproval(id: string): Promise<void> {
  this.logger.assign({ activityId: id, action: 'activity.send-to-approval' });
  this.permissionService.require(Permissions.ACTIVITY_UPDATE);

  const activity = await this.findOneWithDetailOrThrow(id);
  this.assertTransition(activity.status, 'pending_authorization');
  if (activity.status !== 'created') {
    throw ActivityStatusMustBeCreatedToSendToApproval();
  }

  const validatedBudgetData = await this.assertBudgetAvailability(activity);

  const companyId = this.userContext.getCompany().id;
  const userId = this.userContext.getUser().id;

  const { outcome } = await this.approvalExecutionService.submit({
    processType: 'ACTIVITY',
    entityId: id,
    companyId,
    requestedById: userId,
    itemAmount: activity.totalInvestment,
    subareaId: activity.subareaId,
    budgetSnapshotData: validatedBudgetData,
    entityApprovedStatus: 'authorized',
    entityRunningStatus: 'pending_authorization',
  });

  this.logger.assign({
    approvalOutcome: outcome,
    validatedBudgetVersionId: validatedBudgetData.validatedBudgetVersionId,
    validatedBudgetName: validatedBudgetData.validatedBudgetName,
    validatedBudgetScenario: validatedBudgetData.validatedBudgetScenario,
  });

  const updated = await this.findOneWithDetailOrThrow(id);

  this.auditLogService.emit({
    processCode: 'AC',
    action: 'ACTIVITY_SEND_TO_APPROVAL',
    recordKey: id,
    areaId: activity.areaId,
    subareaId: activity.subareaId,
    oldValue: activity,
    newValue: updated,
  });
}
```
