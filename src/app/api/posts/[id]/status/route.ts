import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { status } = await request.json();
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  post.status = status;
  return NextResponse.json(post);
}
