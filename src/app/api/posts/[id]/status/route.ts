import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";
import { PostStatus } from "@/lib/statuses";

/**
 * PATCH /api/posts/[id]/status
 * Updates the status of a post identified by ID.
 */
export async function PATCH(
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

  // Extract `status` field from body
  const status = (body as { status?: unknown })?.status;
  if (typeof status !== "string") {
    return NextResponse.json(
      { error: "Field 'status' is required and must be a string" },
      { status: 400 }
    );
  }

  // Normalize and validate status value
  const normalized = status.toLowerCase();
  const allowed = new Set<string>(Object.values(PostStatus));
  if (!allowed.has(normalized)) {
    return NextResponse.json(
      {
        error: `Invalid status '${status}'. Allowed: ${[...allowed].join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  // Find the post by ID
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);

  // Return 404 if post not found
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Update status and return updated post
  post.status = normalized as PostStatus;
  return NextResponse.json(post);
}
