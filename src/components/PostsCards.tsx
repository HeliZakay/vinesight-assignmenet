// Mobile-friendly card list for posts (renders on small screens).
import { VStack } from "@chakra-ui/react";
import { memo } from "react";
import type { Post } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export const PostsCards = memo(function PostsCards({
  posts,
}: {
  posts: Post[];
}) {
  return (
    <VStack align="stretch" gap={4}>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </VStack>
  );
});
