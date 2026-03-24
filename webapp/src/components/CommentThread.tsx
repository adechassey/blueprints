import { Link } from '@tanstack/react-router';
import { ChevronDown, ChevronUp, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';
import { CommentForm } from './CommentForm.js';
import { Avatar } from './ui/avatar.js';
import { Button } from './ui/button.js';

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
		<div className="space-y-3">
			<div className="flex gap-4 items-start">
				<Avatar
					src={comment.authorImage}
					fallback={comment.authorName ?? '?'}
					size="lg"
					className="shrink-0"
				/>
				<div className="flex-1 space-y-2">
					<div className="bg-surface-container-low p-4 rounded-xl rounded-tl-none">
						{isEditing ? (
							<CommentForm
								initialContent={comment.content}
								onSubmit={(content) => {
									onEdit(comment.id, content);
									setIsEditing(false);
								}}
							/>
						) : (
							<p className="text-sm leading-relaxed text-on-surface">{comment.content}</p>
						)}
					</div>
					<div className="flex items-center gap-3 ml-1">
						<Link
							to="/users/$userId"
							params={{ userId: comment.authorId }}
							className="text-xs font-medium text-on-surface-variant no-underline hover:text-primary"
						>
							{comment.authorName || m.comment_anonymous()}
						</Link>
						<span className="text-[10px] text-outline">
							{new Date(comment.createdAt).toLocaleDateString()}
						</span>
						<div className="flex gap-1 ml-auto">
							{session?.user && (
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									onClick={() => setShowReplyForm(!showReplyForm)}
								>
									<MessageSquare className="h-3.5 w-3.5" />
								</Button>
							)}
							{canModify && (
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									onClick={() => setIsEditing(!isEditing)}
								>
									<Pencil className="h-3.5 w-3.5" />
								</Button>
							)}
							{canDelete && (
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-error hover:text-error"
									onClick={() => onDelete(comment.id)}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>

			{showReplyForm && (
				<div className="ml-14">
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
				<div className="ml-14 space-y-3">
					<button
						type="button"
						onClick={() => setCollapsed(!collapsed)}
						className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
					>
						{collapsed ? (
							<ChevronDown className="h-3.5 w-3.5" />
						) : (
							<ChevronUp className="h-3.5 w-3.5" />
						)}
						{collapsed
							? m.comment_show_replies({ count: comment.replies?.length ?? 0 })
							: m.comment_hide_replies({ count: comment.replies?.length ?? 0 })}
					</button>
					{!collapsed &&
						comment.replies?.map((reply) => (
							<div key={reply.id} className="flex gap-3 items-start">
								<Avatar
									src={reply.authorImage}
									fallback={reply.authorName ?? '?'}
									size="md"
									className="shrink-0"
								/>
								<div className="flex-1 space-y-1">
									<div className="bg-surface-container-low p-3 rounded-xl rounded-tl-none">
										<p className="text-sm leading-relaxed text-on-surface">{reply.content}</p>
									</div>
									<div className="flex items-center gap-3 ml-1">
										<Link
											to="/users/$userId"
											params={{ userId: reply.authorId }}
											className="text-xs font-medium text-on-surface-variant no-underline hover:text-primary"
										>
											{reply.authorName || m.comment_anonymous()}
										</Link>
										<span className="text-[10px] text-outline">
											{new Date(reply.createdAt).toLocaleDateString()}
										</span>
										<div className="flex gap-1 ml-auto">
											{session?.user?.id === reply.authorId && (
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={() => onEdit(reply.id, reply.content)}
												>
													<Pencil className="h-3 w-3" />
												</Button>
											)}
											{(session?.user?.id === reply.authorId ||
												session?.user?.role === 'admin') && (
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6 text-error hover:text-error"
													onClick={() => onDelete(reply.id)}
												>
													<Trash2 className="h-3 w-3" />
												</Button>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
				</div>
			)}
		</div>
	);
}
