---
id: data-table
name: Data Table
description: "Generic DataTable<TData> wrapping TanStack Table with ActionMenuCell and DataTablePagination"
usage: Use for generic data tables wrapping TanStack Table with action menu and pagination
project: webapp
layer: molecule
source: target/webapp/src/ui/components/molecules/data-table/DataTable.tsx:L85
---

# Data Table

## When to use

Use for generic data tables wrapping TanStack Table with action menu and pagination

## Reference implementation

```tsx
import { flexRender, type Row, type Table as TanstackTable } from '@tanstack/react-table';
import { m } from '@/core/paraglide/messages';
import { cn } from '@/core/shared/utils/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/atoms/table/Table';
import { DataTablePagination } from './DataTablePagination';
import { getCommonPinningStyles } from './lib/data-table';

/**
 * @Blueprint data-table
 * @BlueprintName Data Table
 * @BlueprintUsage Use for generic data tables wrapping TanStack Table with action menu and pagination
 * @BlueprintDescription Generic DataTable<TData> wrapping TanStack Table with ActionMenuCell and DataTablePagination
 */
export function DataTable<TData>({
  table,
  actionBar,
  actionMenu,
  actionButton,
  hasActionColumn: hasActionColumnProp,
  tableMaxHeight,
  renderRows,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  const hasActionMenu = actionMenu && actionMenu.length > 0;
  const hasActionColumn = hasActionMenu || actionButton || hasActionColumnProp;
  const totalColumns = table.getAllColumns().length + (hasActionColumn ? 1 : 0);

  const renderTableRows = () => {
    if (renderRows) {
      return renderRows(table.getRowModel().rows);
    }

    return table.getRowModel().rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            className={cell.column.columnDef.meta?.cellClassName}
            borderLeft={cell.column.columnDef.meta?.borderLeft}
            style={{
              ...getCommonPinningStyles({ column: cell.column, withBorder: true }),
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
        {hasActionColumn && (
          <TableCell
            className='w-12 text-right'
            style={{
              opacity: 1,
              position: 'relative',
              background: 'var(--background)',
            }}
          >
            {hasActionMenu && <ActionMenuCell row={row} items={actionMenu} />}
            {!hasActionMenu && actionButton && <ActionButtonCell row={row} item={actionButton} />}
          </TableCell>
        )}
      </TableRow>
    ));
  };

  return (
    <div className={cn('flex w-full flex-col gap-2.5 overflow-auto', className)} {...props}>
      {children}
      <div
        className={cn(
          'rounded-md border',
          tableMaxHeight ? `${tableMaxHeight} overflow-y-auto` : 'overflow-hidden'
        )}
      >
        <Table>
          <TableHeader className={tableMaxHeight ? 'bg-background sticky top-0 z-10' : undefined}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    borderLeft={header.column.columnDef.meta?.borderLeft}
                    style={{
                      ...getCommonPinningStyles({ column: header.column, withBorder: true }),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                {hasActionColumn && (
                  <TableHead
                    className='w-12'
                    style={{ opacity: 1, position: 'relative', background: 'var(--background)' }}
                  />
                )}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              renderTableRows()
            ) : (
              <TableRow>
                <TableCell colSpan={totalColumns} className='h-24 text-center'>
                  {m.data_table_no_results()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex flex-col gap-2.5'>
        <DataTablePagination table={table} />
        {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && actionBar}
      </div>
    </div>
  );
}
```
