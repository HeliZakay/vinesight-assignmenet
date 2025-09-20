import { useEffect, useState } from "react";

/**
 * Custom React hook to fetch and return a list of tags from the backend.
 */
export function useTags() {
  // State to hold the list of tags
  const [tags, setTags] = useState<string[]>([]);
  // State to track loading status
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // "active" flag prevents setting state if the component unmounts
    let active = true;

    // Start loading before making the request
    setLoading(true);

    // Fetch tags from the API endpoint
    fetch("/api/tags")
      .then((r) => r.json()) // Parse JSON response
      .then((data: string[]) => {
        if (active) setTags(data); // Update state only if still mounted
      })
      .finally(() => {
        if (active) setLoading(false); // Stop loading when done
      });

    // Cleanup function sets active = false if component unmounts
    return () => {
      active = false;
    };
  }, []); // Empty dependency array → runs only on mount

  // Expose tags and loading state
  return { tags, loading } as const;
}
