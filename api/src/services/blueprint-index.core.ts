/**
 * Pure blueprint index generation.
 * No I/O — 100% test coverage required.
 */

export interface IndexBlueprint {
	slug: string;
	name: string;
	stack: string;
	layer: string;
	description: string | null;
	usage: string | null;
}

const STACK_ORDER = ['server', 'webapp', 'shared', 'fullstack'] as const;

export function generateBlueprintIndex(projectName: string, blueprints: IndexBlueprint[]): string {
	const lines: string[] = [];
	lines.push(`# Blueprint Index — ${projectName}`);
	lines.push('');

	if (blueprints.length === 0) {
		lines.push('No blueprints in this project.');
		return lines.join('\n');
	}

	// Group by stack
	const byStack = new Map<string, IndexBlueprint[]>();
	for (const bp of blueprints) {
		const group = byStack.get(bp.stack) ?? [];
		group.push(bp);
		byStack.set(bp.stack, group);
	}

	// Sort stacks in canonical order
	const stackIndex = (s: string) => {
		const idx = STACK_ORDER.indexOf(s as (typeof STACK_ORDER)[number]);
		return idx === -1 ? 99 : idx;
	};
	const orderedStacks = [...byStack.keys()].sort((a, b) => stackIndex(a) - stackIndex(b));

	for (const stack of orderedStacks) {
		// biome-ignore lint/style/noNonNullAssertion: iterating keys guarantees existence
		const group = byStack.get(stack)!;

		// Sort by layer then name
		group.sort((a, b) => a.layer.localeCompare(b.layer) || a.name.localeCompare(b.name));

		lines.push(`## ${capitalize(stack)}`);
		lines.push('');
		lines.push('| Slug | Layer | Name | Usage | Description |');
		lines.push('|------|-------|------|-------|-------------|');

		for (const bp of group) {
			const usage = escapeCell(bp.usage ?? '');
			const desc = escapeCell(bp.description ?? '');
			lines.push(`| ${bp.slug} | ${bp.layer} | ${bp.name} | ${usage} | ${desc} |`);
		}

		lines.push('');
	}

	return lines.join('\n');
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeCell(s: string): string {
	return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
