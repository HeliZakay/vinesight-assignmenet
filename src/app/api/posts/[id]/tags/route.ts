import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

/**
 * POST /api/posts/[id]/tags
 * Adds a new tag to the specified post.

 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Extract post ID from route params
  const { id } = await context.params;

  // Ensure the request has JSON content
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported Media Type. Expected application/json" },
      { status: 415 }
    );
  }

  // Parse the request body safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  // Validate `tag` field
  const tag = (body as { tag?: unknown })?.tag;
  if (typeof tag !== "string") {
    return NextResponse.json(
      { error: "Field 'tag' is required and must be a string" },
      { status: 400 }
    );
  }
  const normalizedTag = tag.trim().toLowerCase();
  if (normalizedTag.length === 0 || normalizedTag.length > 30) {
    return NextResponse.json(
      { error: "Tag must be 1-30 characters after trimming" },
      { status: 400 }
    );
  }

  // Find the post by ID
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Add tag only if it doesn’t already exist
  if (!post.tags.includes(normalizedTag)) {
    post.tags.push(normalizedTag);
  }

  // Return updated post
  return NextResponse.json(post);
}
