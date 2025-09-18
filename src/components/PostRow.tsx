// File: components/PostRow.tsx
import {
  HStack,
  Input,
  NativeSelect,
  Tag as CTag,
  chakra,
  Button,
} from "@chakra-ui/react";
import type { Post } from "@/lib/posts";
import { useState } from "react";

export function PostRow({
  post,
  statusOptions,
}: {
  post: Post;
  statusOptions: string[];
}) {
  const [row, setRow] = useState<Post>(post);
  const [draft, setDraft] = useState("");

  const canAdd = draft.trim().length > 0 && !row.tags.includes(draft.trim());

  const updateStatus = async (newStatus: string) => {
    await fetch(`/api/posts/${row.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setRow((r) => ({ ...r, status: newStatus }));
  };

  const removeTag = async (tag: string) => {
    await fetch(`/api/posts/${row.id}/tags`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    });
    setRow((r) => ({ ...r, tags: r.tags.filter((t) => t !== tag) }));
  };

  const addTag = async () => {
    if (!canAdd) return;
    const tag = draft.trim();
    await fetch(`/api/posts/${row.id}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    });
    setRow((r) => ({ ...r, tags: [...r.tags, tag] }));
    setDraft("");
  };

  return (
    <chakra.tr _hover={{ bg: "gray.50" }}>
      <chakra.td p={3}>{row.id}</chakra.td>
      <chakra.td p={3}>{row.platform}</chakra.td>
      <chakra.td p={3}>{row.text}</chakra.td>

      <chakra.td p={3}>
        <NativeSelect.Root size="sm" width="200px">
          <NativeSelect.Field
            pl={3}
            style={{ textIndent: "4px", cursor: "pointer" }}
            value={row.status}
            onChange={(e) => updateStatus(e.currentTarget.value)}
          >
            {statusOptions
              .filter((s) => s !== "all")
              .map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </chakra.td>

      <chakra.td p={3}>
        <HStack gap={2} flexWrap="wrap" mb={2}>
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

        <HStack gap={2}>
          <Input
            size="sm"
            width="220px"
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
      </chakra.td>

      <chakra.td p={3}>{new Date(row.createdAt).toLocaleString()}</chakra.td>
    </chakra.tr>
  );
}
