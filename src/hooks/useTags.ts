import { useEffect, useState } from "react";

/**
 * Custom React hook to fetch and return a list of tags from the backend.
 */
export function useTags() {
  // State to hold the list of tags
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // "active" flag prevents setting state if the component unmounts
    let active = true;

    // Start loading before making the request
    setLoading(true);

    // Fetch tags from the API endpoint
    fetch("/api/tags")
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`Failed to load tags: ${r.status}`);
        }
        return r.json();
      })
      .then((data: string[]) => {
        if (active) {
          setTags(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        const err = e as { message?: string } | undefined;
        if (active) setError(err?.message || "Failed to load tags");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Cleanup function sets active = false if component unmounts
    return () => {
      active = false;
    };
  }, []); // Empty dependency array → runs only on mount

  // Expose tags and loading state
  return { tags, loading, error } as const;
}
