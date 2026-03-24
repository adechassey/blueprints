/**
 * Pure frontmatter parsing for CLI.
 * No I/O — 100% test coverage required.
 */

export interface FrontmatterMeta {
	name?: string;
	description?: string;
	usage?: string;
	stack?: string;
	layer?: string;
	tags?: string[];
}

export function parseFrontmatter(raw: string): { meta: FrontmatterMeta; content: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { meta: {}, content: raw.trim() };

	const yamlBlock = match[1] as string;
	const bodyBlock = match[2] as string;

	const meta: FrontmatterMeta = {};
	for (const line of yamlBlock.split('\n')) {
		const idx = line.indexOf(':');
		if (idx === -1) continue;

		const key = line.slice(0, idx).trim();
		const rawValue = line
			.slice(idx + 1)
			.trim()
			.replace(/^["']|["']$/g, '');

		switch (key) {
			case 'name':
				meta.name = rawValue;
				break;
			case 'description':
				meta.description = rawValue;
				break;
			case 'usage':
				meta.usage = rawValue;
				break;
			case 'stack':
			case 'project':
				meta.stack = rawValue;
				break;
			case 'layer':
				meta.layer = rawValue;
				break;
			case 'tags':
				meta.tags = rawValue
					.replace(/^\[|\]$/g, '')
					.split(',')
					.map((t) => t.trim().replace(/^["']|["']$/g, ''))
					.filter(Boolean);
				break;
		}
	}

	return { meta, content: bodyBlock.trim() };
}
