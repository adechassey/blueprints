/**
 * Validates that a URL is a Vercel preview deployment for THIS project.
 *
 * Vercel preview URLs follow the pattern:
 *   https://<project>-<hash>-<scope>.vercel.app
 *
 * We check against the project name and team scope to prevent
 * session token theft via attacker-controlled .vercel.app domains.
 */
export function isProjectPreviewUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'https:') return false;

		const hostname = parsed.hostname;
		if (!hostname.endsWith('.vercel.app')) return false;

		// Production: blueprints-webapp.vercel.app
		// Previews:   blueprints-webapp-<hash>-<scope>.vercel.app
		const projectPrefix = 'blueprints-webapp-';
		// TODO: Replace with your Vercel team/user scope
		const teamSuffix = '-hugoleborsos-projects.vercel.app';

		return hostname.startsWith(projectPrefix) && hostname.endsWith(teamSuffix);
	} catch {
		return false;
	}
}
