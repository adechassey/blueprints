---
id: service-bypass-permissions
name: Cross-Domain Bypass Permissions
description: BypassPermissions method performing no permission validation; caller (ActivityService.findTemplateFields) checks ACTIVITY_UPDATE before invoking
usage: Use for cross-domain service methods where the caller is responsible for permission checks
project: server
layer: service
source: target/server/src/activity-template/activity-template.service.ts:L82
---

# Cross-Domain Bypass Permissions

## When to use

Use for cross-domain service methods where the caller is responsible for permission checks

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
import {
  ActivityTemplateNotFound,
  DuplicateActivityTemplateName,
  InvalidTemplateFields,
} from './activity-template.error';

/**
 * @Blueprint service-bypass-permissions
 * @BlueprintName Cross-Domain Bypass Permissions
 * @BlueprintUsage Use for cross-domain service methods where the caller is responsible for permission checks
 * @BlueprintDescription BypassPermissions method performing no permission validation; caller (ActivityService.findTemplateFields) checks ACTIVITY_UPDATE before invoking
 */
async findActiveFieldsBypassPermissions(templateId: string): Promise<TemplateField[]> {
  const template = await this.repository.findOne(templateId);
  if (!template) {
    throw ActivityTemplateNotFound(templateId);
  }

  return this.repository.findActiveFieldsByTemplateId(templateId);
}
```
