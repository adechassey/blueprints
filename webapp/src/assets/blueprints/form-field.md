---
id: form-field
name: Form Field
description: "Composes Label + Input with aria-invalid, aria-describedby, error/help/info text slots"
usage: Use for form fields composing Label + Input with error/help text and ARIA attributes
project: webapp
layer: molecule
source: target/webapp/src/ui/components/molecules/form-field/FormField.tsx:L60
---

# Form Field

## When to use

Use for form fields composing Label + Input with error/help text and ARIA attributes

## Reference implementation

```tsx
import { cn } from '@/core/shared/utils/cn';
import { isNotNullNorUndefined } from '@/core/shared/utils/type-guards';
import { Input } from '@/ui/components/atoms/input/Input';
import { Label } from '@/ui/components/atoms/label/Label';

/**
 * @Blueprint form-field
 * @BlueprintName Form Field
 * @BlueprintUsage Use for form fields composing Label + Input with error/help text and ARIA attributes
 * @BlueprintDescription Composes Label + Input with aria-invalid, aria-describedby, error/help/info text slots
 */
export function FormField({
  id,
  label,
  required = false,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  maxLength,
  disabled = false,
  readOnly = false,
  className,
  helpText,
  onBlur,
  infoText,
}: FormFieldProps) {
  const hasError = isNotNullNorUndefined(error);
  const hasInfoText = isNotNullNorUndefined(infoText);
  const hasHelpText = isNotNullNorUndefined(helpText);

  const getAriaDescribedBy = (): string | undefined => {
    if (hasError) {
      return `${id}-error`;
    }
    if (hasInfoText) {
      return `${id}-info`;
    }
    if (hasHelpText) {
      return `${id}-help`;
    }
    return undefined;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className='text-destructive ml-1'>*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={hasError}
        aria-describedby={getAriaDescribedBy()}
      />
      {hasHelpText && !hasError && !hasInfoText && (
        <p id={`${id}-help`} className='text-muted-foreground text-xs'>
          {helpText}
        </p>
      )}
      {hasInfoText && !hasError && (
        <p id={`${id}-info`} className='text-muted-foreground text-xs'>
          {infoText}
        </p>
      )}
      {hasError && (
        <p id={`${id}-error`} className='text-destructive text-xs' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}
```
