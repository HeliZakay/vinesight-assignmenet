import raw from "../../data/mock-posts.json";

// external dataset item shape
type RawPost = {
  id: number;
  platform: string;
  text: string;
  status: string;
  tags: string[];
  created_at: string;
};

export type PostStatus = "flagged" | "under_review" | "dismissed";
export type Platform =
  | "twitter"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "reddit"
  | "other";

export type Post = {
  id: string;
  platform: Platform;
  text: string;
  status: PostStatus;
  tags: string[];
  createdAt: string;
};

function normalizePlatform(p: string): Platform {
  const v = p?.toLowerCase();
  if (
    ["twitter", "facebook", "instagram", "tiktok", "reddit", "other"].includes(
      v
    )
  )
    return v as Platform;
  return "other";
}

function normalizeStatus(s: string): PostStatus {
  const v = s?.toLowerCase();
  if (v === "flagged" || v === "under_review" || v === "dismissed")
    return v as PostStatus;
  return "flagged";
}

const posts: Post[] = (raw as RawPost[]).map((r) => ({
  id: String(r.id),
  platform: normalizePlatform(r.platform),
  text: r.text,
  status: normalizeStatus(r.status),
  tags: Array.isArray(r.tags) ? r.tags : [],
  createdAt: r.created_at,
}));

export function getPosts(): Post[] {
  return posts;
}
