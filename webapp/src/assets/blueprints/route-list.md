---
id: route-list
name: List Route
description: "createFileRoute with PaginatedSearchSchema validation, loader prefetching POST /search, and route component with useSuspenseQuery"
usage: "Use for paginated list routes with validateSearch, loaderDeps, ensureQueryData, and useSuspenseQuery"
project: webapp
layer: route
source: target/webapp/src/app/routes/company/$companyId/catalogs/areas/index.tsx:L8
---

# List Route

## When to use

Use for paginated list routes with validateSearch, loaderDeps, ensureQueryData, and useSuspenseQuery

## Reference implementation

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { apiClient } from '@/core/clients/api.client';
import { PaginatedSearchSchema } from '@/core/shared/schemas/filter.schema';

/**
 * @Blueprint route-list
 * @BlueprintName List Route
 * @BlueprintUsage Use for paginated list routes with validateSearch, loaderDeps, ensureQueryData, and useSuspenseQuery
 * @BlueprintDescription createFileRoute with PaginatedSearchSchema validation, loader prefetching POST /search, and route component with useSuspenseQuery
 */
export const Route = createFileRoute('/company/$companyId/catalogs/areas/')({
  beforeLoad: () => ({
    getTitle: () => null,
  }),
  validateSearch: PaginatedSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      apiClient.queryOptions('post', '/areas/search', {
        body: {
          filters: deps.search.filters ?? null,
          sort: deps.search.sort ?? null,
          page: deps.search.page,
          limit: deps.search.perPage,
        },
      })
    ),
  component: AreasRoute,
});
```
