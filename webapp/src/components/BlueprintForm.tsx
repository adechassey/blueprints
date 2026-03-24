import type { CreateBlueprintInput, Stack } from '@blueprints/shared';
import { useState } from 'react';
import type { BlueprintFrontmatter } from '../lib/frontmatter.core.js';
import * as m from '../paraglide/messages.js';
import { DropZone } from './DropZone.js';

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
	const [content, setContent] = useState(initialValues.content || '');
	const [changelog, setChangelog] = useState('');

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
			tags,
			content,
		};
		if (showChangelog && changelog) {
			data.changelog = changelog;
		}
		onSubmit(data);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<DropZone onParsed={handleParsed} />

			<div>
				<label className="block text-sm font-medium text-gray-700">
					{m.form_name()}
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					/>
				</label>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					{m.form_description()}
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={2}
						className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					/>
				</label>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					{m.form_usage()}
					<textarea
						value={usage}
						onChange={(e) => setUsage(e.target.value)}
						rows={2}
						className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					/>
				</label>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">
						{m.form_stack()}
						<select
							value={stack}
							onChange={(e) => setStack(e.target.value as Stack)}
							className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
						>
							{STACKS.map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
					</label>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						{m.form_layer()}
						<input
							type="text"
							value={layer}
							onChange={(e) => setLayer(e.target.value)}
							required
							className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					{m.form_tags()}
					<input
						type="text"
						value={tagsInput}
						onChange={(e) => setTagsInput(e.target.value)}
						placeholder={m.form_tags_placeholder()}
						className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					/>
				</label>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					{m.form_content()}
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
						rows={12}
						className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
					/>
				</label>
			</div>

			{showChangelog && (
				<div>
					<label className="block text-sm font-medium text-gray-700">
						{m.form_changelog()}
						<textarea
							value={changelog}
							onChange={(e) => setChangelog(e.target.value)}
							rows={2}
							className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
				</div>
			)}

			<button
				type="submit"
				disabled={isSubmitting}
				className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{isSubmitting ? m.form_submitting() : m.form_submit()}
			</button>
		</form>
	);
}
