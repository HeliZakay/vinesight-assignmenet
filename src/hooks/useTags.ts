import { useEffect, useState } from "react";

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data: string[]) => {
        if (active) setTags(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { tags, loading } as const;
}
