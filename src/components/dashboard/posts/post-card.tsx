"use client";
/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Copy,
  FileCode,
  ImageOff,
  LayoutGrid,
  ListTodo,
  NotepadText,
  Star,
  Wrench,
} from "lucide-react";

import type { CodeEditorLanguage } from "@/components/code-editor";
import { SectionCard } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useUnvotePost, useVotePost } from "@/hooks/use-posts";
import { fetchPreset } from "@/services/preset.service";
import { fetchIdeSnippet } from "@/services/ide-snippet.service";
import { fetchComponent } from "@/services/component.service";
import { presetKeys } from "@/hooks/use-presets";
import { ideSnippetKeys } from "@/hooks/use-ide-snippets";
import { componentKeys } from "@/hooks/use-components";
import type { Post, PostResourceType } from "@/types/post.type";
import { cn } from "@/lib/utils";

/* Lazy: only code posts mount an editor — the feed shouldn't ship
 * CodeMirror for every visitor. Type-only imports stay static. */
const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  {
    ssr: false,
    /* Same footprint as the loaded editor: fixed 260px, full-bleed. */
    loading: () => (
      <div
        aria-hidden
        className="-mx-4 -mb-4 h-[260px] animate-pulse rounded-none border-y bg-muted/40"
      />
    ),
  }
);

/* ------------------------------------------------------------------ */
/* Kind meta — accent + icon per referenced resource type              */
/* ------------------------------------------------------------------ */

type KindMeta = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Card's left accent edge (see `todo-card.tsx`'s border-left pattern). */
  accent: string;
};

const KIND_META: Record<PostResourceType, KindMeta> = {
  todo: { label: "Todo", icon: ListTodo, accent: "border-l-amber-500" },
  note: { label: "Note", icon: NotepadText, accent: "border-l-blue-500" },
  component: {
    label: "Component",
    icon: LayoutGrid,
    accent: "border-l-violet-500",
  },
  preset: { label: "Preset", icon: FileCode, accent: "border-l-emerald-500" },
  tool: { label: "Tool", icon: Wrench, accent: "border-l-orange-500" },
  snippet: { label: "IDE snippet", icon: FileCode, accent: "border-l-cyan-500" },
};

/* ------------------------------------------------------------------ */
/* PostCard — one card shell per resource kind, replicating the kind's */
/* own card design, with a star button to upvote                       */
/* ------------------------------------------------------------------ */

/** Underlying resource data resolvable by the signed-in viewer. */
type ResourceData = {
  /** Whether the actual resource resolved (viewer owns it). */
  hasResource: boolean;
  code: string | null;
  language: CodeEditorLanguage;
  preview: string | null;
};

/**
 * A post from the public feed. Preset/IDE-snippet posts render exactly
 * like a preset card (title + copy/upvote + editor), component posts
 * exactly like a component card (preview image + title + upvote).
 */
export function PostCard({ post }: { post: Post }) {
  const voteMutation = useVotePost();
  const unvoteMutation = useUnvotePost();
  const isBusy = voteMutation.isPending || unvoteMutation.isPending;

  /* Unvote 404s ("not voted") if cache and server ever disagree — show it. */
  const voteError =
    (unvoteMutation.error ?? voteMutation.error) as
      | { message?: string }
      | null;

  const toggleVote = () => {
    if (isBusy) return;
    if (post.hasVoted) {
      unvoteMutation.mutate(post.id);
    } else {
      voteMutation.mutate(post.id);
    }
  };

  const vote = (
    <VoteButton
      hasVoted={post.hasVoted}
      voteCount={post.voteCount}
      isPending={isBusy}
      postTitle={post.title}
      onToggle={toggleVote}
      errorTitle={voteError?.message}
    />
  );

  switch (post.resourceType) {
    case "preset":
    case "snippet":
      return (
        <CodePostCard post={post} vote={vote} voteError={voteError?.message} />
      );
    case "component":
      return (
        <ComponentPostCard post={post} vote={vote} voteError={voteError?.message} />
      );
    /* Todos, notes and tools keep their accent-edged feed card. */
    default:
      return <KindPostCard post={post} vote={vote} voteError={voteError?.message} />;
  }
}

