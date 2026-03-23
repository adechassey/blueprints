---
id: selection-ui-usage
name: Selection UI Usage
description: "Composes Label + TreeMultiselect with form field wiring, shared selection UI defaults, and view/edit mode behavior"
usage: Use for organism sections that bind reusable selection molecules directly to form state with localized labels and mode-based disabling
project: webapp
layer: organism
source: target/webapp/src/ui/components/organisms/activity/ActivityFormTargetAudience.tsx:L7
---

# Selection UI Usage

## When to use

Use for organism sections that bind reusable selection molecules directly to form state with localized labels and mode-based disabling

## Reference implementation

```tsx
import { m } from '@/core/paraglide/messages';
import { Label } from '@/ui/components/atoms/label/Label';
import { TreeMultiselect } from '@/ui/components/molecules/tree-multiselect/TreeMultiselect';
import { useActivityFormContext } from './ActivityForm.context';

/**
 * @Blueprint selection-ui-usage
 * @BlueprintName Selection UI Usage
 * @BlueprintUsage Use for organism sections that bind reusable selection molecules directly to form state with localized labels and mode-based disabling
 * @BlueprintDescription Composes Label + TreeMultiselect with form field wiring, shared selection UI defaults, and view/edit mode behavior
 */
export function ActivityFormTargetAudience() {
  const { form, mode, disabled, geographies, channels } = useActivityFormContext();
  const isViewMode = mode === 'view';
  const isDisabled = isViewMode || disabled;

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <div className='space-y-2'>
        <Label>{m.activity_target_audience_geography_title()}</Label>
        <form.Field name='geographyIds'>
          {(field) => (
            <TreeMultiselect
              items={geographies}
              value={field.state.value ?? []}
              onChange={(ids) => field.handleChange(ids)}
              disabled={isDisabled}
              viewMode={isViewMode}
              searchPlaceholder={m.geography_tree_search_placeholder()}
              emptyMessage={m.geography_tree_no_items()}
              noResultsMessage={m.geography_tree_no_results()}
            />
          )}
        </form.Field>
      </div>

      <div className='space-y-2'>
        <Label>{m.activity_target_audience_channel_title()}</Label>
        <form.Field name='channelIds'>
          {(field) => (
            <TreeMultiselect
              items={channels}
              value={field.state.value ?? []}
              onChange={(ids) => field.handleChange(ids)}
              disabled={isDisabled}
              viewMode={isViewMode}
              searchPlaceholder={m.channel_tree_search_placeholder()}
              emptyMessage={m.channel_tree_no_items()}
              noResultsMessage={m.channel_tree_no_results()}
            />
          )}
        </form.Field>
      </div>
    </div>
  );
}
```
