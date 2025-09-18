import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";
import { PostStatus } from "@/lib/statuses";

export async function PATCH(
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

  const status = (body as any)?.status;
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
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  post.status = normalized as PostStatus;
  return NextResponse.json(post);
}
