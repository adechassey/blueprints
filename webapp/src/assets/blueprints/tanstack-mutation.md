---
id: tanstack-mutation
name: TanStack Mutation
description: "apiClient.useMutation with onSuccess (toast, invalidate, navigate) and onError (toast)"
usage: "Use for mutations with apiClient.useMutation, toast feedback, and query invalidation"
project: webapp
layer: page
source: target/webapp/src/ui/components/pages/brands/BrandCreatePage.tsx:L25
---

# TanStack Mutation

## When to use

Use for mutations with apiClient.useMutation, toast feedback, and query invalidation

## Reference implementation

```tsx
import { toast } from 'sonner';
import { apiClient } from '@/core/clients/api.client';
import { m } from '@/core/paraglide/messages';

/**
 * @Blueprint tanstack-mutation
 * @BlueprintName TanStack Mutation
 * @BlueprintUsage Use for mutations with apiClient.useMutation, toast feedback, and query invalidation
 * @BlueprintDescription apiClient.useMutation with onSuccess (toast, invalidate, navigate) and onError (toast)
 */
const { mutate: createBrand, isPending } = apiClient.useMutation('post', '/brands', {
  onSuccess: (_data, variables) => {
    toast.success(m.brand_create_success({ name: variables.body.name }));
    queryClient.invalidateQueries({
      queryKey: apiClient.queryOptions('post', '/brands/search', { body: {} }).queryKey,
    });
    navigate({ to: '/company/$companyId/catalogs/brands', params: { companyId } });
  },
  onError: (error) => {
    toast.error(error.message);
    setShowConfirmDialog(false);
  },
});
```
