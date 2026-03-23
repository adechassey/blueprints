---
id: service-excel-export
name: Service Excel Export
description: "Permission check, repository query, header-to-accessor mapping, ExcelWriterService.writeSpreadsheet call"
usage: Use for exporting domain data as a downloadable XLSX file via ExcelWriterService
project: server
layer: service
source: target/server/src/budget-version/budget-version.service.ts:L241
---

# Service Excel Export

## When to use

Use for exporting domain data as a downloadable XLSX file via ExcelWriterService

## Reference implementation

```typescript
import { Permissions } from '@acme/schemas/permission';
import {
  BudgetImportValidationFailed,
  BudgetVersionNotCancellable,
  BudgetVersionNotEditable,
  BudgetVersionNotFound,
  BudgetVersionNotFoundByStatus,
  InvalidFileType,
  InvalidSheetStructure,
} from './budget-version.error';
import { buildExportRows } from './budget-version-export.core';
import {
  EXPECTED_HEADERS,
  hasImportErrors,
  hasSheetError,
  validateSheetAndRows,
} from './budget-version-import.core';

/**
 * @Blueprint service-excel-export
 * @BlueprintName Service Excel Export
 * @BlueprintUsage Use for exporting domain data as a downloadable XLSX file via ExcelWriterService
 * @BlueprintDescription Permission check, repository query, header-to-accessor mapping, ExcelWriterService.writeSpreadsheet call
 */
async export(id: string, isDiscretionary: boolean): Promise<Buffer> {
  this.logger.assign({ budgetVersionId: id, action: 'budget-version.export' });
  this.permissionService.require(Permissions.BUDGET_VERSION_IMPORT);

  const version = await this.repository.findOne(id);
  if (!version) {
    throw BudgetVersionNotFound(id);
  }

  const items = await this.budgetItemRepository.findForExport(id, isDiscretionary);

  const rows = buildExportRows(items);
  const sheetName = isDiscretionary ? 'Discretionary' : 'Budget';
  const buffer = await this.excelWriter.writeSpreadsheet(sheetName, EXPECTED_HEADERS, rows);

  this.logger.assign({ exportedItemCount: items.length, isDiscretionary });

  return buffer;
}
```
