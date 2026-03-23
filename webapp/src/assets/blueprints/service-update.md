---
id: service-update
name: Service Update
description: "Checks permission, verifies existence, validates uniqueness, updates, logs to audit"
usage: "Use for update with existence check, duplicate validation, and audit log"
project: server
layer: service
source: target/server/src/area/area.service.ts:L131
---

# Service Update

## When to use

Use for update with existence check, duplicate validation, and audit log

## Reference implementation

```typescript
import type {
  Area,
  AreaLookup,
  AreaStatus,
  CreateArea,
  PaginatedAreas,
  QueryAllAreas,
  QueryAreas,
  UpdateArea,
} from '@acme/schemas/area';
import { Permissions } from '@acme/schemas/permission';
import { AreaNotFound, DuplicateAreaName } from './area.error';

/**
 * @Blueprint service-update
 * @BlueprintName Service Update
 * @BlueprintUsage Use for update with existence check, duplicate validation, and audit log
 * @BlueprintDescription Checks permission, verifies existence, validates uniqueness, updates, logs to audit
 */
async update(id: string, input: UpdateArea): Promise<void> {
  this.logger.assign({ areaId: id, action: 'area.update' });
  this.permissionService.require(Permissions.AREA_UPDATE);

  const existing = await this.repository.findOne(id);
  if (!existing) {
    throw AreaNotFound(id);
  }

  if (input.name) {
    const duplicate = await this.repository.findOneByName(input.name, id);
    if (duplicate) {
      throw DuplicateAreaName(input.name);
    }
  }

  const updated = await this.repository.update(id, input);

  this.auditLogService.emit({
    processCode: 'C',
    action: 'AREA_EDIT',
    recordKey: id,
    areaId: id,
    oldValue: existing,
    newValue: updated,
  });
}
```
