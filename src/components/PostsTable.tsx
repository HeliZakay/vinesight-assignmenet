// Renders the posts collection as a simple accessible table.
// Delegates row-level editing & mutation logic to PostRow.
import { Box, chakra } from "@chakra-ui/react";
import type { Post } from "@/lib/posts";
import { PostRow } from "@/components/PostRow";

export function PostsTable({ posts }: { posts: Post[] }) {
  return (
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
            <chakra.th
              textAlign="left"
              p={3}
              display={{ base: "none", md: "table-cell" }}
            >
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
            <chakra.th
              textAlign="left"
              p={3}
              display={{ base: "none", md: "table-cell" }}
            >
              Created
            </chakra.th>
          </chakra.tr>
        </chakra.thead>

        <chakra.tbody>
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </chakra.tbody>
      </chakra.table>
    </Box>
  );
}
