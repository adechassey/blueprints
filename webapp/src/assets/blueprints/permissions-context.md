---
id: permissions-context
name: Permissions Context
description: "useMatch to get auth context, returns can(), canAtLeastOne(), canAll(), isAdmin"
usage: Use for permission checks in components via useMatch context and can/canAtLeastOne helpers
project: webapp
layer: hook
source: target/webapp/src/core/permissions/use-permissions.ts:L13
---

# Permissions Context

## When to use

Use for permission checks in components via useMatch context and can/canAtLeastOne helpers

## Reference implementation

```typescript
import { useMatch } from '@tanstack/react-router';

/**
 * @Blueprint permissions-context
 * @BlueprintName Permissions Context
 * @BlueprintUsage Use for permission checks in components via useMatch context and can/canAtLeastOne helpers
 * @BlueprintDescription useMatch to get auth context, returns can(), canAtLeastOne(), canAll(), isAdmin
 */
export function usePermissions(): UsePermissionsResult {
  const route = useMatch({ from: '/company/$companyId' });
  const { auth } = route.context;

  return {
    permissions: auth.permissions,
    can: auth.hasPermission,
    canAtLeastOne: auth.hasAtLeastOnePermission,
    canAll: auth.hasAllPermissions,
    isAdmin: auth.sessionUser?.role === 'admin',
  };
}
```
