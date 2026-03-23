---
id: tanstack-query
name: TanStack Query
description: "apiClient.useSuspenseQuery with HTTP method, path, and body for cached server data"
usage: Use for type-safe data fetching with apiClient.useSuspenseQuery in route components
project: webapp
layer: route
source: target/webapp/src/app/routes/company/$companyId/catalogs/brands/index.tsx:L33
---

# TanStack Query

## When to use

Use for type-safe data fetching with apiClient.useSuspenseQuery in route components

## Reference implementation

```tsx
import { apiClient } from '@/core/clients/api.client';

/**
 * @Blueprint tanstack-query
 * @BlueprintName TanStack Query
 * @BlueprintUsage Use for type-safe data fetching with apiClient.useSuspenseQuery in route components
 * @BlueprintDescription apiClient.useSuspenseQuery with HTTP method, path, and body for cached server data
 */
const { data: brands } = apiClient.useSuspenseQuery('post', '/brands/search', {
  body: {
    filters: search.filters ?? null,
    sort: search.sort ?? null,
    page: search.page,
    limit: search.perPage,
  },
});
```
