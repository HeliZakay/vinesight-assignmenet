// Displays a single post row with inline editing for status and tags.
// Handles optimistic UI updates after server success and shows toast feedback.
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
import { PostStatus } from "@/lib/statuses";
import { PortalToast } from "./PortalToast";

const STATUS_OPTIONS = ["all", ...Object.values(PostStatus)];

export function PostRow({ post }: { post: Post }) {
  // Local copy of the post enabling optimistic updates without refetching list
  const [row, setRow] = useState<Post>(post);
  // Draft tag input value
  const [draft, setDraft] = useState("");
  // Transient toast message state (portal renders when non-null)
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

  // Pre-compute validation for enabling the Add button (purely derived)
  const normalizedDraft = draft.trim().toLowerCase();
  const canAdd =
    normalizedDraft.length > 0 &&
    normalizedDraft.length <= 30 &&
    !row.tags.some((t) => t.toLowerCase() === normalizedDraft);

  // Update status via PATCH then optimistically update local state on success
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

  // Remove a tag (spec-compliant DELETE path with tag in URL)
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

  // Add new tag after client-side validation, then clear draft on success
  const addTag = async () => {
    const raw = draft.trim();
    const tag = raw.toLowerCase();

    // Friendly validation instead of silent return
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
    <>
      {toastMsg && (
        <PortalToast
          title={toastMsg.title}
          description={toastMsg.description}
          status={toastMsg.status}
          duration={1500}
          onClose={() => setToastMsg(null)}
        />
      )}
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
              {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
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
    </>
  );
}
