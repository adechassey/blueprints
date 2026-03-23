---
id: hook-lifecycle-actions
name: Lifecycle Actions Hook
description: "React hook that owns lifecycle mutations, pending action state, cancel-reason state, structured failure modal state, and post-success query invalidation for reuse across list and detail pages"
usage: "Use for shared entity lifecycle hooks that centralize mutation calls, confirmation-dialog state, and structured error modal state"
project: webapp
layer: hook
source: target/webapp/src/core/activity/use-activity-lifecycle.ts:L19
---

# Lifecycle Actions Hook

## When to use

Use for shared entity lifecycle hooks that centralize mutation calls, confirmation-dialog state, and structured error modal state

## Reference implementation

```typescript
import type { ActivityInsufficientBudgetLineWire as ActivityInsufficientBudgetLine } from '@acme/schemas/activity';
import { useState } from 'react';
import { toast } from 'sonner';
import { isInsufficientBudgetError } from '@/core/activity/activity.type';
import { apiClient } from '@/core/clients/api.client';
import { m } from '@/core/paraglide/messages';

/**
 * @Blueprint hook-lifecycle-actions
 * @BlueprintName Lifecycle Actions Hook
 * @BlueprintUsage Use for shared entity lifecycle hooks that centralize mutation calls, confirmation-dialog state, and structured error modal state
 * @BlueprintDescription React hook that owns lifecycle mutations, pending action state, cancel-reason state, structured failure modal state, and post-success query invalidation for reuse across list and detail pages
 */
export function useActivityLifecycle({ invalidateQueries }: UseActivityLifecycleOptions) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [insufficientBudgetLines, setInsufficientBudgetLines] = useState<
    ActivityInsufficientBudgetLine[] | null
  >(null);

  const dismissDialog = () => {
    setPendingAction(null);
    setCancelReason('');
  };

  const sendToApprovalMutation = apiClient.useMutation(
    'patch',
    '/activities/{id}/send-to-approval',
    {
      onSuccess: () => {
        toast.success(m.activity_send_to_approval_success());
        invalidateQueries();
      },
      onError: (error) => {
        if (isInsufficientBudgetError(error)) {
          setInsufficientBudgetLines(error.insufficientLines);
        } else {
          toast.error(error.message);
        }
      },
    }
  );

  const closeMutation = apiClient.useMutation('patch', '/activities/{id}/close', {
    onSuccess: () => {
      toast.success(m.activity_close_success());
      dismissDialog();
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message);
      dismissDialog();
    },
  });

  const cancelMutation = apiClient.useMutation('patch', '/activities/{id}/cancel', {
    onSuccess: () => {
      toast.success(m.activity_cancel_success());
      dismissDialog();
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message);
      dismissDialog();
    },
  });

  const returnToCreationMutation = apiClient.useMutation(
    'patch',
    '/activities/{id}/return-to-creation',
    {
      onSuccess: () => {
        toast.success(m.activity_return_to_creation_success());
        dismissDialog();
        invalidateQueries();
      },
      onError: (error) => {
        toast.error(error.message);
        dismissDialog();
      },
    }
  );

  const confirmAction = () => {
    if (!pendingAction) {
      return;
    }

    switch (pendingAction.type) {
      case 'close':
        closeMutation.mutate({ params: { path: { id: pendingAction.activityId } } });
        break;
      case 'cancel':
        if (cancelReason.trim().length === 0) {
          toast.error(m.activity_cancel_reason_required());
          return;
        }
        cancelMutation.mutate({
          params: { path: { id: pendingAction.activityId } },
          body: { reason: cancelReason },
        });
        break;
      case 'return_to_creation':
        returnToCreationMutation.mutate({ params: { path: { id: pendingAction.activityId } } });
        break;
    }
  };

  const actions = {
    onSendToApproval: (id: string) => {
      sendToApprovalMutation.mutate({ params: { path: { id } } });
    },
    onClose: (id: string) => {
      setPendingAction({ type: 'close', activityId: id });
    },
    onCancel: (id: string) => {
      setPendingAction({ type: 'cancel', activityId: id });
      setCancelReason('');
    },
    onReturnToCreation: (id: string) => {
      setPendingAction({ type: 'return_to_creation', activityId: id });
    },
  };

  const dialogState = {
    pendingAction,
    cancelReason,
    setCancelReason,
    insufficientBudgetLines,
    setInsufficientBudgetLines,
    dismissDialog,
    confirmAction,
    isLoading:
      closeMutation.isPending || cancelMutation.isPending || returnToCreationMutation.isPending,
  };

  return { actions, dialogState };
}
```
