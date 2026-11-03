"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Copy,
  MessageCircle,
  MessagesSquare,
  Plus,
  RotateCcw,
  Search,
  Send,
  Share2,
  TriangleAlert,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  chatKeys,
  useChatMessages,
  useChatSocket,
  useChatUsers,
  useConversations,
  useMarkConversationRead,
  useSendChatMessage,
  useStartConversation,
} from "@/hooks/use-chat";
import { componentKeys } from "@/hooks/use-components";
import { ideSnippetKeys } from "@/hooks/use-ide-snippets";
import { presetKeys } from "@/hooks/use-presets";
import { useSearch } from "@/hooks/use-search";
import {
  fetchComponent,
  createComponent,
} from "@/services/component.service";
import {
  createIdeSnippet,
  fetchIdeSnippet,
} from "@/services/ide-snippet.service";
import { createPreset, fetchPreset } from "@/services/preset.service";
import type {
  ChatShareChunk,
  ChatShareData,
  ChatSharePayload,
  ChatUserSearchHit,
  ConversationSummary,
  MessagesPage,
} from "@/types/chat.type";
import type { ChatMessage } from "@/types/chat.type";
import type { SearchHit, SearchHitType } from "@/types/search.type";
import { cn } from "cn";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** REST is the only send path; the socket just listens. */
const MAX_MESSAGE_LENGTH = 5000;

/* ------------------------------------------------------------------ */
/* Debounced value                                                     */
/* ------------------------------------------------------------------ */

/** Trimmed copy of `value`, lagging `delay` behind. All setState calls run
 * in the timer callback — never synchronously inside the effect body. */
function useTrimmedDebouncedValue(value: string, delay = 300): string {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const trimmed = value.trim();
    const timer = window.setTimeout(() => setDebounced(trimmed), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ------------------------------------------------------------------ */
/* Widget                                                              */
/* ------------------------------------------------------------------ */

/**
 * Floating chat bubble (fixed bottom-right) opening a panel with every
 * chat feature: people search, conversation list, thread, receipts and
 * workspace sharing. Mounted once per DashboardShell so the socket and
 * the conversation cache stay warm across navigation.
 */
export function ChatWidget() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const conversationsQuery = useConversations(1, 20);
  const conversations = conversationsQuery.data?.items ?? [];
  const activeConversation = conversations.find((c) => c.id === activeId);

  /* `mutate` identity is stable, so the effect fires on thread switches
   * only — and the socket handler can safely mark read whenever a live
   * message lands in the open thread. */
  const { mutate: markConversationRead } = useMarkConversationRead();
  React.useEffect(() => {
    if (open && activeId) markConversationRead(activeId);
  }, [open, activeId, markConversationRead]);

  /* Live updates: the socket handlers stay dumb — they just mark REST
   * queries stale so every receipt/broadcast flows through the cache. */
  useChatSocket({
    onMessageNew: (event) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(event.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      if (open && event.conversationId === activeId) {
        markConversationRead(event.conversationId);
      }
    },
    onConversationUpdated: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    onMessagesRead: (event) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(event.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });

  const totalUnread = conversations.reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0
  );

  return (
    <>
      <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
        {open && (
          <div
            className={cn(
              "mb-3 flex h-[min(68vh,600px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border bg-popover shadow-lg"
            )}
          >
            {activeId ? (
              <ThreadView
                conversation={activeConversation}
                conversationId={activeId}
                onBack={() => setActiveId(null)}
                onClose={() => setOpen(false)}
              />
            ) : (
              <ListView
                conversationsQuery={conversationsQuery}
                conversations={conversations}
                activeId={activeId}
                onSelect={(id) => setActiveId(id)}
                onClose={() => setOpen(false)}
              />
            )}
          </div>
        )}
        <Button
          type="button"
          size="icon"
          aria-label={open ? "Close chat" : "Open chat"}
          title={open ? "Close chat" : "Open chat"}
          onClick={() => setOpen((prev) => !prev)}
          className="relative size-12 rounded-full text-primary-foreground shadow-md"
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <MessageCircle className="size-5" />
          )}
          {!open && totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-semibold tabular-nums text-white">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function otherLabel(name: string | null, username: string): string {
  return name ? name : `@${username}`;
}

function initialsOf(name: string | null, username: string): string {
  const base = (name ?? username).trim();
  const parts = base.split(/[\s_.-]+/).filter(Boolean);
  return (
    parts.length === 1
      ? parts[0].slice(0, 2)
      : parts.slice(0, 2).map((part) => part[0]).join("")
  ).toUpperCase();
}

/* ------------------------------------------------------------------ */
/* List view (people search + conversations)                           */
/* ------------------------------------------------------------------ */

/**
 * Panel home: an "Add people" search on top (results drop in for whatever
 * you type) and the thread roll underneath.
 */
function ListView({
  conversationsQuery,
  conversations,
  activeId,
  onSelect,
  onClose,
}: {
  conversationsQuery: ReturnType<typeof useConversations>;
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [searchInput, setSearchInput] = React.useState("");
  const searchDebounced = useTrimmedDebouncedValue(searchInput);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary/75 px-4 py-3 text-primary-foreground">
        <MessageCircle className="size-4" />
        <span className="flex-1 font-heading text-sm font-semibold">
          Chat
        </span>
        <span className="text-xs opacity-80">Direct messages</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Close chat"
          onClick={onClose}
          className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Add people — typeahead above the roll */}
      <div className="border-b px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-1.5">
          <UserPlusPending />
          <Input
            className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Add people — search a username…"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      {searchDebounced.length > 0 ? (
        <PeopleResults
          query={searchDebounced}
          onSelect={(id) => {
            setSearchInput("");
            onSelect(id);
          }}
        />
      ) : conversationsQuery.error ? (
        <ChatError
          message={conversationsQuery.error.message}
          onRetry={() => conversationsQuery.refetch()}
        />
      ) : (
        <ConversationRoll
          isPending={conversationsQuery.isPending}
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelect}
        />
      )}
    </>
  );
}

