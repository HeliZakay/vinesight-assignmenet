## Flagged Posts Review Tool

Simple full‑stack tool for analysts to review, filter, and annotate flagged social posts.

---

## Highlights

- Full assignment coverage: list + filter (status / platform / tags / search) + status updates + tag add/remove
- Deterministic server filtering + cursor pagination (createdAt desc, id asc) with race-safe hook & flicker-free first load
- Optimistic in-row status/tag mutations with accessible toasts (aria-live) and duplicate-tag guard
- Defensive API validation (content-type, schema shape, allowed status values, tag length & casing)
- Pragmatic trade-offs: in-memory dataset, simple last-id cursor, focused smoke tests over exhaustive suite (all documented)
- Automated smoke script (`npm run smoke`) exercises filters, pagination, status update, tag add/remove for fast reviewer confidence
- Clear extensibility path: opaque cursor, persistence layer, AND tag logic option, abortable fetches

---

## Tech Stack

Frontend: React (Next.js App Router), TypeScript, Chakra UI (component primitives)
Backend: Next.js API routes (Node.js / TypeScript)
Data Source: `data/mock-posts.json` (in‑memory only)

---

## Getting Started

Requires Node 18+ (tested on Node 20.x).

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Then open http://localhost:3000

No environment variables are required.

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

State & Filters:

- Central `FiltersContext` holds status, platform, search text, and selected tags (OR logic). Any change triggers a fresh first-page fetch.

Pagination UX:

- Cursor-based incremental loading via a single Load More button. Previously loaded pages persist while the next page loads (no jarring resets). A `hasLoaded` flag suppresses premature empty UI.

Mutations:

- Row-level status dropdown and tag add/remove actions update optimistically on success; accessible toasts surface success/errors; duplicate tag submissions short‑circuit locally.

Resilience & A11y:

- Race-safe pagination prevents stale overwrites. Toasts use `aria-live` for assistive tech. Error states shown for tag loading.

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
- Tag fetching: loading / error / empty states surfaced in tag popover.

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

## Optional Smoke Tests

A lightweight script validates core API flows (listing, filtering, pagination, status + tag mutations).

Run while dev server is active:

```bash
# Terminal 1
npm run dev

# Terminal 2 (after server starts)
npm run smoke
```

Expected output: PASS lines for each check and "All smoke tests passed." on success. Non‑zero exit code indicates a failure.

---

## Author

Assignment implementation by Heli Zakay.
