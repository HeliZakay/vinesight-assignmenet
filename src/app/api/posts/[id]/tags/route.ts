import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // Ensure JSON content
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported Media Type. Expected application/json" },
      { status: 415 }
    );
  }

  // Parse body safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  // Validate tag
  let tag = (body as any)?.tag;
  if (typeof tag !== "string") {
    return NextResponse.json(
      { error: "Field 'tag' is required and must be a string" },
      { status: 400 }
    );
  }
  tag = tag.trim().toLowerCase();
  if (tag.length === 0 || tag.length > 30) {
    return NextResponse.json(
      { error: "Tag must be 1-30 characters after trimming" },
      { status: 400 }
    );
  }
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
  // Ensure JSON content
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported Media Type. Expected application/json" },
      { status: 415 }
    );
  }

  // Parse body safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  // Validate tag
  let tag = (body as any)?.tag;
  if (typeof tag !== "string") {
    return NextResponse.json(
      { error: "Field 'tag' is required and must be a string" },
      { status: 400 }
    );
  }
  tag = tag.trim().toLowerCase();
  if (tag.length === 0 || tag.length > 30) {
    return NextResponse.json(
      { error: "Tag must be 1-30 characters after trimming" },
      { status: 400 }
    );
  }
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  post.tags = post.tags.filter((t) => t !== tag);

  return NextResponse.json(post);
}
