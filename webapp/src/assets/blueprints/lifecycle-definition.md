---
id: lifecycle-definition
name: Lifecycle Definition
description: Calls defineLifecycle with a transitions map and traits object for a domain status enum
usage: Use when defining a domain lifecycle with transitions and traits via defineLifecycle
project: shared
layer: core
source: target/schemas/src/activity-status.core.ts:L7
---

# Lifecycle Definition

## When to use

Use when defining a domain lifecycle with transitions and traits via defineLifecycle

## Reference implementation

```typescript
import type { ActivityStatus } from './activity.schema.js';
import { defineLifecycle } from './common/lifecycle.core.js';

/**
 * @Blueprint lifecycle-definition
 * @BlueprintName Lifecycle Definition
 * @BlueprintUsage Use when defining a domain lifecycle with transitions and traits via defineLifecycle
 * @BlueprintDescription Calls defineLifecycle with a transitions map and traits object for a domain status enum
 */
export const activityLifecycle = defineLifecycle<ActivityStatus>({
  transitions: {
    created: ['pending_authorization', 'authorized', 'canceled'],
    pending_authorization: ['authorized', 'rejected'],
    authorized: ['pending_authorization', 'closed'],
    rejected: ['created'],
    closed: [],
    canceled: [],
  },
  traits: {
    editable: ['created', 'authorized'],
    terminal: ['closed', 'canceled'],
    locked: ['pending_authorization'],
  },
});
```
