---
id: form-validation
name: Form Validation
description: "formOptions with onSubmit Zod validator, compound Root/Content/Actions via Context, FormMode support (create/edit/view), form.Field + FormItem composition"
usage: Use for entity forms with Zod schema validation via TanStack Form compound component pattern
project: webapp
layer: organism
source: target/webapp/src/ui/components/organisms/area/AreaForm.tsx:L30
---

# Form Validation

## When to use

Use for entity forms with Zod schema validation via TanStack Form compound component pattern

## Reference implementation

```tsx
import { type CreateArea, CreateAreaSchema } from '@acme/schemas/area';
import { formOptions } from '@tanstack/react-form';

/**
 * @Blueprint form-validation
 * @BlueprintName Form Validation
 * @BlueprintUsage Use for entity forms with Zod schema validation via TanStack Form compound component pattern
 * @BlueprintDescription formOptions with onSubmit Zod validator, compound Root/Content/Actions via Context, FormMode support (create/edit/view), form.Field + FormItem composition
 */
const defaultAreaFormOptions = formOptions({
  defaultValues: areaFormDefaults,
  validators: {
    onSubmit: CreateAreaSchema,
  },
});
```
