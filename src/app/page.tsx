// File: app/page.tsx
"use client";

import { useState } from "react";
import { Box, Container, Flex, Heading, Text, Input } from "@chakra-ui/react";
import { FiltersBar } from "@/components/FiltersBar";
import { TagsFilterPopover } from "@/components/TagsFilterPopover";
import { PostsTable } from "@/components/PostsTable";
import { usePosts } from "@/hooks/usePosts";
import { FiltersContext } from "@/context/FiltersContext";

export default function Home() {
  const [status, setStatus] = useState<string>("all");
  const [platform, setPlatform] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const { posts, loading } = usePosts(platform, status, selectedTags, search);

  return (
    <FiltersContext.Provider
      value={{
        status,
        setStatus,
        platform,
        setPlatform,
        selectedTags,
        setSelectedTags,
        search,
        setSearch,
      }}
    >
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

          <FiltersBar />
          <Box mt={4} mb={4} textAlign="center">
            <Input
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxW="400px"
              p={3}
            />
          </Box>

          <Box mt={2} mb={4} textAlign="center">
            <TagsFilterPopover />
          </Box>

          {loading ? (
            <Box textAlign="center" p={10}>
              <Text color="gray.600">Loading posts…</Text>
            </Box>
          ) : posts.length === 0 ? (
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
            <PostsTable posts={posts} />
          )}
        </Container>
      </Flex>
    </FiltersContext.Provider>
  );
}
