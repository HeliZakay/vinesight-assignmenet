import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";
import { PostStatus } from "@/lib/statuses"; // (kept if future validation needed)

/**
 * DELETE /api/posts/:id/tags/:tag
 * Removes a tag from the specified post.
 * Path params:
 *  - id: post identifier
 *  - tag: tag (case-insensitive) to remove
 *
 * Response:
 * 204 No Content on success (tag removed or tag absent) OR
 * 404 if post not found
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; tag: string }> }
) {
  const { id, tag } = await context.params;
  const normalizedTag = tag?.toLowerCase();

  if (!normalizedTag) {
    return NextResponse.json({ error: "Tag required" }, { status: 400 });
  }

  const posts = getPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Filter out (case-insensitive) match
  post.tags = post.tags.filter((t) => t.toLowerCase() !== normalizedTag);

  return new NextResponse(null, { status: 204 });
}
