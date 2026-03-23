---
id: edit-page
name: Edit Page
description: "Page composing Form.Root/Content/Actions with initialValues, useMutation PUT /:id, ConfirmationDialog, toast, and invalidation of detail + search queries"
usage: "Use for entity edit pages with Form compound component, PUT mutation, ConfirmationDialog, and dual query invalidation"
project: webapp
layer: page
source: target/webapp/src/ui/components/pages/areas/AreaEditPage.tsx:L21
---

# Edit Page

## When to use

Use for entity edit pages with Form compound component, PUT mutation, ConfirmationDialog, and dual query invalidation

## Reference implementation

```tsx
import type { Area, CreateArea } from '@acme/schemas/area';
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
 * @Blueprint edit-page
 * @BlueprintName Edit Page
 * @BlueprintUsage Use for entity edit pages with Form compound component, PUT mutation, ConfirmationDialog, and dual query invalidation
 * @BlueprintDescription Page composing Form.Root/Content/Actions with initialValues, useMutation PUT /:id, ConfirmationDialog, toast, and invalidation of detail + search queries
 */
export function AreaEditPage({ area, companyId, id, onBack }: AreaEditPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingData, setPendingData] = useState<CreateArea | null>(null);

  const { mutate: updateArea, isPending: isUpdating } = apiClient.useMutation(
    'put',
    '/areas/{id}',
    {
      onSuccess: (_data, variables) => {
        toast.success(m.area_edit_success({ name: variables.body?.name ?? '' }));
        queryClient.invalidateQueries({
          queryKey: apiClient.queryOptions('get', '/areas/{id}', { params: { path: { id } } })
            .queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: apiClient.queryOptions('post', '/areas/search', { body: {} }).queryKey,
        });
        navigate({ to: '/company/$companyId/catalogs/areas', params: { companyId } });
      },
      onError: (error) => {
        toast.error(error.message);
        setShowSaveDialog(false);
      },
    }
  );

  const isDisabled = isUpdating;

  const handleCancel = () => {
    navigate({ to: '/company/$companyId/catalogs/areas', params: { companyId } });
  };

  const handleSubmit = async (data: CreateArea) => {
    setPendingData(data);
    setShowSaveDialog(true);
  };

  const handleConfirmUpdate = () => {
    if (!pendingData) {
      return;
    }

    updateArea({ params: { path: { id } }, body: pendingData });
  };

  const initialValues: Partial<CreateArea> = {
    name: area.name,
    status: area.status,
  };

  return (
    <div className='min-h-full bg-gray-50 p-6'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-6 flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={onBack}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <AreaForm.TitleEdit areaName={area.name ?? ''} />
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <AreaForm.Root
            onSubmit={handleSubmit}
            initialValues={initialValues}
            mode='edit'
            disabled={isDisabled}
          >
            <AreaForm.Content />
            <AreaForm.Actions onCancel={handleCancel} />
          </AreaForm.Root>
        </div>
      </div>

      <ConfirmationDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        title={m.area_edit_confirm_title()}
        description={m.area_edit_confirm_description()}
        confirmLabel={m.common_save()}
        onConfirm={handleConfirmUpdate}
        isLoading={isUpdating}
      />
    </div>
  );
}
```
