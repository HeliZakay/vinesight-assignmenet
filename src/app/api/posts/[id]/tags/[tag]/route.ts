import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

/**
 * DELETE /api/posts/:id/tags/:tag
 * Removes a tag from the specified post (case-insensitive match).
 * 204 No Content whether or not the tag existed (idempotent) and 404 if post not found.
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
