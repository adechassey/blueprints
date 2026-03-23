---
id: file-input
name: File Input
description: "Composes Label + Input + Button with FileReader preview, drag-drop zone, aria-describedby"
usage: "Use for file upload fields with preview, drag-and-drop, and ARIA accessibility"
project: webapp
layer: molecule
source: target/webapp/src/ui/components/molecules/file-upload-field/FileUploadField.tsx:L66
---

# File Input

## When to use

Use for file upload fields with preview, drag-and-drop, and ARIA accessibility

## Reference implementation

```tsx
import { FileIcon, Upload, X } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { cn } from '@/core/shared/utils/cn';
import { isNotNullNorUndefined } from '@/core/shared/utils/type-guards';
import { Button } from '@/ui/components/atoms/button/Button';
import { Input } from '@/ui/components/atoms/input/Input';
import { Label } from '@/ui/components/atoms/label/Label';

/**
 * @Blueprint file-input
 * @BlueprintName File Input
 * @BlueprintUsage Use for file upload fields with preview, drag-and-drop, and ARIA accessibility
 * @BlueprintDescription Composes Label + Input + Button with FileReader preview, drag-drop zone, aria-describedby
 */
export function FileUploadField({
  id,
  label,
  required = false,
  error,
  accept = 'image/png,image/jpeg,image/svg+xml',
  onChange,
  existingUrl,
  disabled = false,
  className,
  helpText,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileState, setFileState] = useState<FileState | null>(
    existingUrl ? { name: '', isImage: true, previewUrl: existingUrl } : null
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(file);
      const isImage = file.type.startsWith('image/');

      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFileState({
            name: file.name,
            isImage: true,
            previewUrl: reader.result as string,
          });
        };
        reader.readAsDataURL(file);
      } else {
        setFileState({
          name: file.name,
          isImage: false,
          previewUrl: null,
        });
      }
    }
  };

  const handleClear = () => {
    onChange(null);
    setFileState(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Determine aria-describedby value
  const getAriaDescribedBy = (): string | undefined => {
    if (isNotNullNorUndefined(error)) {
      return `${id}-error`;
    }
    if (isNotNullNorUndefined(helpText)) {
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

      {isNotNullNorUndefined(fileState) &&
        fileState.isImage &&
        isNotNullNorUndefined(fileState.previewUrl) && (
          <div className='relative inline-block'>
            <img
              src={fileState.previewUrl}
              alt='Preview'
              className='h-24 w-24 rounded-md border object-cover'
            />
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute -top-2 -right-2 h-6 w-6 rounded-full'
              onClick={handleClear}
              disabled={disabled}
              aria-label='Remove file'
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        )}
      {isNotNullNorUndefined(fileState) &&
        !(fileState.isImage && isNotNullNorUndefined(fileState.previewUrl)) && (
          <div className='border-input flex items-center gap-3 rounded-md border p-3'>
            <FileIcon className='text-muted-foreground h-8 w-8 shrink-0' />
            <span className='flex-1 truncate text-sm'>{fileState.name}</span>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              onClick={handleClear}
              disabled={disabled}
              aria-label='Remove file'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        )}
      {!isNotNullNorUndefined(fileState) && (
        <button
          type='button'
          className={cn(
            'border-input flex w-full items-center justify-center rounded-md border border-dashed p-6',
            'hover:border-primary hover:bg-muted/50 cursor-pointer transition-colors',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          aria-label='Upload file area'
        >
          <div className='text-center'>
            <Upload className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
            <p className='text-muted-foreground text-sm'>{m.file_upload_click_to_upload()}</p>
          </div>
        </button>
      )}

      <Input
        ref={inputRef}
        id={id}
        type='file'
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className='sr-only'
        aria-invalid={isNotNullNorUndefined(error)}
        aria-describedby={getAriaDescribedBy()}
      />

      {isNotNullNorUndefined(helpText) && !isNotNullNorUndefined(error) && (
        <p id={`${id}-help`} className='text-muted-foreground text-xs'>
          {helpText}
        </p>
      )}
      {isNotNullNorUndefined(error) && (
        <p id={`${id}-error`} className='text-destructive text-xs' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}
```
