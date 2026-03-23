---
id: service-update-nested
name: Service Update with Nested Validation
description: Extends the flat service-update pattern with child array validation via a pure core function before delegating transactional persistence to the repository. Validates children only when provided (partial update semantics).
usage: Use for update methods where the entity has child sub-entities requiring validation before persistence
project: server
layer: service
source: target/server/src/activity-template/activity-template.service.ts:L131
---

# Service Update with Nested Validation

## When to use

Use for update methods where the entity has child sub-entities requiring validation before persistence

## Reference implementation

```typescript
import type {
  ActivityTemplateDetail,
  ActivityTemplateLookup,
  CreateActivityTemplate,
  PaginatedActivityTemplates,
  QueryActivityTemplates,
  QueryAllActivityTemplates,
  TemplateField,
  UpdateActivityTemplate,
} from '@acme/schemas/activity-template';
import { Permissions } from '@acme/schemas/permission';
import { validateFields } from './activity-template.core';
import {
  ActivityTemplateNotFound,
  DuplicateActivityTemplateName,
  InvalidTemplateFields,
} from './activity-template.error';

/**
 * @Blueprint service-update-nested
 * @BlueprintName Service Update with Nested Validation
 * @BlueprintUsage Use for update methods where the entity has child sub-entities requiring validation before persistence
 * @BlueprintDescription Extends the flat service-update pattern with child array validation via a pure core function before delegating transactional persistence to the repository. Validates children only when provided (partial update semantics).
 */
async update(id: string, input: UpdateActivityTemplate): Promise<void> {
  this.logger.assign({ activityTemplateId: id, action: 'activity-template.update' });
  this.permissionService.require(Permissions.ACTIVITY_TEMPLATE_UPDATE);

  const existing = await this.repository.findOneWithFields(id);
  if (!existing) {
    throw ActivityTemplateNotFound(id);
  }

  if (input.name) {
    const duplicate = await this.repository.findOneByName(input.name, id);
    if (duplicate) {
      throw DuplicateActivityTemplateName(input.name);
    }
  }

  if (input.fields && input.fields.length > 0) {
    const validation = validateFields(input.fields);
    if (!validation.valid) {
      throw InvalidTemplateFields(validation.reason);
    }
  }

  const updated = await this.repository.update(id, input);

  this.auditLogService.emit({
    processCode: 'C',
    action: 'ACTIVITY_TEMPLATE_EDIT',
    recordKey: id,
    oldValue: existing,
    newValue: updated,
  });
}
```
