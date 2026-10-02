import type { ProjectArchitecture } from '@blueprints/shared';
import { useId, useState } from 'react';
import { useUpdateProject } from '../hooks/useProjects.js';
import {
	defaultArchitecture,
	parseArchitectureDraft,
	technologySlugs,
} from '../lib/architecture.core.js';
import * as m from '../paraglide/messages.js';
import { ArchitectureMap } from './ArchitectureMap.js';
import { Badge } from './ui/badge.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';

type Blueprints = React.ComponentProps<typeof ArchitectureMap>['blueprints'];

const EXAMPLE: ProjectArchitecture = {
	zones: [
		{
			id: 'web',
			label: 'Webapp',
			hint: 'React',
			technologies: ['react'],
			layerLabels: { api: 'Routes & API client' },
		},
		{
			id: 'server',
			label: 'Server',
			hint: 'Node.js',
			technologies: ['node'],
			layerLabels: { api: 'HTTP endpoints', domain: 'Services' },
		},
		{ id: 'shared', label: 'Shared', shared: true },
	],
	edges: [{ from: 'web', to: 'server', layer: 'api', label: 'HTTP' }],
};

const format = (config: ProjectArchitecture) => JSON.stringify(config, null, 2);

/** Edits a project's architecture config as JSON, with a live preview of the map. */
export function ArchitectureEditor({
	project,
	onClose,
}: {
	project: {
		id: string;
		slug: string;
		architecture: ProjectArchitecture | null;
		blueprints: Blueprints;
	};
	onClose: () => void;
}) {
	const fieldId = useId();
	const [text, setText] = useState(() =>
		format(project.architecture ?? defaultArchitecture(m.architecture_default_zone())),
	);
	const draft = parseArchitectureDraft(text);
	const update = useUpdateProject(project.slug);
	const save = (architecture: ProjectArchitecture | null) =>
		update.mutate({ id: project.id, architecture }, { onSuccess: onClose });

	return (
		<div className="space-y-6 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-rest">
			<p className="text-sm text-on-surface-variant">{m.architecture_editor_description()}</p>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="space-y-2">
					<label htmlFor={fieldId} className="text-sm font-semibold text-on-surface">
						{m.architecture_editor_config()}
					</label>
					<Textarea
						id={fieldId}
						value={text}
						onChange={(event) => setText(event.target.value)}
						rows={20}
						spellCheck={false}
						className="font-mono text-xs leading-relaxed"
					/>
				</div>
				<aside className="min-w-0 space-y-5 text-sm">
					<div className="space-y-2">
						<p className="font-semibold text-on-surface">{m.architecture_editor_technologies()}</p>
						<div className="flex flex-wrap gap-1.5">
							{technologySlugs(project.blueprints).map((slug) => (
								<Badge key={slug} variant="secondary" className="font-mono">
									{slug}
								</Badge>
							))}
						</div>
					</div>
					<details className="space-y-2">
						<summary className="cursor-pointer font-semibold text-on-surface">
							{m.architecture_editor_example()}
						</summary>
						<pre className="overflow-x-auto rounded-lg bg-surface-container-low p-3 font-mono text-[11px] leading-relaxed text-on-surface-variant">
							{format(EXAMPLE)}
						</pre>
						<Button variant="secondary" size="sm" onClick={() => setText(format(EXAMPLE))}>
							{m.architecture_editor_use_example()}
						</Button>
					</details>
				</aside>
			</div>

			<div className="space-y-3">
				<h3 className="font-headline text-sm font-bold uppercase tracking-wide text-outline">
					{m.architecture_editor_preview()}
				</h3>
				{draft.ok ? (
					<ArchitectureMap
						blueprints={project.blueprints}
						architecture={draft.config}
						drillDown={false}
					/>
				) : (
					<div
						role="alert"
						className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error"
					>
						<p className="mb-2 font-semibold">{m.architecture_editor_invalid()}</p>
						<ul className="list-disc space-y-1 pl-5 font-mono text-xs">
							{draft.issues.map((issue) => (
								<li key={issue}>{issue}</li>
							))}
						</ul>
					</div>
				)}
			</div>

			<div className="flex flex-wrap justify-end gap-2">
				<Button variant="ghost" onClick={onClose}>
					{m.architecture_editor_cancel()}
				</Button>
				{project.architecture && (
					<Button variant="secondary" onClick={() => save(null)} disabled={update.isPending}>
						{m.architecture_editor_reset()}
					</Button>
				)}
				<Button
					onClick={() => draft.ok && save(draft.config)}
					disabled={!draft.ok || update.isPending}
				>
					{m.architecture_editor_save()}
				</Button>
			</div>
		</div>
	);
}
