const PREAMBLE_RE =
	/^## Context\n\n([\s\S]*?)\n\n## Usage\n\n([\s\S]*?)\n\n## Implementation\n\n(?:Exemplar: `[^`\n]*`\n*)?/;
const GENERIC_CONTEXT_RE = /^Pattern `[^`]+` — canonical exemplar in the source codebase\.$/;

interface BlueprintFields {
	description?: string | null;
	usage?: string | null;
}

/**
 * Blueprints synced before the content was trimmed to the excerpt open with
 * Context, Usage and Implementation sections that repeat the description,
 * usage and source fields. The page renders those fields itself, so the
 * repeat is dropped when it matches them exactly; anything else is kept.
 */
export function stripSyncedPreamble(content: string, fields: BlueprintFields): string {
	const match = PREAMBLE_RE.exec(content);
	if (!match) return content;

	const [preamble, context, usage] = match as unknown as [string, string, string];
	const sameContext = fields.description
		? context === fields.description
		: GENERIC_CONTEXT_RE.test(context);
	const sameUsage = usage === (fields.usage ?? '');
	if (!sameContext || !sameUsage) return content;

	return content.slice(preamble.length);
}
