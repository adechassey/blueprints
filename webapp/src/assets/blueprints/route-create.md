---
id: route-create
name: Create Route
description: "createFileRoute with beforeLoad getTitle, minimal component extracting companyId and rendering CreatePage"
usage: Use for entity create routes with beforeLoad i18n title and companyId param extraction
project: webapp
layer: route
source: target/webapp/src/app/routes/company/$companyId/catalogs/areas/new.tsx:L6
---

# Create Route

## When to use

Use for entity create routes with beforeLoad i18n title and companyId param extraction

## Reference implementation

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { m } from '@/core/paraglide/messages';

/**
 * @Blueprint route-create
 * @BlueprintName Create Route
 * @BlueprintUsage Use for entity create routes with beforeLoad i18n title and companyId param extraction
 * @BlueprintDescription createFileRoute with beforeLoad getTitle, minimal component extracting companyId and rendering CreatePage
 */
export const Route = createFileRoute('/company/$companyId/catalogs/areas/new')({
  beforeLoad: () => ({
    getTitle: () => m.area_create_title(),
  }),
  component: AreaCreateRoute,
});
```
