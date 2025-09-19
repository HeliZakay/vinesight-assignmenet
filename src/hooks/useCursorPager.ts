import { useEffect, useRef, useState } from "react";

export type PageResult<T> = { data: T[]; nextCursor: string | null };
export type FetchPage<T> = (
  cursor: string | null,
  limit: number
) => Promise<PageResult<T>>;

export function useCursorPager<T>(fetchPage: FetchPage<T>, pageSize = 20) {
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

  const fetchFirst = async () => {
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
  };

  const fetchNext = async () => {
    if (loading || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    setError(null);

    const seq = ++reqSeqRef.current;
    try {
      const { data, nextCursor: nc } = await fetchPage(nextCursor, pageSize);
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setItems((prev) => {
        const seen = new Set(
          (prev as any[]).map((x) => (x as any).id ?? JSON.stringify(x))
        );
        const additions = (data ?? []).filter(
          (x: any) => !seen.has(x.id ?? JSON.stringify(x))
        );
        return prev.concat(additions);
      });
      setNextCursor(nc ?? null);
    } catch (e: any) {
      if (!activeRef.current || seq !== reqSeqRef.current) return;
      setError(e?.message || "Failed to fetch more data");
    } finally {
      if (activeRef.current && seq === reqSeqRef.current) setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPage, pageSize]); // parent should memoize fetchPage

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
