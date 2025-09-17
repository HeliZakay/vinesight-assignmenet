import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { tag } = await request.json();
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (!post.tags.includes(tag)) {
    post.tags.push(tag);
  }

  return NextResponse.json(post);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { tag } = await request.json();
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  post.tags = post.tags.filter((t) => t !== tag);

  return NextResponse.json(post);
}
