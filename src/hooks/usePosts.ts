import { useEffect, useState } from "react";
import type { Post } from "@/lib/posts";

export function usePosts(
  platform: string,
  status: string,
  tags: string[],
  search: string
) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true; // prevent setState after unmount

    const params = new URLSearchParams();
    if (platform !== "all") params.append("platform", platform);
    if (status !== "all") params.append("status", status);
    if (Array.isArray(tags)) {
      tags.forEach((t) => {
        const v = t.trim();
        if (v.length > 0) params.append("tag", v);
      });
    }

    const q = search?.trim();
    if (q) params.append("search", q);

    const qs = params.toString();
    setLoading(true);

    fetch(`/api/posts${qs ? `?${qs}` : ""}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch posts: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (active) setPosts(data);
      })
      .catch(() => {
        if (active) setPosts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [platform, status, tags, search]);

  return { posts, loading } as const;
}
