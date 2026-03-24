# Phase 3: Search & Discovery — PRD

## Goal

Add semantic search powered by Transformers.js and pgvector. Seed the database with the existing 85 blueprints and generate embeddings for all of them. At the end of this phase, users can search for blueprints using natural language queries.

## User Stories

### US-3.1: User searches blueprints with natural language
**As a** user,
**I want to** type a natural language query like "NestJS CRUD controller with validation",
**So that** I find relevant blueprints even if the exact words don't appear in the title.

**Acceptance criteria:**
- Search bar on the browse page
- Results ranked by semantic similarity
- Results display similarity score or relevance indicator
- Combines with existing filters (stack, layer, tags, project)
- Empty query falls back to regular listing

### US-3.2: Embeddings are generated on publish/update
**As a** blueprint author,
**I want** my blueprint to be searchable immediately after publishing,
**So that** others can discover it right away.

**Acceptance criteria:**
- Embedding generated when a new version is created
- Embedding stored in the `blueprint_versions.embedding` column
- If embedding generation fails, the blueprint is still saved (embedding updated later)
- Embedding covers: description + usage + full content

### US-3.3: Existing blueprints are seeded
**As a** user,
**I want** the 85 existing blueprints available in the registry,
**So that** the platform has content from day one.

**Acceptance criteria:**
- All 85 markdown files from `webapp/src/assets/blueprints/` imported
- Metadata parsed from YAML frontmatter (name, description, usage, project, layer)
- Stack inferred from `project` field (server/webapp/shared)
- Embeddings generated for all seeded blueprints
- A default project created for the seed data (e.g., "aquila-ap")

### US-3.4: User sees search suggestions
**As a** user,
**I want** the search to feel responsive,
**So that** I'm not waiting too long for results.

**Acceptance criteria:**
- Search triggers on form submit (not on every keystroke — embedding generation has latency)
- Loading state displayed while waiting for results
- Results appear within 2-3 seconds (acceptable given cold start)
- Debounce if later changed to live search

## Functional Requirements

### FR-3.1: Dedicated embeddings serverless function
- Separate Vercel function at `/api/embeddings`
- Loads `sentence-transformers/all-MiniLM-L6-v2` via `@huggingface/transformers`
- Accepts text input, returns 384-dimension vector
- Higher memory limit configured in Vercel (512MB or 1024MB)
- Cold start ~5-10s acceptable for this function

### FR-3.2: Embedding generation pipeline
- On blueprint version create: call embeddings function with concatenated `description + usage + content`
- Store resulting vector in `blueprint_versions.embedding`
- If embeddings function fails: log error, leave embedding null, don't block the create
- Retry mechanism: a script/endpoint to backfill null embeddings

### FR-3.3: Semantic search API
- `GET /api/blueprints/search?q=<query>` — Semantic search endpoint
- Flow:
  1. Send query text to embeddings function → get query vector
  2. Run pgvector cosine distance query: `ORDER BY embedding <=> $queryVector LIMIT $limit`
  3. Apply additional filters (stack, layer, tags, project) as WHERE clauses
  4. Return results with similarity score
- Pagination support
- Fallback: if no embedding available, exclude blueprint from vector results (still findable via filters)

### FR-3.4: Combined search
- Text search (ILIKE on name/description) combined with semantic search
- Weighting: semantic similarity as primary ranking, text match as boost
- Or: separate "Search" tab vs "Browse" tab approach

### FR-3.5: Seed script
- Script at `api/scripts/seed.ts` (run via `pnpm db:seed`)
- Reads all 85 markdown files from `webapp/src/assets/blueprints/`
- Parses YAML frontmatter for metadata
- Creates a default project, author (system user), and all tags
- Generates embeddings for each blueprint (batched, with progress output)
- Idempotent: can be re-run without duplicating data

### FR-3.6: Frontend search UI
- Search input in the header or above the blueprint list
- Search results page with relevance-sorted cards
- Combine search with existing filter sidebar
- Clear search button to return to browse mode

## Non-Functional Requirements

- Embedding generation: < 15s per blueprint (including cold start)
- Search query response: < 3s (including embedding generation for query + DB query)
- Seed script: completes within 10 minutes for 85 blueprints
- All search UI strings use Paraglide i18n

## Dependencies

- Phase 2 complete (auth, blueprint CRUD, SPA connected to API)
- pgvector extension enabled in database (Phase 1)

## Out of Scope

- Real-time search-as-you-type (too slow with embedding generation per keystroke)
- Multi-modal search (image-based search)
- Search analytics / popular queries

## Deliverables

1. Dedicated Transformers.js embeddings serverless function
2. Embedding generation integrated into blueprint create/update flow
3. Semantic search API endpoint
4. Seed script importing 85 existing blueprints with embeddings
5. Frontend search UI integrated with filters
6. Backfill script for null embeddings