function UserPlusPending() {
  return <Search className="size-3.5 shrink-0 text-muted-foreground" />;
}

function PeopleResults({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (conversationId: string) => void;
}) {
  const usersQuery = useChatUsers(query);
  const startMutation = useStartConversation();

  const openThread = (hit: ChatUserSearchHit) => {
    if (hit.conversationId) {
      onSelect(hit.conversationId);
      return;
    }
    /* start-or-open is idempotent — a concurrent start returns the same row. */
    startMutation.mutate(hit.username, {
      onSuccess: (conversation) => onSelect(conversation.id),
    });
  };

  return (
    <div className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
      {usersQuery.isPending ? (
        <SkeletonHits />
      ) : usersQuery.error ? (
        <ChatError
          message={usersQuery.error.message}
          onRetry={() => usersQuery.refetch()}
        />
      ) : (usersQuery.data?.length ?? 0) === 0 ? (
        <p className="text-xs text-muted-foreground">
          No usernames matching{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">
            {query}
          </code>
          . Usernames are unique and lower-case.
        </p>
      ) : (
        usersQuery.data?.map((hit) => (
          <button
            type="button"
            key={hit.id}
            className="flex items-center gap-3 rounded-lg border p-2 text-left transition-colors hover:bg-muted/50"
            onClick={() => openThread(hit)}
            disabled={startMutation.isPending}
          >
            <Avatar className="size-8">
              {hit.image && <AvatarImage src={hit.image} alt={hit.username} />}
              <AvatarFallback className="text-xs">
                {initialsOf(hit.name, hit.username)}
              </AvatarFallback>
            </Avatar>
            <span className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-sm font-medium">
                {otherLabel(hit.name, hit.username)}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {hit.conversationId
                  ? "Existing conversation"
                  : `@${hit.username}`}
              </span>
            </span>
          </button>
        ))
      )}
    </div>
  );
}

function SkeletonHits() {
  return (
    <>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </>
  );
}

/** Readable inline error row with a retry affordance. */
function ChatError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-3 my-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <TriangleAlert className="size-4 shrink-0" />
      <span className="min-w-0 truncate">{message}</span>
      <Button
        variant="ghost"
        size="xs"
        className="ml-auto gap-1.5"
        onClick={onRetry}
      >
        <RotateCcw className="size-3" />
        Retry
      </Button>
    </div>
  );
}

