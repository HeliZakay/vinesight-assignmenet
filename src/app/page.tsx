"use client";

import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/posts";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<
    "all" | "flagged" | "dismissed" | "under_review"
  >("all");
  const [platform, setPlatform] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const platformOptions = useMemo(() => {
    const set = new Set(posts.map((p) => p.platform));
    return ["all", ...Array.from(set)];
  }, [posts]);

  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => setPosts(data));
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <main>
      <h1>Flagged Posts Review</h1>
      <div>
        <label>
          Filter by status:{" "}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="all">All</option>
            <option value="flagged">Flagged</option>
            <option value="under_review">Under review</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>
          Platform:{" "}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {platformOptions.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "All" : p}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ marginBottom: 4 }}>Tags:</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {tagOptions.map((tag) => (
            <label
              key={tag}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => toggleTag(tag)}
              />
              {tag}
            </label>
          ))}
        </div>
        <button onClick={() => setSelectedTags([])} style={{ marginTop: 8 }}>
          Clear
        </button>
      </div>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Platform</th>
            <th>Content</th>
            <th>Status</th>
            <th>Tags</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {posts
            .filter(
              (post) =>
                (status === "all" || post.status === status) &&
                (platform === "all" || post.platform === platform) &&
                (selectedTags.length === 0 ||
                  post.tags.some((t) => selectedTags.includes(t)))
            )
            .map((post) => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.platform}</td>
                <td>{post.text}</td>
                <td>
                  <select
                    value={post.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as Post["status"];
                      await fetch(`/api/posts/${post.id}/status`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus }),
                      });
                      // update UI immediately
                      setPosts((prev) =>
                        prev.map((p) =>
                          p.id === post.id ? { ...p, status: newStatus } : p
                        )
                      );
                    }}
                  >
                    <option value="flagged">flagged</option>
                    <option value="under_review">under review</option>
                    <option value="dismissed">dismissed</option>
                  </select>
                </td>
                <td>
                  <ul>
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        {tag}{" "}
                        <button
                          onClick={async () => {
                            await fetch(`/api/posts/${post.id}/tags`, {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ tag }),
                            });
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === post.id
                                  ? {
                                      ...p,
                                      tags: p.tags.filter((t) => t !== tag),
                                    }
                                  : p
                              )
                            );
                          }}
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    placeholder="new tag"
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const newTag = input.value.trim();
                        if (!newTag) return;
                        // clear the input right away
                        input.value = "";
                        await fetch(`/api/posts/${post.id}/tags`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ tag: newTag }),
                        });
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === post.id
                              ? { ...p, tags: [...p.tags, newTag] }
                              : p
                          )
                        );
                      }
                    }}
                  />
                </td>
                <td>{new Date(post.createdAt).toLocaleString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </main>
  );
}
