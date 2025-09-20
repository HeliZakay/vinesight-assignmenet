import { useEffect, useRef, useState, useCallback } from "react";

type HasId = { id: string | number };
export type PageResult<T> = { data: T[]; nextCursor: string | null };
export type FetchPage<T> = (
  cursor: string | null,
  limit: number
) => Promise<PageResult<T>>;

export function useCursorPager<T extends HasId>(
  fetchPage: FetchPage<T>,
  pageSize = 20
) {
  const [items, setItems] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reqSeqRef = useRef(0);
  const activeRef = useRef(true);
  useEffect(
    () => () => {
      activeRef.current = false;
    },
    []
  );

  const fetchFirst = useCallback(async () => {
    if (loading || loadingMore) return;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setItems([]);
    setNextCursor(null);

    const seq = ++reqSeqRef.current;
    try {
      const { data, nextCursor } = await fetchPage(null, pageSize);
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setItems(data ?? []);
      setNextCursor(nextCursor ?? null);
    } catch (e: any) {
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setError(e?.message || "Failed to fetch data");
      setItems([]);
      setNextCursor(null);
    } finally {
      if (activeRef.current && seq === reqSeqRef.current) setLoading(false);
    }
  }, [fetchPage, pageSize]);

  const fetchNext = useCallback(async () => {
    if (loading || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    setError(null);

    const seq = ++reqSeqRef.current;
    try {
      const { data, nextCursor: nc } = await fetchPage(nextCursor, pageSize);
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setItems((prev) => {
        const seen = new Set(prev.map((x) => String(x.id)));
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

  useEffect(() => {
    fetchFirst();
  }, [fetchFirst]);

  return {
    items,
    loading,
    loadingMore,
    hasMore: nextCursor !== null,
    error,
    refresh: fetchFirst,
    loadMore: fetchNext,
  } as const;
}
