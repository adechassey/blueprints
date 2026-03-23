---
id: route-edit
name: Edit Route
description: "createFileRoute with beforeLoad getTitle, ensureQueryData loader for GET /:id, component with useSuspenseQuery passing entity to EditPage"
usage: "Use for entity edit routes with loader prefetching GET /:id and useSuspenseQuery"
project: webapp
layer: route
source: target/webapp/src/app/routes/company/$companyId/catalogs/areas/edit/$id.tsx:L8
---

# Edit Route

## When to use

Use for entity edit routes with loader prefetching GET /:id and useSuspenseQuery

## Reference implementation

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { apiClient } from '@/core/clients/api.client';
import { m } from '@/core/paraglide/messages';

/**
 * @Blueprint route-edit
 * @BlueprintName Edit Route
 * @BlueprintUsage Use for entity edit routes with loader prefetching GET /:id and useSuspenseQuery
 * @BlueprintDescription createFileRoute with beforeLoad getTitle, ensureQueryData loader for GET /:id, component with useSuspenseQuery passing entity to EditPage
 */
export const Route = createFileRoute('/company/$companyId/catalogs/areas/edit/$id')({
  beforeLoad: () => ({
    getTitle: () => m.area_edit_title(),
  }),
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      apiClient.queryOptions('get', '/areas/{id}', { params: { path: { id: params.id } } })
    ),
  component: AreaEditRoute,
});
```
