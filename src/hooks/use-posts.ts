"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchPostPage,
  publishPost,
  unvotePost,
  votePost,
} from "@/services/post.service";
import type {
  PostListParams,
  PostPage,
  PostVoteResponse,
} from "@/types/post.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const postKeys = {
  all: () => ["posts"] as const,
  lists: () => ["posts", "list"] as const,
  list: (params: PostListParams) => ["posts", "list", params] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* Cache helpers (shared by both vote directions)                      */
/* ------------------------------------------------------------------ */

/** Write one authoritative vote result into every cached post page. */
function applyVoteResponse(
  queryClient: ReturnType<typeof useQueryClient>,
  response: PostVoteResponse
) {
  const snapshots = queryClient.getQueriesData<PostPage>({
    queryKey: postKeys.lists(),
  });
  for (const [key, page] of snapshots) {
    if (!page) continue;
    queryClient.setQueryData<PostPage>(key, {
      ...page,
      items: page.items.map((post) =>
        post.id === response.postId
          ? {
              ...post,
              hasVoted: response.hasVoted,
              voteCount: response.voteCount,
            }
          : post
      ),
    });
  }
}

/** Optimistic vote-state patch used before the server responds. */
function patchPostOptimistically(
  page: PostPage,
  postId: string,
  hasVoted: boolean
): PostPage {
  return {
    ...page,
    items: page.items.map((post) =>
      post.id === postId
        ? {
            ...post,
            hasVoted,
            voteCount: Math.max(
              0,
              post.voteCount + (hasVoted ? 1 : -1)
            ),
          }
        : post
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Paginated public post feed for the current filters/page. */
export function usePostsList(params: PostListParams) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => fetchPostPage(params),
    // Filter/page switches render instantly; refetch truth.
    placeholderData: keepPreviousData,
  });
}

/** POST /posts — publish a resource to the public feed. */
export function usePublishPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishPost,
    onSettled: () => {
      // The feed gains an item and /posts totals change everywhere.
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

/** POST /posts/:id/vote — optimistic upvote, rolled back on failure. */
export function useVotePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => votePost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });
      const snapshots = queryClient.getQueriesData<PostPage>({
        queryKey: postKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<PostPage>(
          key,
          patchPostOptimistically(page, postId, true)
        );
      }
      return { snapshots };
    },
    onError: (_error, _postId, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSuccess: (response) => applyVoteResponse(queryClient, response),
  });
}

/** DELETE /posts/:id/vote — optimistic withdraw, rolled back on failure. */
export function useUnvotePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => unvotePost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });
      const snapshots = queryClient.getQueriesData<PostPage>({
        queryKey: postKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<PostPage>(
          key,
          patchPostOptimistically(page, postId, false)
        );
      }
      return { snapshots };
    },
    onError: (_error, _postId, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSuccess: (response) => applyVoteResponse(queryClient, response),
  });
}
