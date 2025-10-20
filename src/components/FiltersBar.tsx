// Renders platform & status dropdown filters backed by FiltersContext.
// Keeps filter UI logic isolated from the page and memo-friendly.
import { Box, HStack, NativeSelect, Text } from "@chakra-ui/react";
import { Platform } from "@/lib/platforms";
import { PostStatus } from "@/lib/statuses";
import { useContext } from "react";
import { FiltersContext } from "@/context/FiltersContext";

// Static options from enum (keeps dropdown stable)
const PLATFORM_OPTIONS = ["all", ...Object.values(Platform)];
const STATUS_OPTIONS = ["all", ...Object.values(PostStatus)];

export function FiltersBar() {
  const filters = useContext(FiltersContext);
  if (!filters) return null;
  const { status, setStatus, platform, setPlatform } = filters;
  return (
    <HStack
      gap={4}
      mb={4}
      alignItems="flex-end"
      justify="center"
      flexWrap="wrap"
    >
      <Box width={{ base: "100%", sm: "auto" }}>
        <Text mb={1} fontSize="sm" color="gray.600">
          Status
        </Text>
        <NativeSelect.Root size="sm" width={{ base: "100%", sm: "220px" }}>
          <NativeSelect.Field
            pl={3}
            style={{ textIndent: "4px", cursor: "pointer" }}
            value={status}
            onChange={(e) => setStatus(e.currentTarget.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

      <Box width={{ base: "100%", sm: "auto" }}>
        <Text mb={1} fontSize="sm" color="gray.600">
          Platform
        </Text>
        <NativeSelect.Root size="sm" width={{ base: "100%", sm: "220px" }}>
          <NativeSelect.Field
            pl={3}
            style={{ textIndent: "4px", cursor: "pointer" }}
            value={platform}
            onChange={(e) => setPlatform(e.currentTarget.value)}
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>
    </HStack>
  );
}
