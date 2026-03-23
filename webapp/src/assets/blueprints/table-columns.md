---
id: table-columns
name: DataTable Column Definitions
description: "getColumns() returning helper-based accessor columns with schema-derived filter/sort capabilities, typed getValue() cells, and optional filterOnly hidden columns"
usage: "Use for defining table columns with createColumnHelper, createColumnCapabilities, DataTableColumnHeader, and i18n meta"
project: webapp
layer: organism
source: target/webapp/src/ui/components/organisms/area/AreasTable.columns.tsx:L16
---

# DataTable Column Definitions

## When to use

Use for defining table columns with createColumnHelper, createColumnCapabilities, DataTableColumnHeader, and i18n meta

## Reference implementation

```tsx
import { m } from '@/core/paraglide/messages';
import { DataTableColumnHeader } from '@/ui/components/molecules/data-table/DataTableColumnHeader';
import {
  getCatalogStatusConfig,
  StatusBadge,
} from '@/ui/components/molecules/status-badge/StatusBadge';

/**
 * @Blueprint table-columns
 * @BlueprintName DataTable Column Definitions
 * @BlueprintUsage Use for defining table columns with createColumnHelper, createColumnCapabilities, DataTableColumnHeader, and i18n meta
 * @BlueprintDescription getColumns() returning helper-based accessor columns with schema-derived filter/sort capabilities, typed getValue() cells, and optional filterOnly hidden columns
 */
export function getAreaColumns() {
  return [
    columnHelper.accessor('name', {
      id: 'name',
      ...capabilities.for('name'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={m.areas_table_name()} />
      ),
      cell: ({ getValue }) => getValue(),
      meta: {
        label: m.areas_table_name(),
        variant: 'text',
        placeholder: m.areas_filter_name_placeholder(),
      },
    }),
    columnHelper.accessor('status', {
      id: 'status',
      ...capabilities.for('status'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={m.areas_table_status()} />
      ),
      cell: ({ getValue }) => (
        <StatusBadge
          status={getValue()}
          config={getCatalogStatusConfig({
            active: m.area_status_active(),
            inactive: m.area_status_inactive(),
          })}
        />
      ),
      meta: {
        label: m.areas_table_status(),
        variant: 'select',
        options: [
          { value: 'active', label: m.area_status_active() },
          { value: 'inactive', label: m.area_status_inactive() },
        ],
      },
    }),
  ];
}
```
