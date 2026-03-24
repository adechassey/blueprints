# Phase 4: Social Features — PRD

## Goal

Add comments with threading, public user profiles, and download tracking. At the end of this phase, the platform has community features that encourage engagement.

## User Stories

### US-4.1: User comments on a blueprint
**As an** authenticated user,
**I want to** leave a comment on a blueprint,
**So that** I can share feedback, ask questions, or suggest improvements.

**Acceptance criteria:**
- Comment form on the blueprint detail page
- Comments displayed chronologically below the blueprint content
- Each comment shows: author name, avatar, date, content
- Author can edit or delete their own comments
- Admins can delete any comment

### US-4.2: User replies to a comment
**As a** user,
**I want to** reply to an existing comment,
**So that** conversations stay organized in threads.

**Acceptance criteria:**
- "Reply" button on each comment
- Replies nested under the parent comment (one level deep)
- Reply form appears inline
- Thread is collapsible

### US-4.3: User views a profile
**As a** user,
**I want to** view another user's public profile,
**So that** I can see their published blueprints.

**Acceptance criteria:**
- Profile page at `/users/:id`
- Shows: name, avatar, join date, role badge
- Tab: published blueprints
- Blueprint count

### US-4.4: Blueprint tracks downloads
**As a** blueprint author,
**I want to** see how many times my blueprint has been downloaded,
**So that** I know its impact.

**Acceptance criteria:**
- Download count incremented when:
  - User clicks "Download" or "Copy" on the web UI
  - CLI pulls the blueprint
  - MCP downloads the blueprint
- Count displayed on blueprint card and detail page
- No authentication required to increment (any download counts)

## Functional Requirements

### FR-4.1: Comments API
- `GET /api/blueprints/:id/comments` — List comments for a blueprint (with nested replies)
- `POST /api/blueprints/:id/comments` — Create comment (body: `{ content, parentId? }`)
- `PUT /api/comments/:id` — Edit own comment
- `DELETE /api/comments/:id` — Delete own (or any as admin)
- Comments returned in chronological order, replies nested under parents
- Requires authentication for write operations

### FR-4.2: User profile API
- `GET /api/users/me` — Current user profile
- `GET /api/users/:id` — Public profile
- `GET /api/users/:id/blueprints` — User's published blueprints (paginated)

### FR-4.3: Download tracking
- `POST /api/blueprints/:id/download` — Increment download count
- No authentication required
- Atomic increment in DB (`downloadCount = downloadCount + 1`)
- Called by web UI, CLI, and MCP on download/copy actions

### FR-4.4: Frontend pages
- Comment section on blueprint detail page
- User profile page
- Download count badges

## Non-Functional Requirements

- Comment threading: max 1 level deep (replies to replies are flat)
- All UI strings use Paraglide i18n

## Dependencies

- Phase 2 complete (auth, blueprint CRUD)
- Phase 3 not strictly required but recommended (search enhances discovery)

## Out of Scope

- Likes/upvotes on blueprints (could add later)
- Following users
- Notifications (email or in-app)
- Comment markdown rendering (plain text for now)

## Deliverables

1. Comments API with threading
2. Comments UI on blueprint detail page
3. User profile page with published blueprints
4. Download count tracking and display
