import {
	BLUEPRINT_LAYERS,
	type BlueprintLayer,
	type CreateBlueprintInput,
} from '@blueprints/shared';
import { useState } from 'react';
import { useProjects } from '../hooks/useProjects.js';
import type { BlueprintFrontmatter } from '../lib/frontmatter.core.js';
import { toLayer } from '../lib/layers.core.js';
import { LAYER_META } from '../lib/layers.js';
import { parseList } from '../lib/technologies.core.js';
import * as m from '../paraglide/messages.js';
import { DropZone } from './DropZone.js';
import { LayerOption } from './LayerBadge.js';
import { TechnologyPicker } from './TechnologyPicker.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.js';
import { Textarea } from './ui/textarea.js';

export interface BlueprintFormData extends Omit<CreateBlueprintInput, 'isPublic'> {
	changelog?: string;
}

interface BlueprintFormProps {
	initialValues?: {
		name?: string;
		description?: string;
		usage?: string;
		technologies?: string[];
		layer?: string;
		tags?: string[];
		content?: string;
		projectId?: string;
	};
	onSubmit: (data: BlueprintFormData) => void;
	isSubmitting?: boolean;
	showChangelog?: boolean;
}

export function BlueprintForm({
	initialValues = {},
	onSubmit,
	isSubmitting,
	showChangelog,
}: BlueprintFormProps) {
	const [name, setName] = useState(initialValues.name || '');
	const [description, setDescription] = useState(initialValues.description || '');
	const [usage, setUsage] = useState(initialValues.usage || '');
	const [technologies, setTechnologies] = useState<string[]>(initialValues.technologies ?? []);
	const [layer, setLayer] = useState<BlueprintLayer>(toLayer(initialValues.layer) ?? 'domain');
	const [tagsInput, setTagsInput] = useState((initialValues.tags || []).join(', '));
	const [projectId, setProjectId] = useState(initialValues.projectId || '');
	const [content, setContent] = useState(initialValues.content || '');
	const [changelog, setChangelog] = useState('');
	const { data: projects } = useProjects();

	const handleParsed = (meta: BlueprintFrontmatter, parsedContent: string) => {
		if (meta.name) setName(meta.name);
		if (meta.description) setDescription(meta.description);
		if (meta.usage) setUsage(meta.usage);
		if (meta.technologies) setTechnologies(meta.technologies);
		// Legacy free-text layers ("service"…) would be rejected by the API: keep the current one
		const importedLayer = toLayer(meta.layer);
		if (importedLayer) setLayer(importedLayer);
		if (meta.tags) setTagsInput(meta.tags.join(', '));
		if (parsedContent) setContent(parsedContent);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const data: BlueprintFormData = {
			name,
			description: description || undefined,
			usage: usage || undefined,
			technologies,
			layer,
			projectId,
			tags: parseList(tagsInput),
			content,
		};
		if (showChangelog && changelog) {
			data.changelog = changelog;
		}
		onSubmit(data);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-[800px]">
			<DropZone onParsed={handleParsed} />

			<div className="space-y-2">
				<label htmlFor="bp-name" className="block text-sm font-semibold text-on-surface">
					{m.form_name()}
				</label>
				<Input
					id="bp-name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="bp-description" className="block text-sm font-semibold text-on-surface">
					{m.form_description()}
				</label>
				<Textarea
					id="bp-description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={2}
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="bp-usage" className="block text-sm font-semibold text-on-surface">
					{m.form_usage()}
				</label>
				<Textarea id="bp-usage" value={usage} onChange={(e) => setUsage(e.target.value)} rows={2} />
			</div>

			<div className="space-y-2">
				<label htmlFor="bp-project" className="block text-sm font-semibold text-on-surface">
					{m.form_project()}
				</label>
				<Select value={projectId} onValueChange={setProjectId}>
					<SelectTrigger id="bp-project" aria-describedby="bp-project-description">
						<SelectValue placeholder={m.form_project_placeholder()} />
					</SelectTrigger>
					<SelectContent>
						{projects?.map((p: { id: string; name: string }) => (
							<SelectItem key={p.id} value={p.id}>
								{p.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<p id="bp-project-description" className="text-xs text-on-surface-variant">
					{m.form_project_hint()}
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<label htmlFor="bp-layer" className="block text-sm font-semibold text-on-surface">
						{m.form_layer()}
					</label>
					<Select value={layer} onValueChange={(v) => setLayer(toLayer(v) ?? layer)}>
						<SelectTrigger id="bp-layer" aria-describedby="bp-layer-description">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{BLUEPRINT_LAYERS.map((l) => (
								<SelectItem key={l} value={l}>
									<LayerOption layer={l} />
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p id="bp-layer-description" className="text-xs text-on-surface-variant">
						{LAYER_META[layer].description()}
					</p>
				</div>
				<div className="space-y-2">
					<label htmlFor="bp-technologies" className="block text-sm font-semibold text-on-surface">
						{m.form_technologies()}
					</label>
					<TechnologyPicker
						id="bp-technologies"
						value={technologies}
						onValueChange={setTechnologies}
						creatable
						placeholder={m.form_technologies_placeholder()}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<label htmlFor="bp-tags" className="block text-sm font-semibold text-on-surface">
					{m.form_tags()}
				</label>
				<Input
					id="bp-tags"
					type="text"
					value={tagsInput}
					onChange={(e) => setTagsInput(e.target.value)}
					placeholder={m.form_tags_placeholder()}
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="bp-content" className="block text-sm font-semibold text-on-surface">
					{m.form_content()}
				</label>
				<Textarea
					id="bp-content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
					rows={12}
					className="font-mono"
				/>
			</div>

			{showChangelog && (
				<div className="space-y-2">
					<label htmlFor="bp-changelog" className="block text-sm font-semibold text-on-surface">
						{m.form_changelog()}
					</label>
					<Textarea
						id="bp-changelog"
						value={changelog}
						onChange={(e) => setChangelog(e.target.value)}
						rows={2}
					/>
				</div>
			)}

			<Button type="submit" variant="primary" size="lg" disabled={isSubmitting || !projectId}>
				{isSubmitting ? m.form_submitting() : m.form_submit()}
			</Button>
		</form>
	);
}