/* ------------------------------------------------------------------ */
/* Vote button (shared)                                                */
/* ------------------------------------------------------------------ */

/** Announced vote-failure line; identical across every card kind so
 *  errors never depend on how a kind lays out its card. */
function VoteError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mb-2 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive"
    >
      {message}
    </p>
  );
}

function VoteButton({
  hasVoted,
  voteCount,
  isPending,
  postTitle,
  onToggle,
  errorTitle,
}: {
  hasVoted: boolean;
  voteCount: number;
  isPending: boolean;
  postTitle: string;
  onToggle: () => void;
  /* Tooltip fallback for pointer users; screen readers get the inline
   * role="alert" rendered by every card kind. */
  errorTitle?: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      aria-pressed={hasVoted}
      aria-label={
        hasVoted ? `Withdraw upvote for ${postTitle}` : `Upvote ${postTitle}`
      }
      title={errorTitle}
      onClick={onToggle}
      className="gap-1"
    >
      <Star className={cn(hasVoted && "fill-amber-400 text-amber-400")} />
      {voteCount}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Preset / IDE snippet — exact preset-card replica                     */
/* ------------------------------------------------------------------ */

function CodePostCard({
  post,
  vote,
  voteError,
}: {
  post: Post;
  vote: React.ReactNode;
  voteError?: string;
}) {
  const resource = usePostResource(post);
  const copyText = resource.code ?? post.description?.trim() ?? "";

  return (
    <SectionCard
      className="h-full"
      title={post.title}
      action={
        <div
          className="flex items-center gap-1"
          aria-label={`${KIND_META[post.resourceType].label} post actions`}
        >
          <CopyIconButton text={copyText} label={`Copy ${post.title} code`} />
          {vote}
        </div>
      }
    >
      <VoteError message={voteError} />
      <CodeEditor
        /* Remount when the real code arrives behind the placeholder. */
        key={`${post.id}-${resource.hasResource ? "resource" : "fallback"}`}
        language={resource.language}
        defaultValue={resource.code ?? post.description?.trim() ?? ""}
        readOnly
        placeholder="No description."
        label={`${post.title} code`}
        height="260px"
        className="-mx-4 -mb-4 rounded-none border-0 shadow-none focus-within:ring-0"
      />
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Component — exact component-card replica                            */
/* ------------------------------------------------------------------ */

function ComponentPostCard({
  post,
  vote,
  voteError,
}: {
  post: Post;
  vote: React.ReactNode;
  voteError?: string;
}) {
  const resource = usePostResource(post);

  return (
    /* A header suppresses SectionCard's title — the post title lives
       in the footer, exactly like `ComponentCard`. */
    <SectionCard
      className="h-full transition-[box-shadow,ring-color] group-hover/card:ring-foreground/20"
      header={
        resource.preview ? (
          <div className="aspect-video bg-muted">
            <img
              src={resource.preview}
              alt={`${post.title} preview`}
              loading="lazy"
              className="aspect-video w-full bg-muted object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
            />
          </div>
        ) : (
          /* Owner-scoped reads: other users' component ids don't resolve,
             so their posts show a muted placeholder instead of a preview. */
          <div
            role="img"
            aria-label="No preview available"
            className="grid aspect-video place-items-center bg-muted text-muted-foreground"
          >
            <ImageOff aria-hidden className="size-6" />
          </div>
        )
      }
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <p className="min-w-0 truncate font-medium">{post.title}</p>
          {vote}
        </div>
      }
    >
      <VoteError message={voteError} />
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Todos / notes / tools — accent-edged feed card                      */
/* ------------------------------------------------------------------ */

function KindPostCard({
  post,
  vote,
  voteError,
}: {
  post: Post;
  vote: React.ReactNode;
  voteError?: string;
}) {
  const meta = KIND_META[post.resourceType];
  const authorName = post.author.name || post.author.username;
  const initials = authorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const date = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <SectionCard
      size="sm"
      className={cn(
        "h-full border-l-4 transition-colors duration-200",
        meta.accent
      )}
      title={<span className="line-clamp-2">{post.title}</span>}
      description={
        <span className="truncate">
          by {authorName} · <span className="lowercase">{meta.label}</span>
        </span>
      }
      action={vote}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-[0.65rem] font-semibold text-white",
                meta.accent.replace("border-l-", "bg-")
              )}
            >
              {initials}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {date}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <meta.icon className="size-3.5" />
            {meta.label}
          </span>
        </div>
      }
    >
      <VoteError message={voteError} />
      <PostBody post={post} />
    </SectionCard>
  );
}

function PostBody({ post }: { post: Post }) {
  return (
    <p
      className={cn(
        "text-sm whitespace-pre-line text-muted-foreground",
        post.resourceType === "note" ? "line-clamp-6" : "line-clamp-3"
      )}
    >
      {post.description?.trim() || "No description."}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Copy button                                                         */
/* ------------------------------------------------------------------ */

/** Icon-only copy button mirroring the preset card's copy action. */
function CopyIconButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard unavailable (permissions / insecure origin). */
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? "Code copied" : label}
      onClick={copy}
    >
      {copied ? (
        <Check className="text-success" />
      ) : (
        <Copy />
      )}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Underlying resource data (code / preview)                           */
/* ------------------------------------------------------------------ */

/**
 * Fetches the real resource behind a post. Resource reads are
 * owner-scoped (foreign ids → 404), so this only runs when the
 * signed-in viewer authored the post; every other card renders the
 * post's own presentation (description text / placeholder preview)
 * without a doomed request.
 */
function usePostResource(post: Post): ResourceData {
  const isPreset = post.resourceType === "preset";
  const isSnippet = post.resourceType === "snippet";
  const isComponent = post.resourceType === "component";

  /* Owner-scoped reads 404 for anyone else — only request the resource
   * when the session viewer authored this post (client-side gate per
   * DESIGN.md §7: the httpOnly session cookie lives on the API origin). */
  const session = authClient.useSession();
  const viewerId = session?.data?.user?.id;
  const isOwn = viewerId !== undefined && viewerId === post.author.id;

  /* Reuse the presets/snippets/components detail cache keys so the data
   * is shared with the owner's own pages. */
  const presetQuery = useQuery({
    queryKey: presetKeys.detail(post.resourceId),
    queryFn: () => fetchPreset(post.resourceId),
    enabled: isPreset && isOwn,
    retry: false,
    select: (preset) => ({ language: preset.language, code: preset.data }),
  });
  const snippetQuery = useQuery({
    queryKey: ideSnippetKeys.detail(post.resourceId),
    queryFn: () => fetchIdeSnippet(post.resourceId),
    enabled: isSnippet && isOwn,
    retry: false,
    select: (snippet) => ({ language: snippet.language, code: snippet.data }),
  });
  const componentQuery = useQuery({
    queryKey: componentKeys.detail(post.resourceId),
    queryFn: () => fetchComponent(post.resourceId),
    enabled: isComponent && isOwn,
    retry: false,
    select: (component) => ({ preview: component.preview }),
  });

  const codeResolved = isPreset
    ? presetQuery.data
    : isSnippet
      ? snippetQuery.data
      : undefined;

  return {
    hasResource:
      codeResolved !== undefined || componentQuery.data !== undefined,
    code: codeResolved?.code ?? null,
    language: codeResolved?.language ?? "plaintext",
    preview: isComponent ? (componentQuery.data?.preview ?? null) : null,
  };
}
