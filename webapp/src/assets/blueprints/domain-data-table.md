---
id: domain-data-table
name: Domain Data Table
description: "Composes DataTable + useDataTable with columns, actionMenu, skeleton, and toolbar"
usage: "Use for domain entity tables composing DataTable molecule with columns, action menu, skeleton, and toolbar"
project: webapp
layer: organism
source: target/webapp/src/ui/components/organisms/brand/BrandsTable.tsx:L22
---

# Domain Data Table

## When to use

Use for domain entity tables composing DataTable molecule with columns, action menu, skeleton, and toolbar

## Reference implementation

```tsx
import type { Brand } from '@acme/schemas/brand';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/atoms/button/Button';
import { DataTable } from '@/ui/components/molecules/data-table/DataTable';
import { DataTableSkeleton } from '@/ui/components/molecules/data-table/DataTableSkeleton';
import { DataTableToolbar } from '@/ui/components/molecules/data-table/DataTableToolbar';
import { useDataTable } from '@/ui/components/molecules/data-table/hooks/use-data-table';
import { getBrandColumns } from './BrandsTable.columns';

/**
 * @Blueprint domain-data-table
 * @BlueprintName Domain Data Table
 * @BlueprintUsage Use for domain entity tables composing DataTable molecule with columns, action menu, skeleton, and toolbar
 * @BlueprintDescription Composes DataTable + useDataTable with columns, actionMenu, skeleton, and toolbar
 */
export function BrandsTable({
  brands,
  pageCount,
  onViewBrand,
  onEditBrand,
  onCreateBrand,
  isLoading = false,
}: BrandsTableProps) {
  const columns = useMemo(() => getBrandColumns(), []);

  const { table } = useDataTable({
    data: brands,
    columns,
    pageCount,
    enableMultiSort: false,
  });

  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={columns.length}
        rowCount={10}
        filterCount={1}
        withPagination
        withViewOptions
      />
    );
  }

  const actionMenu = [
    ...(onViewBrand
      ? [{ label: m.common_view(), icon: Eye, onClick: (row: Brand) => onViewBrand(row.id) }]
      : []),
    ...(onEditBrand
      ? [{ label: m.common_edit(), icon: Pencil, onClick: (row: Brand) => onEditBrand(row.id) }]
      : []),
  ];

  return (
    <DataTable table={table} actionMenu={actionMenu}>
      <DataTableToolbar table={table}>
        {onCreateBrand !== undefined && (
          <Button onClick={onCreateBrand} size='sm'>
            <Plus />
            {m.common_create()}
          </Button>
        )}
      </DataTableToolbar>
    </DataTable>
  );
}
```
