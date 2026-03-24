# Phase 4: Social Features — Implementation Spec

## Current State

Phases 1-3 complete:
- Auth with Google SSO, blueprint CRUD with versioning, tags, projects
- Semantic search with pgvector + Transformers.js
- Comments table already in Drizzle schema (with `parentId` for threading)
- `downloadCount` column already on `blueprints` table

---

## FR-4.1: Comments API

### Tasks

1. **Create comment service** — `api/src/services/comments.ts`
   ```typescript
   export async function listComments(db, blueprintId): Promise<CommentWithReplies[]>
   // Returns top-level comments with nested replies (1 level)
   // Each comment includes author name + image

   export async function createComment(db, blueprintId, authorId, content, parentId?): Promise<Comment>
   // If parentId provided, verify parent exists and belongs to same blueprint

   export async function updateComment(db, commentId, content): Promise<Comment>

   export async function deleteComment(db, commentId): Promise<void>
   // Also deletes child replies
   ```

2. **Create comment routes** — `api/src/routes/comments.ts`
   - `GET /api/blueprints/:id/comments` — public, returns threaded comments
   - `POST /api/blueprints/:id/comments` — requireAuth, body: `{ content, parentId? }`
   - `PUT /api/comments/:id` — requireAuth, author-only
   - `DELETE /api/comments/:id` — requireAuth, author or admin

3. **Wire routes in app** — `api/src/app.ts`

### Key Exports

| Module | Export | Signature |
|--------|--------|-----------|
| `api/src/services/comments.ts` | `listComments` | `(db, blueprintId) => Promise<CommentWithReplies[]>` |
| `api/src/services/comments.ts` | `createComment` | `(db, blueprintId, authorId, content, parentId?) => Promise<Comment>` |

### Test Cases

- **comments.core.test.ts**: `nestComments` groups replies under parents correctly
- **comments.core.test.ts**: `nestComments` handles comments with no replies
- **comments.core.test.ts**: `nestComments` handles orphaned replies gracefully

---

## FR-4.2: User Profile API

### Tasks

1. **Create user routes** — `api/src/routes/users.ts`
   - `GET /api/users/me` — requireAuth, returns current user profile
   - `GET /api/users/:id` — public, returns user profile (name, image, role, createdAt)
   - `GET /api/users/:id/blueprints` — public, paginated list of user's blueprints

2. **Wire routes in app** — `api/src/app.ts`

---

## FR-4.3: Download Tracking

### Tasks

1. **Create download route** — `api/src/routes/blueprints.ts` (add to existing)
   - `POST /api/blueprints/:id/download` — No auth required
   - Atomically increments `downloadCount` using SQL `SET download_count = download_count + 1`
   - Returns `{ downloadCount: number }`

---

## FR-4.4: Frontend Pages

### Tasks

1. **Create comment components**
   - `webapp/src/components/CommentSection.tsx` — Full comment section for a blueprint
   - `webapp/src/components/CommentForm.tsx` — Form for adding/editing comments
   - `webapp/src/components/CommentThread.tsx` — Single comment with nested replies

2. **Create comment hooks** — `webapp/src/hooks/useComments.ts`
   ```typescript
   export function useComments(blueprintId: string)
   export function useCreateComment(blueprintId: string)
   export function useUpdateComment()
   export function useDeleteComment(blueprintId: string)
   ```

3. **Update blueprint detail page** — `webapp/src/routes/blueprints/$blueprintId.tsx`
   - Add CommentSection below content
   - Add download/copy button that calls download API

4. **Create user profile page** — `webapp/src/routes/users/$userId.tsx`
   - Shows user info: name, avatar, role badge, join date
   - Tab: published blueprints (via `GET /api/users/:id/blueprints`)

5. **Create user hooks** — `webapp/src/hooks/useUsers.ts`
   ```typescript
   export function useUser(id: string)
   export function useUserBlueprints(id: string)
   export function useCurrentUser()
   ```

6. **Add i18n messages** — `webapp/messages/en.json`
   New keys for: comments, reply, edit comment, delete comment, profile, downloads, copy

### Files

| Action | Path |
|--------|------|
| Create | `api/src/services/comments.ts` |
| Create | `api/src/services/comments.core.ts` |
| Create | `api/src/services/comments.core.test.ts` |
| Create | `api/src/routes/comments.ts` |
| Create | `api/src/routes/users.ts` |
| Modify | `api/src/routes/blueprints.ts` (add download endpoint) |
| Modify | `api/src/app.ts` (mount new routes) |
| Create | `webapp/src/components/CommentSection.tsx` |
| Create | `webapp/src/components/CommentForm.tsx` |
| Create | `webapp/src/components/CommentThread.tsx` |
| Create | `webapp/src/hooks/useComments.ts` |
| Create | `webapp/src/hooks/useUsers.ts` |
| Create | `webapp/src/routes/users/$userId.tsx` |
| Modify | `webapp/src/routes/blueprints/$blueprintId.tsx` |
| Modify | `webapp/messages/en.json` |

---

## Implementation Order

1. **FR-4.1** — Comments API (service → routes → tests)
2. **FR-4.2** — User profile API
3. **FR-4.3** — Download tracking
4. **FR-4.4** — Frontend (comment components, profile page, download button)
5. Run `pnpm check && pnpm check-types && pnpm test` — verify all green

---

## Acceptance Criteria Checklist

- [ ] Comment form on blueprint detail page
- [ ] Comments displayed chronologically
- [ ] Author can edit/delete own comments
- [ ] Admin can delete any comment
- [ ] Reply button, replies nested 1 level deep
- [ ] Profile page at `/users/:id` with name, avatar, role, join date
- [ ] Profile shows published blueprints
- [ ] Download count incremented via `POST /api/blueprints/:id/download`
- [ ] Download count displayed on blueprint card and detail page
- [ ] `GET /api/users/me` returns current user
- [ ] All new UI strings use Paraglide i18n
- [ ] `pnpm check && pnpm check-types && pnpm test` all green
- [ ] 100% test coverage on `*.core.ts` files
