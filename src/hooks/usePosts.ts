// File: hooks/usePosts.ts
import { useEffect, useState } from "react";
import type { Post } from "@/lib/posts";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/posts");
        const data = (await res.json()) as Post[];
        if (active) setPosts(data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { posts, setPosts, loading } as const;
}
