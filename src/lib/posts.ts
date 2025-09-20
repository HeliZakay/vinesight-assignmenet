import raw from "../../data/mock-posts.json";

// Shape of each item as it appears in the external dataset (raw JSON)
type RawPost = {
  id: number;
  platform: string;
  text: string;
  status: string;
  tags: string[];
  created_at: string;
};

// Type aliases for post status and supported platforms
export type PostStatus = string;
export type Platform =
  | "twitter"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "reddit"
  | "other";

// Normalized Post type used inside the app
export type Post = {
  id: string; // normalized to string
  platform: Platform; // validated platform value
  text: string;
  status: PostStatus; // validated status value
  tags: string[];
  createdAt: string; // renamed from created_at
};

/**
 * Normalize arbitrary string to a supported platform value.
 * If unknown, defaults to "other".
 */
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

/**
 * Normalize arbitrary string to a supported post status.
 * Defaults to "flagged" if not recognized.
 */
function normalizeStatus(s: string): PostStatus {
  const v = s?.toLowerCase();
  if (v === "flagged" || v === "under_review" || v === "dismissed")
    return v as PostStatus;
  return "flagged";
}

// Transform raw dataset into normalized Post[] for app usage
const posts: Post[] = (raw as RawPost[]).map((r) => ({
  id: String(r.id),
  platform: normalizePlatform(r.platform),
  text: r.text,
  status: normalizeStatus(r.status),
  tags: Array.isArray(r.tags) ? r.tags : [],
  createdAt: r.created_at,
}));

/**
 * Get normalized posts dataset.
 */
export function getPosts(): Post[] {
  return posts;
}
