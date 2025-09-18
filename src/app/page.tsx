// File: app/page.tsx
"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/posts";
import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react";
import { FiltersBar } from "@/components/FiltersBar";
import { TagsFilterPopover } from "@/components/TagsFilterPopover";
import { PostsTable } from "@/components/PostsTable";
import { usePosts } from "@/hooks/usePosts";

export default function Home() {
  const { posts, loading } = usePosts();

  const [status, setStatus] = useState<string>("all");
  const [platform, setPlatform] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // options derived from current posts
  const statusOptions = useMemo(() => {
    const set = new Set(posts.map((p) => p.status));
    return ["all", ...Array.from(set)];
  }, [posts]);

  const platformOptions = useMemo(() => {
    const set = new Set(posts.map((p) => p.platform));
    return ["all", ...Array.from(set)];
  }, [posts]);

  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          (status === "all" || p.status === status) &&
          (platform === "all" || p.platform === platform) &&
          (selectedTags.length === 0 ||
            p.tags.some((t) => selectedTags.includes(t)))
      ),
    [posts, status, platform, selectedTags]
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

        <FiltersBar
          status={status}
          onStatusChange={setStatus}
          statusOptions={statusOptions}
          platform={platform}
          onPlatformChange={setPlatform}
          platformOptions={platformOptions}
        />

        <Box mt={2} mb={4} textAlign="center">
          <TagsFilterPopover
            tagOptions={tagOptions}
            selectedTags={selectedTags}
            onChangeSelected={setSelectedTags}
          />
        </Box>

        {loading ? (
          <Box textAlign="center" p={10}>
            <Text color="gray.600">Loading posts…</Text>
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
          <PostsTable posts={filteredPosts} statusOptions={statusOptions} />
        )}
      </Container>
    </Flex>
  );
}
