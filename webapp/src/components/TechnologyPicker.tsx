import type { TechnologyCategory } from '@blueprints/shared';
import { useTechnologies } from '../hooks/useTags.js';
import { normalizeReferences, technologyName } from '../lib/technologies.core.js';
import * as m from '../paraglide/messages.js';
import { Combobox } from './Combobox.js';

const CATEGORY_LABEL: Record<TechnologyCategory, () => string> = {
	language: m.technology_category_language,
	framework: m.technology_category_framework,
	library: m.technology_category_library,
	database: m.technology_category_database,
	infra: m.technology_category_infra,
	tooling: m.technology_category_tooling,
};

const GROUPS = Object.entries(CATEGORY_LABEL).map(([key, label]) => ({ key, label: label() }));

interface TechnologyPickerProps {
	/** Technology references: catalog slugs, or names of technologies to create. */
	value: string[];
	onValueChange: (value: string[]) => void;
	/** Allow typing a technology that is not in the catalog (the API creates it). */
	creatable?: boolean;
	placeholder: string;
	id?: string;
	className?: string;
	'aria-label'?: string;
}

/** Multi-select over the technology catalog, grouped by category with usage counts. */
export function TechnologyPicker({ value, ...props }: TechnologyPickerProps) {
	const { data: technologies = [] } = useTechnologies();

	return (
		<Combobox
			{...props}
			multiple
			options={technologies.map((t) => ({
				value: t.slug,
				label: t.name,
				group: t.category,
				count: t.count,
			}))}
			groups={GROUPS}
			value={normalizeReferences(value, technologies)}
			labelOf={(ref) => technologyName(ref, technologies)}
			searchPlaceholder={m.picker_search_technologies()}
		/>
	);
}
