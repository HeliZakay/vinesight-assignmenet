import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/posts";

/**
 * Custom React hook for fetching posts with cursor-based pagination and filtering.
 * Supports platform, status, tags, and search filters.
 */
export function usePosts(
  platform: string,
  status: string,
  tags: string[],
  search: string,
  pageSize = 20
) {
  // State for post data and pagination
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Loading and error states
  const [loading, setLoading] = useState(false); // first page load
  const [loadingMore, setLoadingMore] = useState(false); // subsequent loads
  const [error, setError] = useState<string | null>(null);

  // Track the latest request to prevent race conditions
  const reqSeqRef = useRef(0);

  // Track component lifecycle (cancel updates after unmount)
  const activeRef = useRef(true);
  useEffect(() => {
    return () => {
      activeRef.current = false;
    };
  }, []);

  /**
   * Merge a new page of posts into the existing list, avoiding duplicates.
   */
  const mergePage = (prev: Post[], incoming: Post[]) => {
    if (prev.length === 0) return incoming;
    const seen = new Set(prev.map((p) => p.id));
    const additions = incoming.filter((p) => !seen.has(p.id));
    return prev.concat(additions);
  };

  /**
   * Build query parameters for the API request,
   * including filters, limit, and optional cursor.
   */
  const buildParams = (cursor?: string) => {
    const params = new URLSearchParams();
    if (platform && platform !== "all") params.append("platform", platform);
    if (status && status !== "all") params.append("status", status);
    if (Array.isArray(tags)) {
      for (const t of tags) {
        const v = t.trim();
        if (v) params.append("tag", v);
      }
    }
    const q = search?.trim();
    if (q) params.append("search", q);

    // Enforce a safe range for page size (1–100)
    params.set("limit", String(Math.min(Math.max(pageSize || 20, 1), 100)));

    if (cursor) params.set("cursor", cursor);
    return params;
  };

  /**
   * Fetch the first page of posts (resets state).
   */
  const fetchFirstPage = async () => {
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setNextCursor(null);
    setPosts([]);

    const seq = ++reqSeqRef.current; // identify this request as the latest

    try {
      const params = buildParams();
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok)
        throw new Error(
          `Failed to fetch posts: ${res.status} ${res.statusText}`
        );

      const json: { data: Post[]; nextCursor: string | null } =
        await res.json();

      // Only update state if this is the latest request and component is active
      if (!activeRef.current || seq !== reqSeqRef.current) return;

      setPosts(json.data || []);
      setNextCursor(json.nextCursor ?? null);
      setHasMore(!!json.nextCursor);
    } catch (e: any) {
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setError(e?.message || "Failed to fetch posts");
      setPosts([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      if (activeRef.current && seq === reqSeqRef.current) setLoading(false);
    }
  };

  /**
   * Fetch the next page of posts, if available.
   */
  const fetchNextPage = async () => {
    if (loading || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    setError(null);

    const seq = ++reqSeqRef.current;

    try {
      const params = buildParams(nextCursor);
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok)
        throw new Error(
          `Failed to fetch posts: ${res.status} ${res.statusText}`
        );

      const json: { data: Post[]; nextCursor: string | null } =
        await res.json();

      if (!activeRef.current || seq !== reqSeqRef.current) return;

      setPosts((prev) => mergePage(prev, json.data || []));
      setNextCursor(json.nextCursor ?? null);
      setHasMore(!!json.nextCursor);
    } catch (e: any) {
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setError(e?.message || "Failed to fetch more posts");
    } finally {
      if (activeRef.current && seq === reqSeqRef.current) setLoadingMore(false);
    }
  };

  /**
   * Refresh the current list by reloading the first page.
   */
  const refresh = async () => {
    await fetchFirstPage();
  };

  // Automatically refetch when filters change
  useEffect(() => {
    fetchFirstPage();
  }, [platform, status, JSON.stringify(tags), search, pageSize]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore: fetchNextPage,
    refresh,
  } as const;
}
