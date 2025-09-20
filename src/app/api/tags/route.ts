import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

/**
 * GET /api/tags
 * Returns a unique, sorted list of all tags across posts.
 */
export async function GET() {
  // Load all posts
  const posts = getPosts();

  // Use a Set to collect unique tags
  const set = new Set<string>();

  // Loop through each post and add its tags
  for (const p of posts) {
    for (const t of p.tags ?? []) set.add(String(t).toLowerCase());
  }

  // Convert set → array, sort alphabetically, and return as JSON
  return NextResponse.json([...set].sort());
}
