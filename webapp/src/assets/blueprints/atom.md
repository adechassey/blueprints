---
id: atom
name: Atom
description: "Function component with CVA buttonVariants, Base UI primitive render, cn() merging"
usage: "Use for base UI primitives with CVA variants, Base UI, and Tailwind styling"
project: webapp
layer: atom
source: target/webapp/src/ui/components/atoms/button/Button.tsx:L50
---

# Atom

## When to use

Use for base UI primitives with CVA variants, Base UI, and Tailwind styling

## Reference implementation

```tsx
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cn } from '@/core/shared/utils/cn';

/**
 * @Blueprint atom
 * @BlueprintName Atom
 * @BlueprintUsage Use for base UI primitives with CVA variants, Base UI, and Tailwind styling
 * @BlueprintDescription Function component with CVA buttonVariants, Base UI primitive render, cn() merging
 */
export function Button({
  ref,
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      ref={ref}
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```
