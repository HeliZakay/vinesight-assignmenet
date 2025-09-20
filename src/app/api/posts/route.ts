import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

/**
 * GET /api/posts
 *
 * Query Parameters:
 * - platform: string | "all" — filter by platform
 * - status: string | "all" — filter by status
 * - tag: string (repeatable) — filter by tags (OR logic across tags)
 * - search: string — case-insensitive substring search on post.text
 * - cursor: string — ID of the last item from the previous page (for pagination)
 * - limit: number — number of items per page (default: 20, min: 1, max: 100)
 *
 * Response:
 * {
 *   data: Post[],        // current page of posts
 *   nextCursor: string | null // ID to use as cursor for the next page
 * }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Pagination inputs
  const cursor = searchParams.get("cursor"); // bookmark ID from previous page
  const rawLimit = parseInt(searchParams.get("limit") || "20", 10);
  const limit = Math.min(Math.max(rawLimit || 20, 1), 100); // enforce 1–100

  // Filtering inputs
  const platformRaw = searchParams.get("platform");
  const statusRaw = searchParams.get("status");
  const tagsRaw = searchParams.getAll("tag");
  const searchRaw = searchParams.get("search");

  // Normalize filter values
  const platform = platformRaw?.trim().toLowerCase();
  const status = statusRaw?.trim().toLowerCase();
  const tags = tagsRaw.map((t) => t.trim().toLowerCase()).filter(Boolean);
  const tagSet = new Set(tags);
  const search = searchRaw?.toLowerCase().trim();

  // Load posts
  const posts = getPosts();

  // Apply filters
  const filtered = posts.filter((p) => {
    const okPlatform =
      !platform || platform === "all" || p.platform.toLowerCase() === platform;
    const okStatus =
      !status || status === "all" || p.status.toLowerCase() === status;
    const okTags =
      tagSet.size === 0 || p.tags.some((t) => tagSet.has(t.toLowerCase()));
    const okSearch =
      !search ||
      (typeof p.text === "string" && p.text.toLowerCase().includes(search));

    return okPlatform && okStatus && okTags && okSearch;
  });

  filtered.sort((a, b) => {
    const bt = new Date(b.createdAt).getTime(); // or b.createdAt
    const at = new Date(a.createdAt).getTime();
    if (bt !== at) return bt - at; // newest → oldest
    return String(a.id).localeCompare(String(b.id)); // deterministic tie-breaker
  });

  // Determine starting index based on cursor
  let startIndex = 0;
  if (cursor) {
    const idx = filtered.findIndex((p) => p.id === cursor);
    if (idx >= 0) startIndex = idx + 1; // start after the cursor
  }

  // Cursor strategy: we expose the id of the last item of the current page.
  // On the next request the server finds that id and starts from the next index.
  // This remains stable because ordering is deterministic (createdAt desc, id asc).

  // Take only the requested number of items
  const page = filtered.slice(startIndex, startIndex + limit);

  // Only expose a nextCursor if there are more items after this slice
  const nextCursor =
    startIndex + limit < filtered.length && page.length > 0
      ? page[page.length - 1].id
      : null;

  // Return page data and bookmark for next request
  return NextResponse.json({ data: page, nextCursor });
}
