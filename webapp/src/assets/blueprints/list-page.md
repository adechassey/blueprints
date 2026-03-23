---
id: list-page
name: List Page
description: "Page receiving PaginatedEntities + companyId, checks permissions via usePermissions, defines handleView/Edit/Create navigation callbacks, conditionally spreads edit/create props on table, renders header with icon + i18n title and Card-wrapped EntityTable"
usage: "Use for entity list pages with paginated table, permission-gated CRUD navigation, and page header with icon"
project: webapp
layer: page
source: target/webapp/src/ui/components/pages/areas/AreasPage.tsx:L15
---

# List Page

## When to use

Use for entity list pages with paginated table, permission-gated CRUD navigation, and page header with icon

## Reference implementation

```tsx
import { useNavigate } from '@tanstack/react-router';
import { MapPin } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { usePermissions } from '@/core/permissions/use-permissions';
import { Card } from '@/ui/components/atoms/card/Card';
import { AreasTable } from '@/ui/components/organisms/area/AreasTable';

/**
 * @Blueprint list-page
 * @BlueprintName List Page
 * @BlueprintUsage Use for entity list pages with paginated table, permission-gated CRUD navigation, and page header with icon
 * @BlueprintDescription Page receiving PaginatedEntities + companyId, checks permissions via usePermissions, defines handleView/Edit/Create navigation callbacks, conditionally spreads edit/create props on table, renders header with icon + i18n title and Card-wrapped EntityTable
 */
export const AreasPage = ({ areas, companyId }: AreasPageProps) => {
  const { can } = usePermissions();
  const canUpdate = can('area:update');
  const navigate = useNavigate();

  const handleViewArea = (id: string) => {
    navigate({
      to: '/company/$companyId/catalogs/areas/view/$id',
      params: { companyId, id },
    });
  };

  const handleEditArea = (id: string) => {
    navigate({
      to: '/company/$companyId/catalogs/areas/edit/$id',
      params: { companyId, id },
    });
  };

  const handleCreateArea = () => {
    navigate({ to: '/company/$companyId/catalogs/areas/new', params: { companyId } });
  };

  return (
    <div className='min-h-full space-y-4 bg-gray-50 p-6'>
      <div className='mb-6 rounded-lg bg-white p-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-teal-500'>
            <MapPin className='h-6 w-6 text-white' />
          </div>
          <span className='text-lg font-medium text-gray-900'>{m.areas_title()}</span>
        </div>
      </div>

      <Card className='p-4'>
        <AreasTable
          areas={areas.data}
          pageCount={areas.meta.totalPages}
          onViewArea={handleViewArea}
          {...(canUpdate && { onEditArea: handleEditArea })}
          {...(canUpdate && { onCreateArea: handleCreateArea })}
        />
      </Card>
    </div>
  );
};
```
