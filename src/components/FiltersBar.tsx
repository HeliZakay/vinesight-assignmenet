// File: components/FiltersBar.tsx
import { Box, HStack, NativeSelect, Text } from "@chakra-ui/react";

type Props = {
  status: string;
  onStatusChange: (v: string) => void;
  statusOptions: string[];
  platform: string;
  onPlatformChange: (v: string) => void;
  platformOptions: string[];
};

export function FiltersBar({
  status,
  onStatusChange,
  statusOptions,
  platform,
  onPlatformChange,
  platformOptions,
}: Props) {
  return (
    <HStack gap={4} mb={4} alignItems="flex-end" justify="center">
      <Box>
        <Text mb={1} fontSize="sm" color="gray.600">
          Status
        </Text>
        <NativeSelect.Root size="sm" width="220px">
          <NativeSelect.Field
            pl={3}
            style={{ textIndent: "4px", cursor: "pointer" }}
            value={status}
            onChange={(e) => onStatusChange(e.currentTarget.value)}
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
            onChange={(e) => onPlatformChange(e.currentTarget.value)}
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
  );
}
