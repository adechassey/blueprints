---
id: molecule
name: Molecule
description: "Composes Dialog + Button atoms with typed props interface and m.common_*() i18n"
usage: Use for components composing 2-3 atoms with typed props and i18n labels
project: webapp
layer: molecule
source: target/webapp/src/ui/components/molecules/confirmation-dialog/ConfirmationDialog.tsx:L27
---

# Molecule

## When to use

Use for components composing 2-3 atoms with typed props and i18n labels

## Reference implementation

```tsx
import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/atoms/button/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/atoms/dialog/Dialog';

/**
 * @Blueprint molecule
 * @BlueprintName Molecule
 * @BlueprintUsage Use for components composing 2-3 atoms with typed props and i18n labels
 * @BlueprintDescription Composes Dialog + Button atoms with typed props interface and m.common_*() i18n
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'default',
  onConfirm,
  isLoading = false,
  children,
  contentClassName,
}: ConfirmationDialogProps) {
  const resolvedConfirmLabel = confirmLabel ?? m.common_confirm();
  const resolvedCancelLabel = cancelLabel ?? m.common_cancel();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={isLoading ? () => {} : onOpenChange}>
      <DialogContent
        {...(contentClassName && { className: contentClassName })}
        closeDisabled={isLoading}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant='secondary' onClick={() => onOpenChange(false)} disabled={isLoading}>
            {resolvedCancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? m.common_processing() : resolvedConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```
