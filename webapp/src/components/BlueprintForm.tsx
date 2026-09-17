import type { CreateBlueprintInput } from '@blueprints/shared';
import { BLUEPRINT_LAYERS } from '@blueprints/shared';
import { useState } from 'react';
import { useProjects } from '../hooks/useProjects.js';
import { useTechnologies } from '../hooks/useTags.js';
import type { BlueprintFrontmatter } from '../lib/frontmatter.core.js';
import * as m from '../paraglide/messages.js';
import { DropZone } from './DropZone.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.js';
import { Textarea } from './ui/textarea.js';

/** Radix Select items cannot carry an empty value: sentinel for "no project". */
const NO_PROJECT = 'none';

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
	const [technologiesInput, setTechnologiesInput] = useState(
		(initialValues.technologies || []).join(', '),
	);
	const [layer, setLayer] = useState(initialValues.layer || 'domain');
	const [tagsInput, setTagsInput] = useState((initialValues.tags || []).join(', '));
	const [projectId, setProjectId] = useState(initialValues.projectId || '');
	const [content, setContent] = useState(initialValues.content || '');
	const [changelog, setChangelog] = useState('');
	const { data: projects } = useProjects();
	const { data: technologies } = useTechnologies();

	const handleParsed = (meta: BlueprintFrontmatter, parsedContent: string) => {
		if (meta.name) setName(meta.name);
		if (meta.description) setDescription(meta.description);
		if (meta.usage) setUsage(meta.usage);
		if (meta.technologies) setTechnologiesInput(meta.technologies.join(', '));
		if (meta.layer) setLayer(meta.layer);
		if (meta.tags) setTagsInput(meta.tags.join(', '));
		if (parsedContent) setContent(parsedContent);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const splitList = (v: string) =>
			v
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
		const data: BlueprintFormData = {
			name,
			description: description || undefined,
			usage: usage || undefined,
			technologies: splitList(technologiesInput),
			layer: layer as BlueprintFormData['layer'],
			projectId: projectId || undefined,
			tags: splitList(tagsInput),
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
				<Select
					value={projectId || NO_PROJECT}
					onValueChange={(v) => setProjectId(v === NO_PROJECT ? '' : v)}
				>
					<SelectTrigger id="bp-project">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NO_PROJECT}>{m.form_project_none()}</SelectItem>
						{projects?.map((p: { id: string; name: string }) => (
							<SelectItem key={p.id} value={p.id}>
								{p.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<label htmlFor="bp-layer" className="block text-sm font-semibold text-on-surface">
						{m.form_layer()}
					</label>
					<Select value={layer} onValueChange={setLayer}>
						<SelectTrigger id="bp-layer">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{BLUEPRINT_LAYERS.map((l) => (
								<SelectItem key={l} value={l}>
									{l}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<label htmlFor="bp-technologies" className="block text-sm font-semibold text-on-surface">
						{m.form_technologies()}
					</label>
					<Input
						id="bp-technologies"
						type="text"
						list="form-technologies-datalist"
						value={technologiesInput}
						onChange={(e) => setTechnologiesInput(e.target.value)}
						placeholder={m.form_technologies_placeholder()}
					/>
					<datalist id="form-technologies-datalist">
						{(technologies ?? []).map((t: { id: string; slug: string }) => (
							<option key={t.id} value={t.slug} />
						))}
					</datalist>
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

			<Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
				{isSubmitting ? m.form_submitting() : m.form_submit()}
			</Button>
		</form>
	);
}
