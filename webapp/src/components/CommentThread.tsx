import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';
import { CommentForm } from './CommentForm.js';

interface Comment {
	id: string;
	content: string;
	authorId: string;
	authorName: string | null;
	authorImage: string | null;
	createdAt: string;
	replies?: Comment[];
}

interface CommentThreadProps {
	comment: Comment;
	onReply: (content: string, parentId: string) => void;
	onEdit: (id: string, content: string) => void;
	onDelete: (id: string) => void;
}

export function CommentThread({ comment, onReply, onEdit, onDelete }: CommentThreadProps) {
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const hasReplies = comment.replies && comment.replies.length > 0;
	const { data: session } = authClient.useSession();

	const isOwner = session?.user?.id === comment.authorId;
	const isAdmin = session?.user?.role === 'admin';
	const canModify = isOwner;
	const canDelete = isOwner || isAdmin;

	return (
		<div className="space-y-2">
			<div className="rounded-md border bg-white p-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{comment.authorImage && (
							<img src={comment.authorImage} alt="" className="h-6 w-6 rounded-full" />
						)}
						<Link
							to="/users/$userId"
							params={{ userId: comment.authorId }}
							className="text-sm font-medium text-gray-900 no-underline hover:underline"
						>
							{comment.authorName || m.comment_anonymous()}
						</Link>
						<span className="text-xs text-gray-400">
							{new Date(comment.createdAt).toLocaleDateString()}
						</span>
					</div>
					<div className="flex gap-2">
						{session?.user && (
							<button
								type="button"
								onClick={() => setShowReplyForm(!showReplyForm)}
								className="text-xs text-blue-600 hover:underline"
							>
								{m.comment_reply()}
							</button>
						)}
						{canModify && (
							<button
								type="button"
								onClick={() => setIsEditing(!isEditing)}
								className="text-xs text-gray-500 hover:underline"
							>
								{m.comment_edit()}
							</button>
						)}
						{canDelete && (
							<button
								type="button"
								onClick={() => onDelete(comment.id)}
								className="text-xs text-red-500 hover:underline"
							>
								{m.comment_delete()}
							</button>
						)}
					</div>
				</div>
				{isEditing ? (
					<div className="mt-2">
						<CommentForm
							initialContent={comment.content}
							onSubmit={(content) => {
								onEdit(comment.id, content);
								setIsEditing(false);
							}}
						/>
					</div>
				) : (
					<p className="mt-1 text-sm text-gray-700">{comment.content}</p>
				)}
			</div>

			{showReplyForm && (
				<div className="ml-6">
					<CommentForm
						placeholder={m.comment_reply_placeholder()}
						onSubmit={(content) => {
							onReply(content, comment.id);
							setShowReplyForm(false);
						}}
					/>
				</div>
			)}

			{hasReplies && (
				<div className="ml-6 space-y-2">
					<button
						type="button"
						onClick={() => setCollapsed(!collapsed)}
						className="text-xs text-blue-600 hover:underline"
					>
						{collapsed
							? m.comment_show_replies({ count: comment.replies?.length })
							: m.comment_hide_replies({ count: comment.replies?.length })}
					</button>
					{!collapsed &&
						comment.replies?.map((reply) => (
							<div key={reply.id} className="rounded-md border bg-gray-50 p-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{reply.authorImage && (
											<img src={reply.authorImage} alt="" className="h-5 w-5 rounded-full" />
										)}
										<Link
											to="/users/$userId"
											params={{ userId: reply.authorId }}
											className="text-sm font-medium text-gray-900 no-underline hover:underline"
										>
											{reply.authorName || m.comment_anonymous()}
										</Link>
										<span className="text-xs text-gray-400">
											{new Date(reply.createdAt).toLocaleDateString()}
										</span>
									</div>
									<div className="flex gap-2">
										{session?.user?.id === reply.authorId && (
											<button
												type="button"
												onClick={() => onEdit(reply.id, reply.content)}
												className="text-xs text-gray-500 hover:underline"
											>
												{m.comment_edit()}
											</button>
										)}
										{(session?.user?.id === reply.authorId || session?.user?.role === 'admin') && (
											<button
												type="button"
												onClick={() => onDelete(reply.id)}
												className="text-xs text-red-500 hover:underline"
											>
												{m.comment_delete()}
											</button>
										)}
									</div>
								</div>
								<p className="mt-1 text-sm text-gray-700">{reply.content}</p>
							</div>
						))}
				</div>
			)}
		</div>
	);
}
