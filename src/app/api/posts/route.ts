import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

export async function GET() {
  return NextResponse.json(getPosts());
}
