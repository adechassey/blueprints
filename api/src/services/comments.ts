import { asc, eq } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import { comments, users } from '../db/schema.js';
import { type CommentWithReplies, nestComments } from './comments.core.js';

export async function listComments(db: DB, blueprintId: string): Promise<CommentWithReplies[]> {
	const rows = await db
		.select({
			id: comments.id,
			parentId: comments.parentId,
			content: comments.content,
			authorId: comments.authorId,
			authorName: users.name,
			authorImage: users.image,
			createdAt: comments.createdAt,
			updatedAt: comments.updatedAt,
		})
		.from(comments)
		.leftJoin(users, eq(comments.authorId, users.id))
		.where(eq(comments.blueprintId, blueprintId))
		.orderBy(asc(comments.createdAt));

	return nestComments(rows);
}

export async function createComment(
	db: DB,
	blueprintId: string,
	authorId: string,
	content: string,
	parentId?: string,
) {
	const [comment] = await db
		.insert(comments)
		.values({
			blueprintId,
			authorId,
			content,
			parentId: parentId ?? null,
		})
		.returning();
	return comment;
}

export async function updateComment(db: DB, commentId: string, content: string) {
	const [updated] = await db
		.update(comments)
		.set({ content })
		.where(eq(comments.id, commentId))
		.returning();
	return updated ?? null;
}

export async function deleteComment(db: DB, commentId: string) {
	// Delete child replies first
	await db.delete(comments).where(eq(comments.parentId, commentId));
	await db.delete(comments).where(eq(comments.id, commentId));
}

export async function getCommentById(db: DB, commentId: string) {
	const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
	return comment ?? null;
}
