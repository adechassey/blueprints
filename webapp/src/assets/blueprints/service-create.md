---
id: service-create
name: Service Create
description: "Checks permission, validates uniqueness, creates via repository, logs to audit"
usage: "Use for create with permission check, duplicate validation, and audit log"
project: server
layer: service
source: target/server/src/area/area.service.ts:L88
---

# Service Create

## When to use

Use for create with permission check, duplicate validation, and audit log

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
import { UserContext } from '../common/context/user.context';
import { AreaNotFound, DuplicateAreaName } from './area.error';

/**
 * @Blueprint service-create
 * @BlueprintName Service Create
 * @BlueprintUsage Use for create with permission check, duplicate validation, and audit log
 * @BlueprintDescription Checks permission, validates uniqueness, creates via repository, logs to audit
 */
async create(input: CreateArea): Promise<Area> {
  this.permissionService.require(Permissions.AREA_UPDATE);

  const existing = await this.repository.findOneByName(input.name);
  if (existing) {
    throw DuplicateAreaName(input.name);
  }

  const companyId = this.userContext.getCompany().id;
  const result = await this.repository.create({ ...input, companyId });

  /**
   * @Blueprint wide-event-logging
   * @BlueprintName Wide Event Logging
   * @BlueprintUsage Use for adding business context to the request-scoped canonical log line via logger.assign
   * @BlueprintDescription logger.assign with entityId and action from LogAction type, fields accumulate in wide event
   */
  this.logger.assign({ areaId: result.id, action: 'area.create' });

  /**
   * @Blueprint audit-log-emit
   * @BlueprintName Audit Log Emit
   * @BlueprintUsage Use after entity mutations (create/update/delete) to emit an audit log entry
   * @BlueprintDescription Calls auditLogService.emit() with processCode, action, recordKey, oldValue and newValue. userId and companyId are auto-injected from UserContext. For global entities (no companyId), use emitAdmin() instead.
   */
  this.auditLogService.emit({
    processCode: 'C',
    action: 'AREA_CREATE',
    recordKey: result.id,
    areaId: result.id,
    oldValue: null,
    newValue: result,
  });

  return result;
}
```
