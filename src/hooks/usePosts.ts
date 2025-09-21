import { useMemo } from "react";
import type { Post } from "@/lib/posts";
import { useCursorPager } from "./useCursorPager";

/**
 * Custom React hook to fetch posts from the backend with cursor-based pagination
 * and filtering (platform, status, tags, search).
 */
export function usePosts(
  platform: string,
  status: string,
  tags: string[],
  search: string,
  pageSize = 20
) {
  // Build a memoized function that fetches a single page of posts
  // The function is re-created only if filters or page size change
  const fetchPage = useMemo(() => {
    return async (cursor: string | null) => {
      const params = new URLSearchParams();

      // Add platform filter if not "all"
      if (platform && platform !== "all") params.append("platform", platform);

      // Add status filter if not "all"
      if (status && status !== "all") params.append("status", status);

      // Add tags filter(s) (each non-empty trimmed tag)
      for (const t of tags || []) {
        const v = t?.trim();
        if (v) params.append("tag", v);
      }

      // Add search filter if provided
      const q = search?.trim();
      if (q) params.append("search", q);

      // Ensure page size is within [1, 100]
      params.set("limit", String(Math.min(Math.max(pageSize || 20, 1), 100)));

      // Add cursor param if provided (for pagination)
      if (cursor) params.set("cursor", cursor);

      // Perform API request to fetch posts
      const res = await fetch(`/api/posts?${params.toString()}`);

      // Throw error if request failed
      if (!res.ok) {
        throw new Error(
          `Failed to fetch posts: ${res.status} ${res.statusText}`
        );
      }

      // Parse and return JSON response (posts and nextCursor)
      const json: { data: Post[]; nextCursor: string | null } =
        await res.json();
      return json;
    };
    // Dependencies: changing any filter or pageSize regenerates the fetcher
  }, [platform, status, tags, search, pageSize]);

  // Initialize cursor pager hook with the fetch function and page size
  const pager = useCursorPager<Post>(fetchPage, pageSize);

  // Expose pager state and actions in a structured return value
  return {
    posts: pager.items, // List of posts fetched so far
    loading: pager.loading, // True while first page is loading
    loadingMore: pager.loadingMore, // True while additional pages load
    hasMore: pager.hasMore, // Indicates if more posts are available
    error: pager.error, // Error message if request failed
    loadMore: pager.loadMore, // Function to fetch next page
    refresh: pager.refresh, // Function to reload data from start
    hasLoaded: pager.hasLoaded, // First load finished (success or error)
  } as const;
}
