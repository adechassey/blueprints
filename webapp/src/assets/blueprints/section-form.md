---
id: section-form
name: Section Form Root
description: "Defines SectionDef[] with id, lockedBy, computeKey, onReset per section, initializes useSectionManager, and provides sections via compound component context"
usage: "Use for multi-step accordion forms with section locking, change-detection, and child-reset"
project: webapp
layer: organism
source: target/webapp/src/ui/components/organisms/budget-version-movement/BudgetVersionMovementForm.tsx:L34
---

# Section Form Root

## When to use

Use for multi-step accordion forms with section locking, change-detection, and child-reset

## Reference implementation

```tsx
import type { CreateBudgetVersionMovementWire as CreateBudgetVersionMovement } from '@acme/schemas/budget-version-movement';
import type { NonEmptyArray } from '@acme/schemas/common/utility';
import { ZERO } from '@acme/schemas/decimal-core';
import { useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { type FormEvent, type ReactNode, useCallback, useMemo, useState } from 'react';
import type { BrandMovementRow } from '@/core/budget-version-movement/budget-version-movement.type';
import { useCompanySettings } from '@/core/company/use-company-settings';
import { useAppForm } from '@/core/shared/hooks/use-app-form';
import { type SectionDef, useSectionManager } from '@/core/shared/hooks/use-section';
import {
  defaultMovementFormOptions,
  FORM_SECTIONS,
  MovementFormContext,
  useMovementFormContext,
} from './BudgetVersionMovementForm.context';

/**
 * @Blueprint section-form
 * @BlueprintName Section Form Root
 * @BlueprintUsage Use for multi-step accordion forms with section locking, change-detection, and child-reset
 * @BlueprintDescription Defines SectionDef[] with id, lockedBy, computeKey, onReset per section, initializes useSectionManager, and provides sections via compound component context
 */
function MovementFormRoot({
  onSubmit,
  disabled = false,
  budgetVersionLookups,
  children,
}: MovementFormRootProps) {
  const queryClient = useQueryClient();
  const { currentFiscalYear } = useCompanySettings();

  const initialBudgetVersionId = useMemo(() => {
    const uniqueYears = [...new Set(budgetVersionLookups.map((version) => version.fiscalYear))];
    const hasCurrentYear = uniqueYears.includes(currentFiscalYear);
    const sortedYears = uniqueYears.sort((yearA, yearB) => yearB - yearA);
    const defaultFiscalYear = hasCurrentYear
      ? currentFiscalYear
      : (sortedYears[0] ?? currentFiscalYear);
    const defaultVersion = budgetVersionLookups.find(
      (version) => version.fiscalYear === defaultFiscalYear
    );
    return defaultVersion?.id ?? '';
  }, [budgetVersionLookups, currentFiscalYear]);

  const form = useAppForm({
    ...defaultMovementFormOptions,
    defaultValues: {
      ...defaultMovementFormOptions.defaultValues,
      budgetVersionId: initialBudgetVersionId,
    },
    onSubmit: async ({ value }) => {
      const payload: CreateBudgetVersionMovement = {
        ...value,
        comments: value.comments?.trim() || null,
      };
      await onSubmit?.(payload);
    },
  });

  const [areaId, setAreaId] = useState<string | null>(null);
  const [fetchedBrands, setFetchedBrands] = useState<BrandMovementRow[]>([]);
  const [committedTotalMovement, setCommittedTotalMovement] = useState(ZERO);

  const budgetVersionId = useStore(form.store, (state) => state.values.budgetVersionId);
  const fiscalYear = useMemo(
    () =>
      budgetVersionLookups.find((version) => version.id === budgetVersionId)?.fiscalYear ??
      currentFiscalYear,
    [budgetVersionLookups, budgetVersionId, currentFiscalYear]
  );

  const sectionDefs = useMemo<NonEmptyArray<SectionDef>>(
    () => [
      {
        id: FORM_SECTIONS.BUDGET_VERSION,
        computeKey: () => form.state.values.budgetVersionId,
      },
      {
        id: FORM_SECTIONS.DIMENSIONS,
        lockedBy: FORM_SECTIONS.BUDGET_VERSION,
        computeKey: () => {
          const values = form.state.values;
          return `${values.subareaId}|${values.segmentId}|${values.macroProjectId}|${values.isDiscretionary}`;
        },
        onReset: () => {
          setAreaId(null);
          form.setFieldValue('subareaId', '');
          form.setFieldValue('segmentId', '');
          form.setFieldValue('macroProjectId', '');
          form.setFieldValue('isDiscretionary', false);
          queryClient.invalidateQueries({ queryKey: ['get', '/areas/all'] });
          queryClient.invalidateQueries({ queryKey: ['get', '/subareas/all'] });
          queryClient.invalidateQueries({
            queryKey: ['get', '/budget-version-movements/segments'],
          });
          queryClient.invalidateQueries({ queryKey: ['get', '/macro-projects/all'] });
        },
      },
      {
        id: FORM_SECTIONS.MOVEMENTS,
        lockedBy: FORM_SECTIONS.DIMENSIONS,
        computeKey: () => JSON.stringify(form.state.values.itemMovements),
        onReset: () => {
          setFetchedBrands([]);
          setCommittedTotalMovement(ZERO);
          form.setFieldValue('itemMovements', []);
        },
      },
      {
        id: FORM_SECTIONS.REVIEW,
        lockedBy: FORM_SECTIONS.MOVEMENTS,
        computeKey: () => '',
      },
    ],
    [form, queryClient]
  );

  const sections = useSectionManager(sectionDefs);

  const handleFormSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      event.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  const formContextValue = useMemo(
    () => ({
      form,
      fiscalYear,
      budgetVersionLookups,
      disabled,
      sections,
      areaId,
      setAreaId,
      committedTotalMovement,
      setCommittedTotalMovement,
      fetchedBrands,
      setFetchedBrands,
    }),
    [
      form,
      fiscalYear,
      budgetVersionLookups,
      disabled,
      sections,
      areaId,
      committedTotalMovement,
      fetchedBrands,
    ]
  );

  return (
    <form onSubmit={handleFormSubmit}>
      <MovementFormContext.Provider value={formContextValue}>
        {children}
      </MovementFormContext.Provider>
    </form>
  );
}
```
