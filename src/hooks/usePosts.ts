import { useMemo } from "react";
import type { Post } from "@/lib/posts";
import { useCursorPager } from "./useCursorPager";

export function usePosts(
  platform: string,
  status: string,
  tags: string[],
  search: string,
  pageSize = 20
) {
  // Build a memoized page fetcher so the pager can depend on it
  const fetchPage = useMemo(() => {
    return async (cursor: string | null, limit: number) => {
      const params = new URLSearchParams();
      if (platform && platform !== "all") params.append("platform", platform);
      if (status && status !== "all") params.append("status", status);
      for (const t of tags || []) {
        const v = t?.trim();
        if (v) params.append("tag", v);
      }
      const q = search?.trim();
      if (q) params.append("search", q);
      params.set("limit", String(Math.min(Math.max(pageSize || 20, 1), 100)));
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch posts: ${res.status} ${res.statusText}`
        );
      }
      const json: { data: Post[]; nextCursor: string | null } =
        await res.json();
      return json;
    };
    // Changing any filter regenerates fetcher → pager resets
  }, [platform, status, JSON.stringify(tags), search, pageSize]);

  const pager = useCursorPager<Post>(fetchPage, pageSize);

  return {
    posts: pager.items,
    loading: pager.loading,
    loadingMore: pager.loadingMore,
    hasMore: pager.hasMore,
    error: pager.error,
    loadMore: pager.loadMore,
    refresh: pager.refresh,
  } as const;
}
