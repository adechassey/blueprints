---
id: view-page
name: View Page
description: "Page composing Form.Root in mode='view' with initialValues, back button, and no submit actions"
usage: Use for read-only entity view pages with Form compound component in view mode
project: webapp
layer: page
source: target/webapp/src/ui/components/pages/areas/AreaViewPage.tsx:L12
---

# View Page

## When to use

Use for read-only entity view pages with Form compound component in view mode

## Reference implementation

```tsx
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/ui/components/atoms/button/Button';
import { AreaForm } from '@/ui/components/organisms/area/AreaForm';

/**
 * @Blueprint view-page
 * @BlueprintName View Page
 * @BlueprintUsage Use for read-only entity view pages with Form compound component in view mode
 * @BlueprintDescription Page composing Form.Root in mode='view' with initialValues, back button, and no submit actions
 */
export function AreaViewPage({ area, onBack }: AreaViewPageProps) {
  const initialValues = {
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
          <AreaForm.TitleView areaName={area.name ?? ''} />
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <AreaForm.Root initialValues={initialValues} mode='view'>
            <AreaForm.Content />
          </AreaForm.Root>
        </div>
      </div>
    </div>
  );
}
```
