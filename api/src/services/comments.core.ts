/**
 * Pure functions for comment threading.
 * No I/O — 100% test coverage required.
 */

export interface FlatComment {
	id: string;
	parentId: string | null;
	content: string;
	authorId: string;
	authorName: string | null;
	authorImage: string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface CommentWithReplies extends FlatComment {
	replies: FlatComment[];
}

export function nestComments(comments: FlatComment[]): CommentWithReplies[] {
	const topLevel: CommentWithReplies[] = [];
	const repliesMap = new Map<string, FlatComment[]>();

	for (const comment of comments) {
		if (comment.parentId) {
			const existing = repliesMap.get(comment.parentId) || [];
			existing.push(comment);
			repliesMap.set(comment.parentId, existing);
		} else {
			topLevel.push({ ...comment, replies: [] });
		}
	}

	for (const parent of topLevel) {
		parent.replies = repliesMap.get(parent.id) || [];
	}

	return topLevel;
}
