---
id: route-view
name: View Route
description: "createFileRoute with beforeLoad getTitle, ensureQueryData loader for GET /:id, component with useSuspenseQuery and handleBack callback"
usage: "Use for entity view routes with loader prefetching GET /:id and back navigation"
project: webapp
layer: route
source: target/webapp/src/app/routes/company/$companyId/catalogs/areas/view/$id.tsx:L8
---

# View Route

## When to use

Use for entity view routes with loader prefetching GET /:id and back navigation

## Reference implementation

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { apiClient } from '@/core/clients/api.client';
import { m } from '@/core/paraglide/messages';

/**
 * @Blueprint route-view
 * @BlueprintName View Route
 * @BlueprintUsage Use for entity view routes with loader prefetching GET /:id and back navigation
 * @BlueprintDescription createFileRoute with beforeLoad getTitle, ensureQueryData loader for GET /:id, component with useSuspenseQuery and handleBack callback
 */
export const Route = createFileRoute('/company/$companyId/catalogs/areas/view/$id')({
  beforeLoad: () => ({
    getTitle: () => m.area_view_title(),
  }),
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      apiClient.queryOptions('get', '/areas/{id}', { params: { path: { id: params.id } } })
    ),
  component: AreaViewRoute,
});
```
