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
import { Skeleton } from './ui/skeleton.js';

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
			<h3 className="font-headline text-xl font-extrabold">{m.comments_title()}</h3>

			{session?.user && (
				<CommentForm onSubmit={handleCreate} isSubmitting={createMutation.isPending} />
			)}

			{isLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
			) : comments?.length ? (
				<div className="space-y-4">
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
				<p className="text-sm text-on-surface-variant">{m.comments_empty()}</p>
			)}
		</div>
	);
}
