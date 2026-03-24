import {
	useComments,
	useCreateComment,
	useDeleteComment,
	useUpdateComment,
} from '../hooks/useComments.js';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';
import { CommentForm } from './CommentForm.js';
import { CommentThread } from './CommentThread.js';

interface CommentSectionProps {
	blueprintId: string;
}

export function CommentSection({ blueprintId }: CommentSectionProps) {
	const { data: session } = authClient.useSession();
	const { data: comments, isLoading } = useComments(blueprintId);
	const createMutation = useCreateComment(blueprintId);
	const updateMutation = useUpdateComment(blueprintId);
	const deleteMutation = useDeleteComment(blueprintId);

	const handleCreate = (content: string) => {
		createMutation.mutate({ content });
	};

	const handleReply = (content: string, parentId: string) => {
		createMutation.mutate({ content, parentId });
	};

	const handleEdit = (id: string, content: string) => {
		updateMutation.mutate({ id, content });
	};

	const handleDelete = (id: string) => {
		deleteMutation.mutate(id);
	};

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">{m.comments_title()}</h2>

			{session?.user && (
				<CommentForm onSubmit={handleCreate} isSubmitting={createMutation.isPending} />
			)}

			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : comments?.length ? (
				<div className="space-y-3">
					{comments.map((comment) => (
						<CommentThread
							key={comment.id}
							comment={comment}
							onReply={handleReply}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					))}
				</div>
			) : (
				<p className="text-sm text-gray-500">{m.comments_empty()}</p>
			)}
		</div>
	);
}
