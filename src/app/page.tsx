"use client";

import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/posts";
import {
  Container,
  Heading,
  Box,
  HStack,
  NativeSelect,
  Text,
  chakra,
  Tag,
  Button,
  Popover,
  Checkbox,
  Input,
  Flex,
  Spinner,
} from "@chakra-ui/react";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [platform, setPlatform] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draftTags, setDraftTags] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  const statusOptions = useMemo(() => {
    const s = new Set(posts.map((p) => p.status));
    return ["all", ...Array.from(s)];
  }, [posts]);

  const filteredPosts = posts.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (platform === "all" || p.platform === platform) &&
      (selectedTags.length === 0 ||
        p.tags.some((t) => selectedTags.includes(t)))
  );

  return (
    <Flex justify="center" bg="gray.50" minH="100vh" align="flex-start">
      <Container
        maxW="container.lg"
        px={{ base: 4, md: 6 }}
        py={{ base: 6, md: 8 }}
        bgGradient="linear(to-r, blue.50, purple.50)"
        borderRadius="lg"
        boxShadow="md"
        mt={8}
      >
        <Heading size="2xl" mb={6} color="purple.700" textAlign="center">
          Flagged Posts Review
        </Heading>

        <HStack gap={4} marginBottom={4} alignItems="flex-end" justify="center">
          <Box>
            <Text mb={1} fontSize="sm" color="gray.600">
              Status
            </Text>
            <NativeSelect.Root size="sm" width="220px">
              <NativeSelect.Field
                pl={3}
                style={{ textIndent: "4px", cursor: "pointer" }}
                value={status}
                onChange={(e) => setStatus(e.currentTarget.value)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All" : s.replace(/_/g, " ")}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text mb={1} fontSize="sm" color="gray.600">
              Platform
            </Text>
            <NativeSelect.Root size="sm" width="220px">
              <NativeSelect.Field
                pl={3}
                style={{ textIndent: "4px", cursor: "pointer" }}
                value={platform}
                onChange={(e) => setPlatform(e.currentTarget.value)}
              >
                {platformOptions.map((p) => (
                  <option key={p} value={p}>
                    {p === "all" ? "All" : p}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
        </HStack>

        {/* Tags multi-select dropdown */}
        <Box mt={2} mb={4} textAlign="center">
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button
                variant="solid"
                colorScheme="purple"
                size="sm"
                px={4}
                py={2}
              >
                {selectedTags.length
                  ? `Tags (${selectedTags.length})`
                  : "Filter by tags"}
              </Button>
            </Popover.Trigger>

            <Popover.Positioner>
              <Popover.Content w="280px" p={4} boxShadow="lg" borderRadius="md">
                <Popover.Arrow />
                <Popover.Body>
                  <Text
                    mb={3}
                    fontSize="sm"
                    fontWeight="bold"
                    color="purple.600"
                  >
                    Tags
                  </Text>

                  <Box maxH="180px" overflowY="auto" mb={3}>
                    <Box display="flex" flexDirection="column" gap={2}>
                      {tagOptions.map((tag) => (
                        <Checkbox.Root
                          key={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={(e) => {
                            const checked = !!e.checked;
                            setSelectedTags((prev) =>
                              checked
                                ? [...prev, tag]
                                : prev.filter((t) => t !== tag)
                            );
                          }}
                          p={1}
                          borderRadius="md"
                          _hover={{ bg: "purple.50" }}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label px={2} py={1}>
                            {tag}
                          </Checkbox.Label>
                        </Checkbox.Root>
                      ))}
                    </Box>
                  </Box>

                  <HStack gap={2} justifyContent="space-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      px={3}
                      onClick={() => setSelectedTags([])}
                    >
                      Clear
                    </Button>
                    <Popover.CloseTrigger asChild>
                      <Button size="sm" colorScheme="purple" px={3}>
                        Done
                      </Button>
                    </Popover.CloseTrigger>
                  </HStack>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Popover.Root>
        </Box>

        {loading ? (
          <Box textAlign="center" p={10}>
            <Spinner size="lg" color="purple.500" />
            <Text mt={3} color="gray.600">
              Loading posts...
            </Text>
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Box
            textAlign="center"
            p={10}
            bg="white"
            borderRadius="md"
            boxShadow="sm"
          >
            <Text fontSize="lg" color="gray.600">
              No posts match the current filters.
            </Text>
          </Box>
        ) : (
          <Box
            overflowX="auto"
            borderWidth="1px"
            borderRadius="md"
            boxShadow="sm"
            bg="white"
          >
            <chakra.table w="full" borderCollapse="separate" borderSpacing="0">
              <chakra.thead bg="purple.50">
                <chakra.tr>
                  <chakra.th textAlign="left" p={3}>
                    ID
                  </chakra.th>
                  <chakra.th textAlign="left" p={3}>
                    Platform
                  </chakra.th>
                  <chakra.th textAlign="left" p={3}>
                    Text
                  </chakra.th>
                  <chakra.th textAlign="left" p={3}>
                    Status
                  </chakra.th>
                  <chakra.th textAlign="left" p={3}>
                    Tags
                  </chakra.th>
                  <chakra.th textAlign="left" p={3}>
                    Created
                  </chakra.th>
                </chakra.tr>
              </chakra.thead>

              <chakra.tbody>
                {filteredPosts.map((post) => {
                  const draft = draftTags[post.id] ?? "";
                  const canAdd =
                    draft.trim().length > 0 &&
                    !post.tags.includes(draft.trim());

                  return (
                    <chakra.tr key={post.id} _hover={{ bg: "gray.50" }}>
                      <chakra.td p={3}>{post.id}</chakra.td>
                      <chakra.td p={3}>{post.platform}</chakra.td>
                      <chakra.td p={3}>{post.text}</chakra.td>

                      <chakra.td p={3}>
                        <NativeSelect.Root size="sm" width="200px">
                          <NativeSelect.Field
                            pl={3}
                            style={{ textIndent: "4px", cursor: "pointer" }}
                            value={post.status}
                            onChange={async (e) => {
                              const newStatus = e.currentTarget.value;
                              await fetch(`/api/posts/${post.id}/status`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ status: newStatus }),
                              });
                              setPosts((prev) =>
                                prev.map((p) =>
                                  p.id === post.id
                                    ? { ...p, status: newStatus }
                                    : p
                                )
                              );
                            }}
                          >
                            {statusOptions
                              .filter((s) => s !== "all")
                              .map((s) => (
                                <option key={s} value={s}>
                                  {s.replace(/_/g, " ")}
                                </option>
                              ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </chakra.td>

                      <chakra.td p={3}>
                        <HStack gap={2} flexWrap="wrap" mb={2}>
                          {post.tags.map((tag) => (
                            <Tag.Root
                              key={tag}
                              size="sm"
                              variant="subtle"
                              colorScheme="purple"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              <Tag.Label>{tag}</Tag.Label>
                              <Tag.EndElement>
                                <Tag.CloseTrigger
                                  aria-label={`Remove ${tag}`}
                                  style={{ cursor: "pointer" }}
                                  onClick={async () => {
                                    await fetch(`/api/posts/${post.id}/tags`, {
                                      method: "DELETE",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({ tag }),
                                    });
                                    setPosts((prev) =>
                                      prev.map((p) =>
                                        p.id === post.id
                                          ? {
                                              ...p,
                                              tags: p.tags.filter(
                                                (t) => t !== tag
                                              ),
                                            }
                                          : p
                                      )
                                    );
                                  }}
                                />
                              </Tag.EndElement>
                            </Tag.Root>
                          ))}
                        </HStack>

                        {/* Add-tag input */}
                        <HStack gap={2}>
                          <Input
                            size="sm"
                            width="220px"
                            placeholder="Add tag"
                            px={3}
                            value={draft}
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              setDraftTags((prev) => ({
                                ...prev,
                                [post.id]: value,
                              }));
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter" && canAdd) {
                                e.preventDefault();
                                const tag = draft.trim();
                                await fetch(`/api/posts/${post.id}/tags`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ tag }),
                                });
                                setPosts((prev) =>
                                  prev.map((p) =>
                                    p.id === post.id
                                      ? { ...p, tags: [...p.tags, tag] }
                                      : p
                                  )
                                );
                                setDraftTags((prev) => ({
                                  ...prev,
                                  [post.id]: "",
                                }));
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            colorScheme="purple"
                            onClick={async () => {
                              if (!canAdd) return;
                              const tag = draft.trim();
                              await fetch(`/api/posts/${post.id}/tags`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ tag }),
                              });
                              setPosts((prev) =>
                                prev.map((p) =>
                                  p.id === post.id
                                    ? { ...p, tags: [...p.tags, tag] }
                                    : p
                                )
                              );
                              setDraftTags((prev) => ({
                                ...prev,
                                [post.id]: "",
                              }));
                            }}
                            disabled={!canAdd}
                          >
                            Add
                          </Button>
                        </HStack>
                      </chakra.td>

                      <chakra.td p={3}>
                        {new Date(post.createdAt).toLocaleString()}
                      </chakra.td>
                    </chakra.tr>
                  );
                })}
              </chakra.tbody>
            </chakra.table>
          </Box>
        )}
      </Container>
    </Flex>
  );
}
