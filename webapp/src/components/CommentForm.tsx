import { Send } from 'lucide-react';
import { useState } from 'react';
import * as m from '../paraglide/messages.js';
import { Button } from './ui/button.js';

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
		<form onSubmit={handleSubmit}>
			<div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder={placeholder || m.comment_placeholder()}
					rows={2}
					className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none outline-none text-on-surface placeholder:text-outline"
				/>
				<div className="flex justify-end mt-2">
					<Button
						type="submit"
						variant="primary"
						size="sm"
						disabled={isSubmitting || !content.trim()}
					>
						<Send className="h-3.5 w-3.5" />
						{m.comment_submit()}
					</Button>
				</div>
			</div>
		</form>
	);
}
