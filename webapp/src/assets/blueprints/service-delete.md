---
id: service-delete
name: Service Delete
description: "Checks admin permission, deletes via repository, logs to audit"
usage: Use for delete with admin permission check and audit log
project: server
layer: service
source: target/server/src/area/area.service.ts:L165
---

# Service Delete

## When to use

Use for delete with admin permission check and audit log

## Reference implementation

```typescript
import { AreaNotFound, DuplicateAreaName } from './area.error';

/**
 * @Blueprint service-delete
 * @BlueprintName Service Delete
 * @BlueprintUsage Use for delete with admin permission check and audit log
 * @BlueprintDescription Checks admin permission, deletes via repository, logs to audit
 */
async delete(id: string): Promise<void> {
  this.logger.assign({ areaId: id, action: 'area.delete' });
  this.permissionService.requireAdmin();

  const existing = await this.repository.findOne(id);
  if (!existing) {
    throw AreaNotFound(id);
  }

  await this.repository.delete(id);

  this.auditLogService.emit({
    processCode: 'C',
    action: 'AREA_DELETE',
    recordKey: id,
    areaId: id,
    oldValue: existing,
    newValue: null,
  });
}
```
