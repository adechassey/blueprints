# Phase 3: Search & Discovery — Implementation Spec

## Current State

Phase 2 complete:
- Better Auth with Google SSO
- Blueprint CRUD API with versioning
- Tag/project management
- SPA connected to API with TanStack Query
- All 7 Drizzle tables with pgvector `embedding vector(384)` column on `blueprint_versions`
- 85 blueprint markdown files in `webapp/src/assets/blueprints/`

---

## FR-3.1: Dedicated Embeddings Service

### Tasks

1. **Install `@huggingface/transformers` in `api/`**
   - `@huggingface/transformers` as dependency (for `all-MiniLM-L6-v2` model)

2. **Create embeddings service** — `api/src/services/embeddings.ts`
   ```typescript
   export async function generateEmbedding(text: string): Promise<number[]>
   // Loads sentence-transformers/all-MiniLM-L6-v2 model
   // Returns 384-dimension vector
   // Handles model loading/caching (singleton pipeline)
   ```

3. **Create embeddings route** — `api/src/routes/embeddings.ts`
   - `POST /api/embeddings` — Accepts `{ text: string }`, returns `{ embedding: number[] }`
   - Protected endpoint (require auth, or at least server-to-server)

4. **Wire route in app** — `api/src/app.ts`

### Key Exports

| Module | Export | Signature |
|--------|--------|-----------|
| `api/src/services/embeddings.ts` | `generateEmbedding` | `(text: string) => Promise<number[]>` |

### Test Cases

- **embeddings.core.test.ts**: `prepareEmbeddingText` concatenates description + usage + content correctly
- **embeddings.core.test.ts**: `prepareEmbeddingText` handles missing fields
- **embeddings.core.test.ts**: `prepareEmbeddingText` truncates very long text to max token limit

---

## FR-3.2: Embedding Generation Pipeline

### Tasks

1. **Create embedding text preparation** — `api/src/services/embeddings.core.ts`
   ```typescript
   export function prepareEmbeddingText(parts: {
     description?: string | null
     usage?: string | null
     content: string
   }): string
   // Concatenates non-empty parts with newline separators
   // Truncates to ~8000 chars (model token limit safety margin)
   ```

