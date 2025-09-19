import { Box, Button } from "@chakra-ui/react";

type Props = {
  hasMore: boolean;
  loadingMore: boolean;
  onClick: () => void;
};

export function LoadMoreButton({ hasMore, loadingMore, onClick }: Props) {
  return (
    <Box textAlign="center" mt={6}>
      <Button
        onClick={onClick}
        loading={loadingMore}
        disabled={!hasMore || loadingMore}
        variant="outline"
        size="md"
        px={6}
      >
        {hasMore ? "Load more" : "No more posts"}
      </Button>
    </Box>
  );
}
