import type { CreateBlueprintInput, Stack } from '@blueprints/shared';
import { useState } from 'react';
import { useProjects } from '../hooks/useProjects.js';
import type { BlueprintFrontmatter } from '../lib/frontmatter.core.js';
import * as m from '../paraglide/messages.js';
import { DropZone } from './DropZone.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { Select } from './ui/select.js';
import { Textarea } from './ui/textarea.js';

export interface BlueprintFormData extends Omit<CreateBlueprintInput, 'isPublic'> {
	changelog?: string;
}

interface BlueprintFormProps {
	initialValues?: {
		name?: string;
		description?: string;
		usage?: string;
		stack?: string;
		layer?: string;
		tags?: string[];
		content?: string;
		projectId?: string;
	};
	onSubmit: (data: BlueprintFormData) => void;
	isSubmitting?: boolean;
	showChangelog?: boolean;
}

const STACKS: Stack[] = ['server', 'webapp', 'shared', 'fullstack'];

export function BlueprintForm({
	initialValues = {},
	onSubmit,
	isSubmitting,
	showChangelog,
}: BlueprintFormProps) {
	const [name, setName] = useState(initialValues.name || '');
	const [description, setDescription] = useState(initialValues.description || '');
	const [usage, setUsage] = useState(initialValues.usage || '');
	const [stack, setStack] = useState<Stack>((initialValues.stack as Stack) || 'server');
	const [layer, setLayer] = useState(initialValues.layer || '');
	const [tagsInput, setTagsInput] = useState((initialValues.tags || []).join(', '));
	const [projectId, setProjectId] = useState(initialValues.projectId || '');
	const [content, setContent] = useState(initialValues.content || '');
	const [changelog, setChangelog] = useState('');
	const { data: projects } = useProjects();

	const handleParsed = (meta: BlueprintFrontmatter, parsedContent: string) => {
		if (meta.name) setName(meta.name);
		if (meta.description) setDescription(meta.description);
		if (meta.usage) setUsage(meta.usage);
		if (meta.stack) setStack(meta.stack as Stack);
		if (meta.layer) setLayer(meta.layer);
		if (meta.tags) setTagsInput(meta.tags.join(', '));
		if (parsedContent) setContent(parsedContent);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const tags = tagsInput
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
		const data: BlueprintFormData = {
			name,
			description: description || undefined,
			usage: usage || undefined,
			stack,
			layer,
			projectId: projectId || undefined,
			tags,
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
				<Select id="bp-project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
					<option value="">{m.form_project_none()}</option>
					{projects?.map((p: { id: string; name: string }) => (
						<option key={p.id} value={p.id}>
							{p.name}
						</option>
					))}
				</Select>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<label htmlFor="bp-stack" className="block text-sm font-semibold text-on-surface">
						{m.form_stack()}
					</label>
					<Select id="bp-stack" value={stack} onChange={(e) => setStack(e.target.value as Stack)}>
						{STACKS.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</Select>
				</div>
				<div className="space-y-2">
					<label htmlFor="bp-layer" className="block text-sm font-semibold text-on-surface">
						{m.form_layer()}
					</label>
					<Input
						id="bp-layer"
						type="text"
						value={layer}
						onChange={(e) => setLayer(e.target.value)}
						required
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

			<Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
				{isSubmitting ? m.form_submitting() : m.form_submit()}
			</Button>
		</form>
	);
}
