// File: app/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Input,
  Button,
} from "@chakra-ui/react";
import { FiltersBar } from "@/components/FiltersBar";
import { TagsFilterPopover } from "@/components/TagsFilterPopover";
import { PostsTable } from "@/components/PostsTable";
import { usePosts } from "@/hooks/usePosts";
import { FiltersContext } from "@/context/FiltersContext";

const POSTS_PER_PAGE = 10; // Number of posts to display per page

export default function Home() {
  const [status, setStatus] = useState<string>("all");
  const [platform, setPlatform] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Cursor-paginated data + controls
  const {
    posts,
    loading, // initial page load
    loadingMore, // subsequent pages
    hasMore, // whether "Load more" should be enabled
    error,
    loadMore, // fetch next page
  } = usePosts(platform, status, selectedTags, search, POSTS_PER_PAGE);

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

          {/* Error state */}
          {error && (
            <Box
              textAlign="center"
              p={4}
              mb={4}
              bg="red.50"
              borderRadius="md"
              border="1px solid"
              borderColor="red.100"
            >
              <Text color="red.600" fontWeight="medium">
                {error}
              </Text>
            </Box>
          )}

          {/* Loading / empty / table */}
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
            <>
              <PostsTable posts={posts} />

              {/* Load More control for cursor pagination */}
              <Box textAlign="center" mt={6}>
                <Button
                  onClick={loadMore}
                  loading={loadingMore}
                  disabled={!hasMore || loadingMore}
                  variant="outline"
                  size="md"
                  px={6}
                >
                  {hasMore ? "Load more" : "No more posts"}
                </Button>
              </Box>
            </>
          )}
        </Container>
      </Flex>
    </FiltersContext.Provider>
  );
}
