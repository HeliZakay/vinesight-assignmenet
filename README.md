## Flagged Posts Review Tool

Simple full‑stack tool for analysts to review, filter, and annotate flagged social posts.

Implements the assignment requirements: list flagged posts, filter (status / platform / tag / search), update status, add/remove tags, with a TypeScript Next.js backend loading from a static JSON dataset (no persistence).

---

## Tech Stack

Frontend: React (Next.js App Router), TypeScript, Chakra UI (component primitives)
Backend: Next.js API routes (Node.js / TypeScript)
Data Source: `data/mock-posts.json` (in‑memory only)

---

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Then open http://localhost:3000

No environment variables are required.

---

## Data Model

Post: { id: string, platform, text, status, tags: string[], createdAt: ISO string }
Platforms normalized to: twitter | facebook | instagram | tiktok | reddit | other
Statuses normalized to: flagged | under_review | dismissed

All mutation changes are ephemeral (lost on restart).

---

## API Endpoints

Base path in development: http://localhost:3000/api

### GET /api/posts

Query Parameters:

- platform=twitter|facebook|instagram|tiktok|reddit|other|all (optional)
- status=flagged|under_review|dismissed|all (optional)
- tag=tagValue (repeatable, OR logic across provided tags)
- search=substring (case‑insensitive match against text)
- cursor=lastId (for pagination)
- limit=1..100 (default 20)

Response:

```json
{
	"data": [ {"id":"1", "platform":"twitter", ...} ],
	"nextCursor": "5" | null
}
```

Ordering: createdAt desc, then id asc (deterministic). Cursor = id of last item in previous page.

### PATCH /api/posts/:id/status

Body: { "status": "flagged" | "under_review" | "dismissed" }
Response: 200 JSON (updated post) | 400/404/415 errors

### POST /api/posts/:id/tags

Body: { "tag": "some_tag" } (1–30 chars, stored lowercase)
Response: 200 JSON (updated post)

### DELETE /api/posts/:id/tags/:tag

Removes tag (case‑insensitive match). Returns 204 No Content if post exists (even if tag absent). 404 if post not found.

### GET /api/tags

Returns sorted unique list of all tags (lowercase).

---

## Frontend Behavior

- Filters (status / platform / tags / search) wired through a context provider.
- Posts fetched with cursor pagination; UI exposes a Load More control (internally just keeps next page state). Empty state suppressed until first load completes to prevent flicker.
- Inline status select & tag add/remove with toast feedback (success & error). Duplicate tag adds prevented client-side.

---

## Key Implementation Details

Pagination Hook: `useCursorPager` handles first-page vs additional-page loading, stale request protection, and exposes `hasLoaded` to avoid early empty state rendering.
Filtering & Ordering: All filters applied before pagination; stable deterministic ordering ensures paginated consistency.
Validation: Mutation routes validate content type, JSON body shape, allowed status values, tag length.
Normalization: Data normalized once on startup (`lib/posts.ts`).

---

## Assumptions & Trade‑offs

- No persistence: In-memory mutations considered acceptable per assignment.
- Cursor uses last item id (sufficient for static dataset); if dataset mutability or non-monotonic ordering were introduced, an opaque composite cursor (timestamp+id) would be preferred.
- Search limited to post text; does not search tags/platform (simpler + matches minimal requirement).
- Tag filter logic is OR (if any tag matches, post included). Could be extended to AND with UI toggle.
- Optimistic-ish row updates: row state updated after 200 response; list not globally refetched (avoids redundant calls on every mutation).

---

## Error Handling

- Fetch posts: fails with toast (generic user-friendly message; technical reason kept internal).
- Mutations: toast on failure; network errors caught.
- Tag fetching currently ignores errors (future improvement: surface error state in UI).

---

## Future Improvements (If This Were Production)

- Persist changes (database layer + repository abstraction).
- Opaque cursor encoding (base64 of createdAt|id) for mutation-safe pagination.
- AbortController in pagination & tags fetching.
- Unit tests: filter logic, pagination edges, status/tag mutation handlers.
- Input sanitation / stricter schema validation (zod or valibot).
- Accessibility enhancements (aria-live for toasts, focus management in popover).
- Tag caching & incremental invalidation on mutations.

---

## Manual Verification Checklist

1. Load page: initial spinner, then posts render.
2. Change status filter (e.g., under_review): list updates.
3. Add tag filter: only posts containing tag appear.
4. Search substring: narrows results (case-insensitive).
5. Update a post status: toast success; row reflects new status.
6. Add a tag: tag appears; adding again shows error toast.
7. Remove tag via close icon: tag disappears; toast success.
8. Use Load More until hasMore false (button disabled).
9. DELETE endpoint test: curl -I returns 204 when removing existing tag.

---

## Running a Production Build (Optional)

```bash
npm run build
npm start
```

---

## Author

Assignment implementation by Heli Zakay.
