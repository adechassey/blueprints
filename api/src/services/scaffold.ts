import { eq } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import { blueprints, blueprintVersions, projects } from '../db/schema.js';
import { groupBlueprintsByLayer, type ScaffoldBlueprint } from './scaffold.core.js';
import { technologiesOfMany } from './technologies.js';

/** The project-scoped scaffold feed: project metadata, technologies and blueprints grouped by layer. */
export async function getProjectScaffold(db: DB, slug: string) {
	const [project] = await db
		.select({
			id: projects.id,
			slug: projects.slug,
			name: projects.name,
			description: projects.description,
		})
		.from(projects)
		.where(eq(projects.slug, slug))
		.limit(1);
	if (!project) return null;

	const rows = await db
		.select({
			id: blueprints.id,
			slug: blueprints.slug,
			name: blueprints.name,
			layer: blueprints.layer,
			description: blueprints.description,
			content: blueprintVersions.content,
		})
		.from(blueprints)
		.innerJoin(blueprintVersions, eq(blueprints.currentVersionId, blueprintVersions.id))
		.where(eq(blueprints.projectId, project.id));

	const techMap = await technologiesOfMany(
		db,
		rows.map((r) => r.id),
	);

	const blueprintsByLayer: ScaffoldBlueprint[] = rows
		.map((r) => ({
			slug: r.slug,
			name: r.name,
			layer: r.layer,
			description: r.description,
			technologies: (techMap.get(r.id) ?? []).map((t) => t.slug),
			content: r.content,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	// Distinct technologies across the project's blueprints, alphabetically by slug
	const techNameBySlug = new Map<string, string>();
	for (const list of techMap.values()) {
		for (const t of list) techNameBySlug.set(t.slug, t.name);
	}
	const technologies = [...techNameBySlug.entries()] // [slug, name]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([slug, name]) => ({ slug, name }));

	return {
		project: { slug: project.slug, name: project.name, description: project.description },
		technologies,
		layers: groupBlueprintsByLayer(blueprintsByLayer),
	};
}
