---
id: create-page
name: Create Page
description: "Page composing Form.Root/Content/Actions with useMutation POST, ConfirmationDialog for submit, toast feedback, and query invalidation"
usage: "Use for entity create pages with Form compound component, mutation, ConfirmationDialog, and toast"
project: webapp
layer: page
source: target/webapp/src/ui/components/pages/areas/AreaCreatePage.tsx:L19
---

# Create Page

## When to use

Use for entity create pages with Form compound component, mutation, ConfirmationDialog, and toast

## Reference implementation

```tsx
import type { CreateArea } from '@acme/schemas/area';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/core/clients/api.client';
import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/atoms/button/Button';
import { ConfirmationDialog } from '@/ui/components/molecules/confirmation-dialog/ConfirmationDialog';
import { AreaForm } from '@/ui/components/organisms/area/AreaForm';

/**
 * @Blueprint create-page
 * @BlueprintName Create Page
 * @BlueprintUsage Use for entity create pages with Form compound component, mutation, ConfirmationDialog, and toast
 * @BlueprintDescription Page composing Form.Root/Content/Actions with useMutation POST, ConfirmationDialog for submit, toast feedback, and query invalidation
 */
export function AreaCreatePage({ companyId, onBack }: AreaCreatePageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<CreateArea | null>(null);

  const { mutate: createArea, isPending } = apiClient.useMutation('post', '/areas', {
    onSuccess: (_data, variables) => {
      toast.success(m.area_create_success({ name: variables.body.name }));
      queryClient.invalidateQueries({
        queryKey: apiClient.queryOptions('post', '/areas/search', { body: {} }).queryKey,
      });
      navigate({ to: '/company/$companyId/catalogs/areas', params: { companyId } });
    },
    onError: (error) => {
      toast.error(error.message);
      setShowConfirmDialog(false);
    },
  });

  const handleCancel = () => {
    navigate({ to: '/company/$companyId/catalogs/areas', params: { companyId } });
  };

  const handleSubmit = async (data: CreateArea) => {
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmCreate = () => {
    if (!pendingData) {
      return;
    }

    createArea({ body: pendingData });
  };

  return (
    <div className='min-h-full bg-gray-50 p-6'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-6 flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={onBack}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <AreaForm.TitleCreate />
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <AreaForm.Root onSubmit={handleSubmit} disabled={isPending}>
            <AreaForm.Content />
            <AreaForm.Actions
              onCancel={handleCancel}
              submitLabel={m.area_create_button()}
              submittingLabel={m.common_creating()}
            />
          </AreaForm.Root>
        </div>
      </div>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={m.area_create_confirm_title()}
        description={m.area_create_confirm_description()}
        confirmLabel={m.common_create()}
        onConfirm={handleConfirmCreate}
        isLoading={isPending}
      />
    </div>
  );
}
```
