import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

export async function GET() {
  const posts = getPosts();
  const set = new Set<string>();
  for (const p of posts) {
    for (const t of p.tags ?? []) set.add(String(t).toLowerCase());
  }
  return NextResponse.json([...set].sort());
}
