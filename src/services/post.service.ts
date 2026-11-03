/**
 * Post service — the transport layer for the /posts NestJS endpoints
 * (Brain/api-guide/posts-api-guide.md). No react-query / UI code in here.
 *
 * Read routes are PUBLIC; write routes (vote) need the BetterAuth session
 * cookie — anonymous callers get 401.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  PostListParams,
  PostPage,
  PostResourceType,
  PostVoteResponse,
} from "@/types/post.type";

/* ------------------------------------------------------------------ */
/* Transport                                                           */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Backend returns a uniform error envelope: { statusCode, message, ... } */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    // Session is an httpOnly cookie on the backend origin.
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body !== undefined
        ? { "content-type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      typeof payload?.message === "string"
        ? payload.message
        : `Request failed (${res.status})`
    );
  }
  return payload as T;
}

function listQuerystring(params: PostListParams): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sortBy", params.sortBy);
  qs.set("sortOrder", params.sortOrder);
  if (params.search) qs.set("search", params.search);
  if (params.resourceType) qs.set("resourceType", params.resourceType);
  return qs.toString();
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/** GET /posts — public feed, paginated + filtered; anonymous allowed. */
export function fetchPostPage(params: PostListParams): Promise<PostPage> {
  return request<PostPage>(`/posts?${listQuerystring(params)}`);
}

/** POST /posts — publish one of the caller's resources as a public post.
 * 409 when the resource is already published; foreign resource → 404. */
export function publishPost(input: {
  resourceType: PostResourceType;
  resourceId: string;
  title: string;
  description?: string | null;
}): Promise<unknown> {
  return request("/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** POST /posts/:id/vote — upvote (exactly one per user; repeat → 409). */
export function votePost(postId: string): Promise<PostVoteResponse> {
  return request<PostVoteResponse>(`/posts/${postId}/vote`, {
    method: "POST",
  });
}

/** DELETE /posts/:id/vote — withdraw the viewer's vote (none → 404). */
export function unvotePost(postId: string): Promise<PostVoteResponse> {
  return request<PostVoteResponse>(`/posts/${postId}/vote`, {
    method: "DELETE",
  });
}
