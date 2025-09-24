import { useEffect, useRef, useState, useCallback } from "react";

// Items must expose a stable 'id'
type HasId = { id: string | number };

// Page result shape
export type PageResult<T> = { data: T[]; nextCursor: string | null };

// Fetch function signature
export type FetchPage<T> = (
  cursor: string | null,
  limit: number
) => Promise<PageResult<T>>;

// Cursor-based pagination hook
export function useCursorPager<T extends HasId>(
  fetchPage: FetchPage<T>, // async function to fetch a page of data
  pageSize = 20 // default number of items per page
) {
  // Core state
  const [items, setItems] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // first page load
  const [loadingMore, setLoadingMore] = useState(false); // subsequent loads
  const [error, setError] = useState<string | null>(null);

  // Sequence to discard stale responses
  const reqSeqRef = useRef(0);

  // Mounted flag
  const activeRef = useRef(true);
  useEffect(
    () => () => {
      // On unmount, mark as inactive so we stop updating state
      activeRef.current = false;
    },
    []
  );

  // First page fetch/reset
  const fetchFirst = useCallback(async () => {
    // Reset first-load completion flag so UI knows a new initial load started
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setItems([]);
    setNextCursor(null);

    const seq = ++reqSeqRef.current; // bump sequence number
    try {
      // Request first page (no cursor)
      const { data, nextCursor } = await fetchPage(null, pageSize);
      // Ignore response if component unmounted or if a newer request started
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      // Save results
      setItems(data ?? []);
      setNextCursor(nextCursor ?? null);
    } catch (e: unknown) {
      const err = e as { message?: string } | undefined;
      // Same guards: only handle error if still active + latest request
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setError(err?.message || "Failed to fetch data");
      setItems([]);
      setNextCursor(null);
    } finally {
      if (activeRef.current && seq === reqSeqRef.current) {
        setLoading(false); // Turn off loading if still relevant
      }
    }
  }, [fetchPage, pageSize]);

  // Fetch subsequent page
  const fetchNext = useCallback(async () => {
    // Guard: don’t fetch if already loading or no more pages
    if (loading || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    setError(null);

    const seq = ++reqSeqRef.current; // bump sequence number
    try {
      // Request next page using current cursor
      const { data, nextCursor: nc } = await fetchPage(nextCursor, pageSize);
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setItems((prev) => {
        // Build a set of seen ids
        const seen = new Set(prev.map((x) => String(x.id)));
        // Filter out duplicates before appending
        const additions = (data ?? []).filter((x) => !seen.has(String(x.id)));
        return prev.concat(additions);
      });
      setNextCursor(nc ?? null);
    } catch (e: unknown) {
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      const err = e as { message?: string } | undefined;
      setError(err?.message || "Failed to fetch more data");
    } finally {
      if (activeRef.current && seq === reqSeqRef.current) setLoadingMore(false);
    }
  }, [loading, loadingMore, nextCursor, fetchPage, pageSize]);

  // Kick off initial load
  useEffect(() => {
    fetchFirst();
  }, [fetchFirst]);

  // Public API
  return {
    items, // accumulated list of items
    loading, // true while first page is loading
    loadingMore, // true while additional pages are loading
    hasMore: nextCursor !== null, // whether more pages exist
    error, // error message if last fetch failed
    refresh: fetchFirst, // restart pagination from scratch
    loadMore: fetchNext, // load the next page
  } as const;
}
