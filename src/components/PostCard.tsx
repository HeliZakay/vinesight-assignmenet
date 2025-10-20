import {
  Box,
  HStack,
  VStack,
  Text,
  Input,
  Button,
  NativeSelect,
  Tag as CTag,
} from "@chakra-ui/react";
import { memo, useState } from "react";
import type { Post } from "@/lib/posts";
import { PostStatus } from "@/lib/statuses";
import { PortalToast } from "@/components/PortalToast";

const STATUS_OPTIONS = ["all", ...Object.values(PostStatus)];

export const PostCard = memo(function PostCard({ post }: { post: Post }) {
  const [row, setRow] = useState<Post>(post);
  const [draft, setDraft] = useState("");
  const [toastMsg, setToastMsg] = useState<{
    title: string;
    description?: string;
    status?: "error" | "success" | "info" | "warning";
  } | null>(null);

  const showError = (title: string, description?: string) => {
    setToastMsg({ title, description, status: "error" });
  };

  const showSuccess = (title: string, description?: string) => {
    setToastMsg({ title, description, status: "success" });
  };

  const normalizedDraft = draft.trim().toLowerCase();
  const canAdd =
    normalizedDraft.length > 0 &&
    normalizedDraft.length <= 30 &&
    !row.tags.some((t) => t.toLowerCase() === normalizedDraft);

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/posts/${row.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        showError("Couldn't update status. Please try again.");
        return;
      }
      setRow((r) => ({ ...r, status: newStatus }));
      showSuccess("Status successfully updated");
    } catch {
      showError("Couldn't update status. Check your connection and try again.");
    }
  };

  const removeTag = async (tag: string) => {
    try {
      const res = await fetch(
        `/api/posts/${row.id}/tags/${encodeURIComponent(tag)}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        showError("Couldn't remove tag. Please try again.");
        return;
      }
      setRow((r) => ({ ...r, tags: r.tags.filter((t) => t !== tag) }));
      showSuccess("Tag successfully removed");
    } catch {
      showError("Couldn't remove tag. Check your connection and try again.");
    }
  };

  const addTag = async () => {
    const raw = draft.trim();
    const tag = raw.toLowerCase();

    if (raw.length === 0) {
      showError("Please enter a tag before adding.");
      return;
    }
    if (raw.length > 30) {
      showError("Tags must be 1–30 characters long.");
      return;
    }
    if (row.tags.some((t) => t.toLowerCase() === tag)) {
      showError("That tag is already on this post.");
      return;
    }

    try {
      const res = await fetch(`/api/posts/${row.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });
      if (!res.ok) {
        showError("Couldn't add tag. Please try again.");
        return;
      }
      setRow((r) => ({ ...r, tags: [...r.tags, tag] }));
      setDraft("");
      showSuccess("Tag successfully added");
    } catch {
      showError("Couldn't add tag. Check your connection and try again.");
    }
  };

  return (
    <Box bg="white" borderWidth="1px" borderRadius="md" p={4} boxShadow="sm">
      {toastMsg && (
        <PortalToast
          title={toastMsg.title}
          description={toastMsg.description}
          status={toastMsg.status}
          duration={1500}
          onClose={() => setToastMsg(null)}
        />
      )}

      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" align="start" gap={3}>
          <Text fontWeight="bold" color="purple.700">
            {row.platform}
          </Text>
          <Text fontSize="sm" color="gray.500">
            #{row.id}
          </Text>
        </HStack>
        <Text fontSize="sm" color="gray.600">
          {new Date(row.createdAt).toLocaleString()}
        </Text>

        <Box height="1px" bg="gray.200" />

        <Box wordBreak="break-word" whiteSpace="normal">
          <Text>{row.text}</Text>
        </Box>

        <VStack align="stretch" gap={2}>
          <Text fontSize="sm" color="gray.600">
            Status
          </Text>
          <NativeSelect.Root size="sm" width="100%">
            <NativeSelect.Field
              pl={3}
              style={{ textIndent: "4px", cursor: "pointer" }}
              value={row.status}
              onChange={(e) => updateStatus(e.currentTarget.value)}
            >
              {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </VStack>

        <VStack align="stretch" gap={2}>
          <Text fontSize="sm" color="gray.600">
            Tags
          </Text>
          <HStack gap={2} flexWrap="wrap">
            {row.tags.map((tag) => (
              <CTag.Root
                key={tag}
                size="sm"
                variant="subtle"
                colorScheme="purple"
                px={2}
                py={1}
                borderRadius="md"
              >
                <CTag.Label>{tag}</CTag.Label>
                <CTag.EndElement>
                  <CTag.CloseTrigger
                    aria-label={`Remove ${tag}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => removeTag(tag)}
                  />
                </CTag.EndElement>
              </CTag.Root>
            ))}
          </HStack>

          <HStack gap={2} flexWrap="wrap">
            <Input
              size="sm"
              width={{ base: "100%", sm: "auto" }}
              placeholder="Add tag"
              px={3}
              value={draft}
              onChange={(e) => setDraft(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addTag();
                }
              }}
            />
            <Button
              size="sm"
              colorScheme="purple"
              onClick={addTag}
              disabled={!canAdd}
            >
              Add
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
});
