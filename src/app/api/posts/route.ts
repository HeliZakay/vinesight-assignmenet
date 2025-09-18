// File: app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

/**
 * GET /api/posts
 * Optional query params:
 * - platform: string | "all"
 * - status: string | "all"
 * - tag: string (repeatable, OR logic)
 * - search: string (case-insensitive substring on post.text)
 *
 * Example:
 * /api/posts?platform=twitter&status=pending&tag=spam&tag=abuse&search=refund
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platformRaw = searchParams.get("platform");
  const statusRaw = searchParams.get("status");
  const tagsRaw = searchParams.getAll("tag");
  const searchRaw = searchParams.get("search");

  // normalize: treat missing/"all" as no filter
  const platform = platformRaw?.trim().toLowerCase();
  const status = statusRaw?.trim().toLowerCase();
  const tags = tagsRaw
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
  const tagSet = new Set(tags);
  const search = searchRaw?.toLowerCase().trim();

  const posts = getPosts();

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

  return NextResponse.json(filtered);
}