function ConversationRoll({
  isPending,
  conversations,
  activeId,
  onSelect,
}: {
  isPending: boolean;
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3">
      {isPending ? (
        <SkeletonHits />
      ) : conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
          <MessagesSquare className="size-8" />
          <p className="text-center text-xs">
            No conversations yet — search a username above to start one.
          </p>
        </div>
      ) : (
        conversations.map((conversation) => {
          const isActive = conversation.id === activeId;
          return (
            <button
              type="button"
              key={conversation.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/10"
                  : "hover:bg-muted/50"
              )}
              onClick={() => onSelect(conversation.id)}
            >
              <Avatar className="size-9 shrink-0">
                {conversation.otherUser.image && (
                  <AvatarImage
                    src={conversation.otherUser.image}
                    alt={conversation.otherUser.username}
                  />
                )}
                <AvatarFallback className="text-xs">
                  {initialsOf(
                    conversation.otherUser.name,
                    conversation.otherUser.username
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-sm font-medium">
                  {otherLabel(
                    conversation.otherUser.name,
                    conversation.otherUser.username
                  )}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {conversation.lastMessage
                    ? previewText(conversation.lastMessage.content)
                    : "No messages yet"}
                </span>
              </span>
              {conversation.unreadCount > 0 && (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold tabular-nums text-primary-foreground">
                  {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                </span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Thread view                                                         */
/* ------------------------------------------------------------------ */

function ThreadView({
  conversation,
  conversationId,
  onBack,
  onClose,
}: {
  conversation: ConversationSummary | undefined;
  conversationId: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const messagesQuery = useChatMessages(conversationId);
  const otherUser = messagesQuery.data?.pages[0]?.otherUser ?? conversation?.otherUser;
  const messages = chronological(messagesQuery.data?.pages);

  /* Chunked v2 shares: evaluate every chunk group once per message list. */
  const assemblies = React.useMemo(
    () => assembleShares(messages),
    [messages]
  );

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const lastId = messages.at(-1)?.id;

  /* Snap to the tail whenever the newest message or thread changes. */
  React.useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight });
  }, [lastId, conversationId]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary/75 px-3 py-2.5 text-primary-foreground">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Back to conversations"
          onClick={onBack}
          className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Avatar className="size-7">
          {otherUser?.image && (
            <AvatarImage src={otherUser.image} alt={otherUser.username} />
          )}
          <AvatarFallback className="text-[10px]">
            {otherUser
              ? initialsOf(otherUser.name, otherUser.username)
              : ""}
          </AvatarFallback>
        </Avatar>
        <span className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate text-sm font-semibold">
            {otherUser ? otherLabel(otherUser.name, otherUser.username) : "Thread"}
          </span>
          {otherUser && (
            <span className="truncate text-[11px] opacity-80">
              @{otherUser.username}
            </span>
          )}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Close chat"
          onClick={onClose}
          className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-muted/30 p-3"
      >
        {messagesQuery.isPending ? (
          <>
            <Skeleton className="h-10 w-2/3 self-start rounded-full" />
            <Skeleton className="h-10 w-1/2 self-end rounded-full" />
            <Skeleton className="h-10 w-3/4 self-start rounded-full" />
          </>
        ) : messagesQuery.error ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            <span className="min-w-0 truncate">{messagesQuery.error.message}</span>
            <Button
              variant="ghost"
              size="xs"
              className="ml-auto gap-1.5"
              onClick={() => messagesQuery.refetch()}
            >
              <RotateCcw className="size-3" />
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessagesSquare className="size-8" />
            <p className="text-sm">Say hi — delivery and receipts are live.</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              otherUser={otherUser ?? null}
              assembly={assemblies.get(message.id)}
            />
          ))
        )}

        {messagesQuery.hasNextPage && !messagesQuery.isPending && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="xs"
              className="gap-1.5 text-xs"
              disabled={messagesQuery.isFetchingNextPage}
              onClick={() => messagesQuery.fetchNextPage()}
            >
              <ArrowLeft className="size-3" />
              {messagesQuery.isFetchingNextPage
                ? "Loading…"
                : "Load older messages"}
            </Button>
          </div>
        )}
      </div>

      <Composer conversationId={conversationId} />
    </>
  );
}

/** Chronological order: history pages arrive NEWEST FIRST. */
function chronological(pages: MessagesPage[] | undefined): ChatMessage[] {
  return pages?.flatMap((page) => page.items).reverse() ?? [];
}

function MessageRow({
  message,
  otherUser,
  assembly,
}: {
  message: ChatMessage;
  otherUser: MessagesPage["otherUser"] | null;
  assembly?: ShareAssembly;
}) {
  /* Every participant is either me or the otherUser. */
  const isMine = otherUser ? message.senderId !== otherUser.id : false;
  const share = tryParseShareData(message.content);
  const chunk = share ? null : tryParseShareChunk(message.content);
  const legacy = share || chunk ? null : parseLegacyShared(message.content);

  /* Chunk rows: one part of a sequential transfer. When the whole set has
   * arrived the final row renders the assembled card. */
  let chunkNode: React.ReactNode | null = null;
  if (chunk) {
    if (assembly?.state === "ready") {
      chunkNode = <ShareCard share={assembly.share} mine={isMine} />;
    } else if (assembly?.state === "pending") {
      chunkNode = (
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-2xl border border-dashed bg-background px-3.5 py-2 text-xs text-muted-foreground",
            isMine && "border-primary/40"
          )}
        >
          <RotateCcw className="size-3 animate-spin" />
          {assembly.title ? `Sharing ${assembly.title} — ` : "Sharing — "}
          part {assembly.part}/{assembly.parts}
        </span>
      );
    } else {
      chunkNode = (
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-2xl border bg-background px-3.5 py-2 text-xs text-muted-foreground",
            isMine && "border-primary/40"
          )}
        >
          {chunk.type === "preset" || chunk.type === "snippet" || chunk.type === "component"
            ? SHARE_EMOJI[chunk.type]
            : "🔗"}{" "}
          part {chunk.part}/{chunk.parts}
        </span>
      );
    }
  }

  return (
    <div
      className={cn(
        "flex max-w-[85%] gap-2",
        isMine ? "items-end self-end" : "items-start self-start"
      )}
    >
      {!isMine && (
        <Avatar className="mt-1 size-6 shrink-0">
          {otherUser?.image && (
            <AvatarImage
              src={otherUser.image}
              alt={otherLabel(otherUser.name, otherUser.username)}
            />
          )}
          <AvatarFallback className="text-[10px]">
            {otherUser ? initialsOf(otherUser.name, otherUser.username) : ""}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        {share ? (
          <ShareCard share={share} mine={isMine} />
        ) : chunkNode ? (
          chunkNode
        ) : legacy ? (
          /* Legacy v1 shares — readable emoji-header chips, no actions. */
          <span
            className={cn(
              "flex flex-col gap-1 break-words rounded-2xl px-3.5 py-2 text-sm",
              isMine
                ? "bg-primary text-primary-foreground"
                : "border bg-background text-foreground"
            )}
          >
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide opacity-80">
              <span aria-hidden>{legacy.emoji}</span>
              Shared {legacy.type}
            </span>
            <span className="font-medium">{legacy.title}</span>
            {legacy.body && (
              <span className="whitespace-pre-wrap break-words font-mono text-xs opacity-90">
                {legacy.body}
              </span>
            )}
          </span>
        ) : (
          <span
            className={cn(
              "break-words rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
              isMine
                ? "bg-primary text-primary-foreground"
                : "border bg-background text-foreground"
            )}
          >
            {message.content}
          </span>
        )}
        {isMine && (
          <span
            className="text-[10px] text-muted-foreground"
            title={new Date(message.createdAt).toLocaleString()}
          >
            {message.isRead ? "Read" : "Sent"}
          </span>
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Share preview card (with copy + save)                               */
/* ------------------------------------------------------------------ */

/** Flag: does this share's payload map onto a create call? */
function sharePayloadOf(
  share: ChatShareData
): Extract<ChatSharePayload, { kind: string }> | null {
  const payload = share.payload;
  if (payload) return payload;
  return null;
}

/** The flat content a Copy button hands to the clipboard. */
function shareCopyContent(
  payload: ChatSharePayload
): string {
  return payload.kind === "component"
    ? payload.files.map((file) => file.code).join("\n\n")
    : payload.data;
}

/** Preview card: type badge + title, an actual code preview, and Copy /
 * Save actions for recreatable payloads. */
function ShareCard({ share, mine }: { share: ChatShareData; mine: boolean }) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = React.useState(false);
  const payload = sharePayloadOf(share);

  /* Inside a v2 message, `kind` always agrees with `type` — the guard keeps
   * the variants aligned for TS and defends against hand-crafted text. */
  const saveLabel =
    share.type === "preset" || share.type === "snippet" || share.type === "component"
      ? share.type
      : null;

  const saveMutation = useMutation({
    mutationFn: async (): Promise<unknown> => {
      if (!payload || !saveLabel || payload.kind !== saveLabel) {
        throw new Error("This share has no saveable content.");
      }
      if (payload.kind === "preset") {
        return createPreset({
          name: payload.name,
          language: payload.language,
          data: payload.data,
        });
      }
      if (payload.kind === "snippet") {
        return createIdeSnippet({
          language: payload.language,
          data: payload.data,
        });
      }
      return createComponent({
        name: payload.name,
        preview: payload.preview,
        files: payload.files,
      });
    },
    onSettled: () => {
      // Refresh every recreated domain's cache once.
      queryClient.invalidateQueries({ queryKey: presetKeys.all() });
      queryClient.invalidateQueries({ queryKey: componentKeys.all() });
      queryClient.invalidateQueries({ queryKey: ideSnippetKeys.all() });
    },
  });

  const content = payload ? shareCopyContent(payload) : null;

  const copy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied (insecure context) — ignore, button stays Copy.
    }
  };

  return (
    <span
      className={cn(
        "thin-scrollbar flex w-72 min-w-0 flex-col gap-2 break-words rounded-2xl border bg-background p-3 text-foreground",
        mine && "border-primary/40"
      )}
    >
      {/* Header */}
      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span aria-hidden>{SHARE_EMOJI[share.type] ?? "🔗"}</span>
        Shared {share.type}
      </span>
      <span className="break-words font-medium">{share.title}</span>
      {share.subtitle && (
        <span className="text-xs text-muted-foreground">{share.subtitle}</span>
      )}

      {/* Actual preview */}
      {payload && (
        <span className="thin-scrollbar max-h-44 min-w-0 overflow-y-auto rounded-lg border bg-muted/40 p-2 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
          {content}
        </span>
      )}

      {/* Actions */}
      {(content || saveLabel || payload) && (
        <span className="flex items-center gap-2">
          {content && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              className={cn("gap-1", copied && "text-success")}
              onClick={copy}
              title="Copy content"
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
          {saveLabel && !mine && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              className={cn(
                "gap-1",
                saveMutation.isSuccess &&
                  "text-success"
              )}
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || saveMutation.isSuccess}
              title={`Save as your own ${share.type}`}
            >
              {saveMutation.isPending ? (
                <RotateCcw className="size-3 animate-spin" />
              ) : saveMutation.isSuccess ? (
                <Check className="size-3" />
              ) : (
                <Plus className="size-3" />
              )}
              {saveMutation.isSuccess ? "Saved" : "Save"}
            </Button>
          )}
        </span>
      )}
      {saveMutation.error && (
        <span className="text-xs text-destructive">
          {saveMutation.error.message}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Composer                                                            */
/* ------------------------------------------------------------------ */

function Composer({ conversationId }: { conversationId: string }) {
  const sendMutation = useSendChatMessage();
  const [draft, setDraft] = React.useState("");

  const content = draft.trim();
  const canSend = content.length > 0 && content.length <= MAX_MESSAGE_LENGTH;

  const send = () => {
    if (!content || sendMutation.isPending) return;
    sendMutation.mutate(
      { conversationId, content },
      { onSuccess: () => setDraft("") }
    );
  };

  return (
    <form
      className="flex items-start gap-2 border-t p-3"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <ShareDialog conversationId={conversationId} />
      <div className="min-w-0 flex-1">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message…"
          maxLength={MAX_MESSAGE_LENGTH}
          autoComplete="off"
        />
        {sendMutation.error && (
          <p className="mt-1.5 text-xs text-destructive">
            {sendMutation.error.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        size="icon"
        aria-label="Send message"
        disabled={!canSend || sendMutation.isPending}
        className="shrink-0 rounded-full"
      >
        {sendMutation.isPending ? (
          <RotateCcw className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Shared workspace items                                              */
/* ------------------------------------------------------------------ */

/** Chat messages are plain text capped at 5000 chars, so a share is the
 * JSON-encoded `ChatShareData` block (kind: "chat-share"). Sender-owned
 * detail fetches run at SEND time; recipients only ever need the payload
 * embedded in the message. */
const SHARE_EMOJI: Record<SearchHitType, string> = {
  todo: "✅",
  note: "📝",
  file: "📁",
  document: "📄",
  component: "🧩",
  preset: "🎛️",
  expert: "🤖",
  tool: "🔧",
  snippet: "⚡",
};

/** Scope tokens riding the GET /search query — every shareable domain. */
const SHARE_SCOPES =
  "@presets @components @snippets @experts @tools @notes @todos @documents @files";

const SHARE_HEADER_RE = /^(.+?) Shared ([a-z]+) — (.+)$/u;

const SHARE_EMOJI_SET = new Set(Object.values(SHARE_EMOJI));

/** Fetch the sender-owned detail row backing a search hit, flattened into
 * the recreate-able payload embedded for recipients. */
async function resolveSharePayload(
  hit: SearchHit
): Promise<ChatSharePayload | null> {
  switch (hit.type) {
    case "preset": {
      const preset = await fetchPreset(hit.id);
      return {
        kind: "preset",
        name: preset.name,
        language: preset.language,
        data: preset.data,
      };
    }
    case "snippet": {
      const snippet = await fetchIdeSnippet(hit.id);
      return {
        kind: "snippet",
        language: snippet.language,
        data: snippet.data,
      };
    }
    case "component": {
      const component = await fetchComponent(hit.id);
      return {
        kind: "component",
        name: component.name,
        preview: component.preview,
        files: component.files.map((file) => ({
          language: file.language,
          code: file.code,
        })),
      };
    }
    default:
      // Documents/tools/notes/… have no recreate-able payload — they
      // travel as readable chips.
      return null;
  }
}

/** Serialize a share for a chat message. When the embedded payload would
 * push the text over the backend's 5000-char cap, degrade to a payload-free
 * chip (code that arrives truncated is code you can't safely save). */
function encodeShareData(data: ChatShareData): {
  text: string;
  dropped: boolean;
} {
  if (!data.payload) return { text: JSON.stringify(data), dropped: false };
  const overhead =
    JSON.stringify({ ...data, payload: null }).length + "…".length;
  if (overhead + JSON.stringify(data.payload).length <= MAX_MESSAGE_LENGTH) {
    return { text: JSON.stringify(data), dropped: false };
  }
  const note = [
    data.subtitle,
    "· too large to embed inline — ask for a direct export",
  ]
    .filter(Boolean)
    .join(" ");
  return {
    text: JSON.stringify({
      ...data,
      subtitle: note,
      payload: null,
    }).slice(0, MAX_MESSAGE_LENGTH),
    dropped: true,
  };
}

/** Decode v2 share messages; null when the text is plain prose. */
function tryParseShareData(content: string): ChatShareData | null {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('{"kind":"chat-share"')) return null;
  try {
    const parsed = JSON.parse(trimmed) as ChatShareData;
    if (
      parsed.kind !== "chat-share" ||
      typeof parsed.title !== "string" ||
      !parsed.title
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Oversized shares — chunked across sequential messages               */
/* ------------------------------------------------------------------ */

/** Payload chars per chunk — message JSON (kind/sid/title/subtitle/meta +
 * body) must stay under the backend's 5000-char content cap. */
const SHARE_CHUNK_CHARS = 3500;
/** Noise cap — payloads beyond this degrade to a payload-free chip. */
const SHARE_MAX_PARTS = 8;

/** UTF-8-safe base64 (btoa/atob alone mangle non-latin1 code). */
function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Short random group id for a chunked share (not a domain id). */
function makeShareSid(): string {
  return Math.random().toString(36).slice(2, 8);
}

/** Decode one chunk row; null for anything else. */
function tryParseShareChunk(content: string): ChatShareChunk | null {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('{"kind":"chat-share-part"')) return null;
  try {
    const parsed = JSON.parse(trimmed) as ChatShareChunk;
    if (
      parsed.kind !== "chat-share-part" ||
      typeof parsed.sid !== "string" ||
      typeof parsed.body !== "string" ||
      typeof parsed.part !== "number" ||
      typeof parsed.parts !== "number" ||
      parsed.part < 1 ||
      parsed.part > parsed.parts ||
      parsed.parts < 2
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** What a chunk row renders as once the group is evaluated. */
export type ShareAssembly =
  | { state: "ready"; share: ChatShareData }
  | { state: "pending"; part: number; parts: number; title: string | null }
  | { state: "contrib"; part: number; parts: number };

/** Group every chunk row in the thread by `sid`: rows of a complete set
 * collapse into ONE card (rendered on the final part's row); incomplete
 * sets render waiting chips. */
function assembleShares(
  messages: ChatMessage[]
): Map<string, ShareAssembly> {
  type Group = {
    parts: Map<number, { messageId: string; body: string }>;
    meta: ChatShareChunk;
  };

  const groups = new Map<string, Group>();
  for (const message of messages) {
    const chunk = tryParseShareChunk(message.content);
    if (!chunk) continue;
    const group = groups.get(chunk.sid) ?? {
      parts: new Map(),
      meta: chunk,
    };
    group.parts.set(chunk.part, {
      messageId: message.id,
      body: chunk.body,
    });
    groups.set(chunk.sid, group);
  }

  const assemblies = new Map<string, ShareAssembly>();
  for (const group of groups.values()) {
    const total = Math.max(group.meta.parts, 0);
    const missing = Array.from({ length: total }, (_, i) => i + 1).filter(
      (part) => !group.parts.has(part)
    );
    if (missing.length > 0) {
      for (const [part, { messageId }] of group.parts) {
        if (!assemblies.has(messageId)) {
          assemblies.set(messageId, {
            state: "pending",
            part,
            parts: total,
            title: group.meta.title,
          });
        }
      }
      continue;
    }
    const lastIndex = Math.max(...group.parts.keys());
    const ready =
      tryParseShareData(
        base64ToUtf8(
          Array.from({ length: total }, (_, i) => group.parts.get(i + 1)!.body).join("")
        )
      ) ?? null;
    for (const [part, { messageId }] of group.parts) {
      if (!assemblies.has(messageId)) {
        assemblies.set(
          messageId,
          ready && part === lastIndex
            ? { state: "ready", share: ready }
            : { state: "contrib", part, parts: total }
        );
      }
    }
  }
  return assemblies;
}

/** Decode legacy v1 shares (readable text with an emoji header). */
function parseLegacyShared(
  content: string
): { emoji: string; type: string; title: string; body: string | null } | null {
  const firstBreak = content.indexOf("\n");
  const firstLine = firstBreak === -1 ? content : content.slice(0, firstBreak);
  const match = SHARE_HEADER_RE.exec(firstLine);
  if (!match) return null;
  const emoji = match[1];
  if (!SHARE_EMOJI_SET.has(emoji)) return null;
  return {
    emoji,
    type: match[2],
    title: match[3],
    body: firstBreak === -1 ? null : content.slice(firstBreak + 1),
  };
}

/** Single-line preview for the conversation roll — a share never shows
 * its raw JSON. */
function previewText(content: string): string {
  const share = tryParseShareData(content);
  if (share) {
    const emoji = SHARE_EMOJI[share.type] ?? "🔗";
    return `${emoji} Shared ${share.type} — ${share.title}`;
  }
  const chunk = tryParseShareChunk(content);
  if (chunk) {
    return `${SHARE_EMOJI[chunk.type] ?? "🔗"} Sharing ${chunk.type} — part ${chunk.part}/${chunk.parts}`;
  }
  const legacy = parseLegacyShared(content);
  if (legacy) return content.split("\n")[0];
  return content;
}

/* ------------------------------------------------------------------ */
/* Share dialog                                                        */
/* ------------------------------------------------------------------ */

function ShareDialog({ conversationId }: { conversationId: string }) {
  const [open, setOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState("");
  const searchDebounced = useTrimmedDebouncedValue(searchInput);

  /* Scoped workspace search — tokens stay fresh (15s) per term. */
  const searchQuery = useSearch({
    q: `${searchDebounced} ${SHARE_SCOPES}`,
  });
  const sendMutation = useSendChatMessage();
  const [pickError, setPickError] = React.useState<string | null>(null);

  const share = async (hit: SearchHit) => {
    if (sendMutation.isPending) return;
    setPickError(null);
    /* The sender fetches their OWN detail row here; the payload rides
     * inside the message for the recipient (detail endpoints are
     * ownership-gated so fetching on the receiver side can't work). */
    let payload: ChatSharePayload | null = null;
    try {
      payload = await resolveSharePayload(hit);
    } catch (error) {
      setPickError(
        error instanceof Error ? error.message : "Couldn't load that item."
      );
      return;
    }
    const data: ChatShareData = {
      kind: "chat-share",
      type: hit.type,
      title: hit.title,
      subtitle: hit.subtitle,
      payload,
    };
    const json = JSON.stringify(data);
    if (json.length <= MAX_MESSAGE_LENGTH) {
      sendMutation.mutate(
        { conversationId, content: json },
        { onSuccess: () => setOpen(false) }
      );
      return;
    }

    /* Oversized — split the JSON into base64 slices and send them as
     * sequential messages; recipients reassemble by share id. */
    const b64 = utf8ToBase64(json);
    const parts = Math.ceil(b64.length / SHARE_CHUNK_CHARS);
    if (parts > SHARE_MAX_PARTS) {
      sendMutation.mutate(
        { conversationId, content: encodeShareData(data).text },
        { onSuccess: () => setOpen(false) }
      );
      return;
    }
    const sid = makeShareSid();
    try {
      for (let part = 1; part <= parts; part++) {
        const chunk = {
          kind: "chat-share-part",
          sid,
          type: data.type,
          title: data.title,
          subtitle: data.subtitle,
          part,
          parts,
          body: b64.slice((part - 1) * SHARE_CHUNK_CHARS, part * SHARE_CHUNK_CHARS),
        } satisfies ChatShareChunk;
        await sendMutation.mutateAsync({
          conversationId,
          content: JSON.stringify(chunk),
        });
      }
    } catch (error) {
      setPickError(
        error instanceof Error ? error.message : "Share failed — retry."
      );
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Share a workspace item"
        title="Share a workspace item"
        onClick={() => setOpen(true)}
        className="shrink-0"
      >
        <Share2 className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share an item</DialogTitle>
            <DialogDescription>
              Share from your workspace — presets, components, snippets,
              experts, tools, notes, todos. It lands in the thread as text.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chat-share-search">Search</Label>
              <Input
                id="chat-share-search"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPickError(null);
                }}
                placeholder="Filter by name…"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="thin-scrollbar flex max-h-80 min-h-24 flex-col gap-2 overflow-y-auto">
              {searchQuery.error ? (
                <p className="text-sm text-destructive">
                  {searchQuery.error.message}
                </p>
              ) : searchQuery.isPending ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (searchQuery.data?.results.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing matches{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono">
                    {searchDebounced}
                  </code>
                  .
                </p>
              ) : (
                searchQuery.data?.results.map((hit) => (
                  <button
                    type="button"
                    key={`${hit.type}-${hit.id}`}
                    className="flex items-center gap-3 rounded-lg border p-2 text-left hover:bg-muted/50 disabled:opacity-50"
                    onClick={() => share(hit)}
                    disabled={sendMutation.isPending}
                  >
                    <Avatar className="size-8" aria-hidden>
                      <AvatarFallback className="text-base">
                        {SHARE_EMOJI[hit.type]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="grid min-w-0 flex-1 text-left leading-tight">
                      <span className="truncate font-medium">
                        {hit.title}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {hit.subtitle ?? hit.type}
                      </span>
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {hit.type}
                    </span>
                  </button>
                ))
              )}
            </div>

            {(pickError || sendMutation.error) && (
              <p className="text-xs text-destructive">
                {pickError ?? sendMutation.error?.message}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
