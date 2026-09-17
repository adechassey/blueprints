import type { CreateStackInput } from '@blueprints/shared';
import { useState } from 'react';
import * as m from '../paraglide/messages.js';
import { TechnologyPicker } from './TechnologyPicker.js';
import { Button } from './ui/button.js';
import { Dialog, DialogDescription, DialogFooter, DialogTitle } from './ui/dialog.js';
import { Input } from './ui/input.js';
import { Textarea } from './ui/textarea.js';

interface StackDialogProps {
	open: boolean;
	onClose: () => void;
	title: string;
	initialValues?: { name: string; description: string | null; technologies: string[] };
	onSubmit: (data: CreateStackInput) => Promise<unknown>;
	isSubmitting: boolean;
}

/** Create or edit a stack: a name, a description and the technologies it is made of. */
export function StackDialog({
	open,
	onClose,
	title,
	initialValues,
	onSubmit,
	isSubmitting,
}: StackDialogProps) {
	return (
		<Dialog open={open} onClose={onClose} className="max-w-lg">
			{/* Remounted on open so an edit always starts from the current stack */}
			{open && (
				<StackForm
					title={title}
					initialValues={initialValues}
					onSubmit={onSubmit}
					onClose={onClose}
					isSubmitting={isSubmitting}
				/>
			)}
		</Dialog>
	);
}

function StackForm({
	title,
	initialValues,
	onSubmit,
	onClose,
	isSubmitting,
}: Omit<StackDialogProps, 'open'>) {
	const [name, setName] = useState(initialValues?.name ?? '');
	const [description, setDescription] = useState(initialValues?.description ?? '');
	const [technologies, setTechnologies] = useState<string[]>(initialValues?.technologies ?? []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit({ name, description: description || undefined, technologies });
		onClose();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-1">
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{m.stack_form_hint()}</DialogDescription>
			</div>

			<div className="space-y-2">
				<label htmlFor="stack-name" className="block text-sm font-semibold text-on-surface">
					{m.stack_form_name()}
				</label>
				<Input
					id="stack-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder={m.stack_form_name_placeholder()}
					required
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="stack-description" className="block text-sm font-semibold text-on-surface">
					{m.form_description()}
				</label>
				<Textarea
					id="stack-description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={2}
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="stack-technologies" className="block text-sm font-semibold text-on-surface">
					{m.form_technologies()}
				</label>
				<TechnologyPicker
					id="stack-technologies"
					value={technologies}
					onValueChange={setTechnologies}
					creatable
					placeholder={m.form_technologies_placeholder()}
				/>
			</div>

			<DialogFooter>
				<Button type="button" variant="ghost" onClick={onClose}>
					{m.dialog_cancel()}
				</Button>
				<Button
					type="submit"
					variant="primary"
					disabled={isSubmitting || !name.trim() || technologies.length === 0}
				>
					{isSubmitting ? m.form_submitting() : m.form_submit()}
				</Button>
			</DialogFooter>
		</form>
	);
}
