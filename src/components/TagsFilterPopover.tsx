import { useTags } from "@/hooks/useTags";
import { Box, Button, Checkbox, HStack, Popover, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { FiltersContext } from "@/context/FiltersContext";

export function TagsFilterPopover() {
  const { tags: allTags } = useTags();
  const filters = useContext(FiltersContext);
  if (!filters) return null;
  const { selectedTags, setSelectedTags } = filters;
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="solid" colorScheme="purple" size="sm" px={4} py={2}>
          {selectedTags.length
            ? `Tags (${selectedTags.length})`
            : "Filter by tags"}
        </Button>
      </Popover.Trigger>

      <Popover.Positioner>
        <Popover.Content w="280px" p={4} boxShadow="lg" borderRadius="md">
          <Popover.Arrow />
          <Popover.Body>
            <Text mb={3} fontSize="sm" fontWeight="bold" color="purple.600">
              Tags
            </Text>

            <Box maxH="180px" overflowY="auto" mb={3}>
              <Box display="flex" flexDirection="column" gap={2}>
                {allTags.map((tag) => {
                  const checked = selectedTags.includes(tag);
                  return (
                    <Checkbox.Root
                      key={tag}
                      checked={checked}
                      onCheckedChange={(e) => {
                        const on = !!e.checked;
                        setSelectedTags(
                          on
                            ? [...selectedTags, tag]
                            : selectedTags.filter((t) => t !== tag)
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
                  );
                })}
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
  );
}
