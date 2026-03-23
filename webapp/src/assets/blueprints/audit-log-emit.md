---
id: audit-log-emit
name: Audit Log Emit
description: "Calls auditLogService.emit() with processCode, action, recordKey, oldValue and newValue. userId and companyId are auto-injected from UserContext. For global entities (no companyId), use emitAdmin() instead."
usage: Use after entity mutations (create/update/delete) to emit an audit log entry
project: server
layer: service
source: target/server/src/area/area.service.ts:L113
---

# Audit Log Emit

## When to use

Use after entity mutations (create/update/delete) to emit an audit log entry

## Reference implementation

```typescript
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
```
