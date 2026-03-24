import { useState } from 'react';
import * as m from '../paraglide/messages.js';

interface CommentFormProps {
	onSubmit: (content: string) => void;
	initialContent?: string;
	isSubmitting?: boolean;
	placeholder?: string;
}

export function CommentForm({
	onSubmit,
	initialContent = '',
	isSubmitting,
	placeholder,
}: CommentFormProps) {
	const [content, setContent] = useState(initialContent);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;
		onSubmit(content.trim());
		setContent('');
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<input
				type="text"
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder={placeholder || m.comment_placeholder()}
				className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
			/>
			<button
				type="submit"
				disabled={isSubmitting || !content.trim()}
				className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{m.comment_submit()}
			</button>
		</form>
	);
}
