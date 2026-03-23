---
id: section-form-section
name: Section Form Section
description: "Calls useSection with section id and manager, spreads section.props into AccordionFormSection, uses hasChanged/resetChildren/advance for set and edit for editing"
usage: Use for individual sections within a section-based accordion form
project: webapp
layer: organism
source: target/webapp/src/ui/components/organisms/budget-version-movement/BudgetVersionSection.tsx:L20
---

# Section Form Section

## When to use

Use for individual sections within a section-based accordion form

## Reference implementation

```tsx
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { validateBudgetVersionSection } from '@/core/budget-version-movement/budget-version-movement.util';
import { m } from '@/core/paraglide/messages';
import { useSection } from '@/core/shared/hooks/use-section';
import { Input } from '@/ui/components/atoms/input/Input';
import { Label } from '@/ui/components/atoms/label/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/atoms/select/Select';
import { AccordionFormSection } from '@/ui/components/molecules/accordion-form-section/AccordionFormSection';
import { FORM_SECTIONS, useMovementFormContext } from './BudgetVersionMovementForm.context';

/**
 * @Blueprint section-form-section
 * @BlueprintName Section Form Section
 * @BlueprintUsage Use for individual sections within a section-based accordion form
 * @BlueprintDescription Calls useSection with section id and manager, spreads section.props into AccordionFormSection, uses hasChanged/resetChildren/advance for set and edit for editing
 */
export function BudgetVersionSection() {
  const { form, fiscalYear, disabled, budgetVersionLookups, sections } = useMovementFormContext();
  const section = useSection(FORM_SECTIONS.BUDGET_VERSION, sections);

  const fiscalYears = useMemo(() => {
    const uniqueYears = [...new Set(budgetVersionLookups.map((version) => version.fiscalYear))];
    return uniqueYears.sort((yearA, yearB) => yearB - yearA);
  }, [budgetVersionLookups]);

  const selectedVersion = useMemo(
    () => budgetVersionLookups.find((version) => version.fiscalYear === fiscalYear) ?? null,
    [budgetVersionLookups, fiscalYear]
  );

  const summary = selectedVersion
    ? `FY ${String(fiscalYear)} - ${selectedVersion.name}`
    : undefined;

  const handleFiscalYearChange = (value: string | null) => {
    if (!value) {
      return;
    }
    const year = Number(value);
    const version = budgetVersionLookups.find((lookup) => lookup.fiscalYear === year);
    form.setFieldValue('budgetVersionId', version?.id ?? '');
  };

  const handleSet = useCallback(() => {
    if (!validateBudgetVersionSection(form.state.values.budgetVersionId)) {
      toast.error(m.budget_movement_form_version_not_found());
      return;
    }
    if (section.hasChanged()) {
      section.resetChildren();
    }
    section.advance();
  }, [form, section]);

  return (
    <AccordionFormSection
      {...section.props}
      title={m.budget_movement_section_budget_version()}
      summary={summary}
      onSet={handleSet}
      onEdit={section.edit}
      editLabel={m.budget_movement_form_edit()}
      setLabel={m.budget_movement_form_set()}
    >
      <div className='flex gap-4'>
        <div className='space-y-1.5'>
          <Label>{m.budget_movement_form_fiscal_year()}</Label>
          <Select
            value={String(fiscalYear)}
            onValueChange={handleFiscalYearChange}
            disabled={disabled || fiscalYears.length === 0}
          >
            <SelectTrigger className='w-48'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fiscalYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {String(year)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-1.5'>
          <Label>{m.budget_movement_form_version()}</Label>
          <Input value={selectedVersion?.name ?? ''} readOnly disabled className='w-64' />
        </div>
      </div>
    </AccordionFormSection>
  );
}
```
