import { useEffect, useRef, useState, useCallback } from "react";

// Require each item to have a stable identifier (string or number)
type HasId = { id: string | number };

// A page of results: data + pointer to the next page (or null if no more)
export type PageResult<T> = { data: T[]; nextCursor: string | null };

// Function type for fetching a page of data given a cursor + limit
export type FetchPage<T> = (
  cursor: string | null,
  limit: number
) => Promise<PageResult<T>>;

// Custom React hook for cursor-based pagination
export function useCursorPager<T extends HasId>(
  fetchPage: FetchPage<T>, // async function to fetch a page of data
  pageSize = 20 // default number of items per page
) {
  // State for the accumulated items, cursor, loading flags, and errors
  const [items, setItems] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // first page load
  const [loadingMore, setLoadingMore] = useState(false); // subsequent loads
  const [error, setError] = useState<string | null>(null);

  // Request sequence number (helps discard stale responses)
  const reqSeqRef = useRef(0);

  // Tracks whether the component using this hook is still mounted
  const activeRef = useRef(true);
  useEffect(
    () => () => {
      // On unmount, mark as inactive so we stop updating state
      activeRef.current = false;
    },
    []
  );

  // Fetch the first page (reset everything and start fresh)
  const fetchFirst = useCallback(async () => {
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
    } catch (e: any) {
      // Same guards: only handle error if still active + latest request
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setError(e?.message || "Failed to fetch data");
      setItems([]);
      setNextCursor(null);
    } finally {
      // Turn off loading if still relevant
      if (activeRef.current && seq === reqSeqRef.current) setLoading(false);
    }
  }, [fetchPage, pageSize]);

  // Fetch the next page (append results without duplicates)
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
    } catch (e: any) {
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setError(e?.message || "Failed to fetch more data");
    } finally {
      if (activeRef.current && seq === reqSeqRef.current) setLoadingMore(false);
    }
  }, [loading, loadingMore, nextCursor, fetchPage, pageSize]);

  // Automatically fetch the first page when the hook is initialized
  useEffect(() => {
    fetchFirst();
  }, [fetchFirst]);

  // Expose state and actions to the component using this hook
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
