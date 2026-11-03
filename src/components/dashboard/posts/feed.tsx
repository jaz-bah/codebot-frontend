"use client";

import * as React from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Section, SectionCard } from "@/components/shared/Section";
import { PostCard } from "@/components/dashboard/posts/post-card";
import { PostCardSkeleton } from "@/components/skeletons/post-card-skeleton";
import { usePostsList } from "@/hooks/use-posts";

const PAGE_SIZE = 9;

/** The feed view for /dashboard (client-rendered; TanStack Query). */
export function DashboardFeed() {
  const [page, setPage] = React.useState(1);
  const query = usePostsList({
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const data = query.data;

  return (
    <Section
      title="Feed"
      description="Resources shared by the community — presets, todos, tools and more."
      totalItems={data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={page}
      onPageChange={setPage}
      columns={3}
      emptyState={
        <SectionCard
          title="Nothing shared yet"
          description="Publish one of your resources to see it here."
          className="justify-center py-8 text-center"
        />
      }
    >
      {query.error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          <span>
            {(query.error as { message?: string } | null)?.message ??
              "Something went wrong."}
          </span>
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto gap-1.5"
            onClick={() => query.refetch()}
          >
            <RotateCcw className="size-3" />
            Retry
          </Button>
        </div>
      )}

      {query.isPending
        ? Array.from({ length: 6 }, (_, i) => <PostCardSkeleton key={i} />)
        : data?.items.map((post) => <PostCard key={post.id} post={post} />)}
    </Section>
  );
}