2. **Integrate into blueprint creation** — Update `api/src/services/blueprints.ts`
   - After creating a new version, call `generateEmbedding(prepareEmbeddingText(...))`
   - Store result in `blueprint_versions.embedding`
   - Wrap in try/catch: if embedding fails, log error and continue (don't block create/update)

3. **Create backfill endpoint/script** — `api/src/routes/embeddings.ts`
   - `POST /api/embeddings/backfill` — Admin-only endpoint
   - Finds all `blueprint_versions` where `embedding IS NULL`
   - Generates embeddings in batches

### Key Exports

| Module | Export | Signature |
|--------|--------|-----------|
| `api/src/services/embeddings.core.ts` | `prepareEmbeddingText` | `(parts) => string` |

---

## FR-3.3: Semantic Search API

### Tasks

1. **Create search service** — `api/src/services/search.ts`
   ```typescript
   export async function semanticSearch(db, query: string, filters?: {
     stack?: string
     layer?: string
     tag?: string
     projectId?: string
     limit?: number
     offset?: number
   }): Promise<{ items: SearchResult[], total: number }>
   ```
   Flow:
   - Generate embedding for query text
   - Query pgvector: `SELECT ... FROM blueprint_versions bv JOIN blueprints b ... ORDER BY bv.embedding <=> $queryVector`
   - Apply additional WHERE clauses for filters
   - Return results with similarity score (`1 - distance`)

2. **Create search route** — `api/src/routes/search.ts`
   - `GET /api/blueprints/search?q=<query>&stack=...&layer=...&tag=...&limit=20&offset=0`
   - If `q` is empty, return regular listing (fallback)
   - Returns `{ items: [...], total, query }`

3. **Add route to app** — `api/src/app.ts`

### Validation Schema

```typescript
export const searchBlueprintsSchema = z.object({
  q: z.string().min(1),
  stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
  layer: z.string().optional(),
  tag: z.string().optional(),
  projectId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
```

### Test Cases

- **search.core.test.ts**: Search query validation works
- **search.core.test.ts**: Empty query triggers fallback behavior

---

## FR-3.4: Combined Search

### Tasks

1. **Text search fallback** — In `api/src/services/search.ts`
   - If embedding generation fails for the query, fall back to ILIKE text search
   - Text search: `WHERE name ILIKE '%query%' OR description ILIKE '%query%'`

2. **Combined ranking** — When both semantic and text results available:
   - Primary: cosine similarity score
   - Boost: +0.1 if text matches in name, +0.05 if in description

---

## FR-3.5: Seed Script

### Tasks

1. **Create seed script** — `api/scripts/seed.ts`
   ```typescript
   // 1. Create system user (or find existing)
   // 2. Create default project "aquila-ap"
   // 3. Read all 85 .md files from webapp/src/assets/blueprints/
   // 4. Parse YAML frontmatter
   // 5. Infer stack from "project" field
   // 6. Create blueprints + versions
   // 7. Create tags from metadata
   // 8. Generate embeddings for all versions
   // 9. Idempotent: check if blueprint already exists by slug before creating
   ```

2. **Add seed script to `api/package.json`**
   ```json
   "db:seed": "tsx scripts/seed.ts"
   ```

3. **Add root convenience script**
   ```json
   "db:seed": "pnpm --filter api db:seed"
   ```

### Files

| Action | Path |
|--------|------|
| Create | `api/scripts/seed.ts` |
| Modify | `api/package.json` (add db:seed script) |
| Modify | `package.json` (root, add db:seed) |

---

## FR-3.6: Frontend Search UI

### Tasks

1. **Add search hook** — `webapp/src/hooks/useSearch.ts`
   ```typescript
   export function useSearch(query: string, filters?: { ... })
   // Calls GET /api/blueprints/search?q=...
   // Enabled only when query is non-empty
   ```

2. **Add search bar component** — `webapp/src/components/SearchBar.tsx`
   - Text input with submit button
   - Submits on Enter / button click
   - Clear button to reset search
   - Loading indicator during search

3. **Update index route** — `webapp/src/routes/index.tsx`
   - Add SearchBar above FilterBar
   - `q` search param synced to URL
   - When `q` is present, use `useSearch` instead of `useBlueprints`
   - Display similarity/relevance indicator on results

4. **Add i18n messages** — `webapp/messages/en.json`
   ```json
   "search_placeholder": "Search blueprints...",
   "search_button": "Search",
   "search_clear": "Clear search",
   "search_results_title": "Search results for \"{query}\"",
   "search_no_results": "No blueprints found for \"{query}\""
   ```

### Files

| Action | Path |
|--------|------|
| Create | `webapp/src/hooks/useSearch.ts` |
| Create | `webapp/src/components/SearchBar.tsx` |
| Modify | `webapp/src/routes/index.tsx` |
| Modify | `webapp/messages/en.json` |

---

## Implementation Order

1. **FR-3.1** — Embeddings service (install transformers.js, create service)
2. **FR-3.2** — Embedding pipeline (core text prep, integrate into blueprint create/update)
3. **FR-3.3** — Semantic search API
4. **FR-3.4** — Combined search (text fallback + ranking)
5. **FR-3.5** — Seed script
6. **FR-3.6** — Frontend search UI
7. Run `pnpm check && pnpm check-types && pnpm test` — verify all green

---

## Acceptance Criteria Checklist

- [ ] Search bar on browse page
- [ ] Natural language query returns semantically relevant results
- [ ] Results ranked by similarity
- [ ] Combines with existing filters (stack, layer, tags, project)
- [ ] Empty query falls back to regular listing
- [ ] Embedding generated on blueprint version create
- [ ] Embedding stored in `blueprint_versions.embedding`
- [ ] If embedding fails, blueprint still saved
- [ ] Seed script imports 85 blueprints from markdown files
- [ ] Seed creates default project, tags, system user
- [ ] Seed generates embeddings for all blueprints
- [ ] Seed is idempotent
- [ ] Search triggers on submit (not keystroke)
- [ ] Loading state during search
- [ ] All search UI strings use Paraglide i18n
- [ ] `pnpm check && pnpm check-types && pnpm test` all green
- [ ] 100% test coverage on `*.core.ts` files
