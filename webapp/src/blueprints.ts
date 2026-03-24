export type Blueprint = {
	id: string;
	name: string;
	description: string;
	usage: string;
	source: string;
	stack: string;
	layer: string;
	content: string;
};

const modules = import.meta.glob('./assets/blueprints/*.md', {
	eager: true,
	query: '?raw',
	import: 'default',
}) as Record<string, string>;

function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { meta: {}, content: raw };

	const meta: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx === -1) continue;
		const key = line.slice(0, idx).trim();
		const value = line
			.slice(idx + 1)
			.trim()
			.replace(/^["']|["']$/g, '');
		meta[key] = value;
	}
	return { meta, content: match[2].trim() };
}

export const blueprints: Blueprint[] = Object.values(modules)
	.map((raw) => {
		const { meta, content } = parseFrontmatter(raw);
		return {
			id: meta.id ?? '',
			name: meta.name ?? '',
			description: meta.description ?? '',
			usage: meta.usage ?? '',
			source: meta.source ?? '',
			stack: meta.project ?? 'server',
			layer: meta.layer ?? 'unknown',
			content,
		};
	})
	.sort((a, b) => a.id.localeCompare(b.id));

export const layers = [...new Set(blueprints.map((b) => b.layer))].sort();
