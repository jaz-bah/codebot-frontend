/**
 * Post types — mirrors the PostView returned by the /posts endpoints
 * (Brain/api-guide/posts-api-guide.md). A post references an existing
 * resource (`resourceType` + `resourceId`); only its own presentation
 * (title/description) lives on the post itself.
 */

export const POST_RESOURCE_TYPES = [
  "todo",
  "note",
  "component",
  "preset",
  "tool",
  "snippet",
] as const;

export type PostResourceType = (typeof POST_RESOURCE_TYPES)[number];

export type PostSortBy = "createdAt" | "updatedAt" | "votes";

export type PostSortOrder = "asc" | "desc";

export type PostListParams = {
  page: number;
  limit: number;
  search?: string;
  resourceType?: PostResourceType;
  sortBy: PostSortBy;
  sortOrder: PostSortOrder;
};

/** Author resolved live from the BetterAuth user table. */
export type PostAuthor = {
  id: string;
  username: string;
  name: string;
  image: string | null;
};

/** Full post view as returned by the feed / detail endpoints. */
export type Post = {
  id: string;
  userId: string;
  resourceType: PostResourceType;
  resourceId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  voteCount: number;
  /** Reflects the VIEWER (false for anonymous). */
  hasVoted: boolean;
};

/** GET /posts envelope — same shape as todos. */
export type PostPage = {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** POST / DELETE /posts/:id/vote response (fresh count). */
export type PostVoteResponse = {
  postId: string;
  hasVoted: boolean;
  voteCount: number;
};
