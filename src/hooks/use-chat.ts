"use client";

import * as React from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchChatMessages,
  fetchConversations,
  markConversationRead,
  searchChatUsers,
  sendChatMessage,
  startConversation,
} from "@/services/chat.service";
import { getChatSocket } from "@/services/chat-socket";
import type {
  ConversationUpdatedEvent,
  MessageNewEvent,
  MessagesReadEvent,
  SendMessageResult,
} from "@/types/chat.type";

/* ------------------------------------------------------------------ */
/* Page size                                                           */
/* ------------------------------------------------------------------ */

export const MESSAGES_PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const chatKeys = {
  all: () => ["chat"] as const,
  users: (q: string) => ["chat", "users", q] as const,
  conversations: () => ["chat", "conversations"] as const,
  conversationList: (page: number, limit: number) =>
    ["chat", "conversations", page, limit] as const,
  messages: (conversationId: string) =>
    ["chat", "messages", conversationId] as const,
};

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

/** People search by username substring (caller is excluded server-side). */
export function useChatUsers(q: string, limit = 10, enabled = true) {
  return useQuery({
    queryKey: chatKeys.users(q),
    queryFn: () => searchChatUsers(q, limit),
    enabled: enabled && q.length > 0,
  });
}

/** Thread list, most-recent-activity first (server-paginated). */
export function useConversations(page: number, limit = 20) {
  return useQuery({
    queryKey: chatKeys.conversationList(page, limit),
    queryFn: () => fetchConversations(page, limit),
    placeholderData: keepPreviousData,
  });
}

/**
 * Message history for one conversation. Pages are NEWEST FIRST; page 1 is
 * the most recent window and `flatChronological` in the page component
 * reverses the flattening for display — `next` pages therefore load OLDER
 * messages ("load older" scrolling up).
 */
export function useChatMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId ?? "none"),
    queryFn: ({ pageParam }) =>
      fetchChatMessages(conversationId!, pageParam, MESSAGES_PAGE_SIZE),
    enabled: conversationId !== null,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

/** Start-or-open a thread with the user owning `username`. */
export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => startConversation(username),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/** Send text (trimmed 1–5000); persistence is REST-only. */
export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      sendChatMessage(conversationId, content),
    onSettled: (_data: SendMessageResult | undefined, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables?.conversationId ?? ""),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.all() });
    },
  });
}

/** Read receipt — flips every unread message of the OTHER user. */
export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => markConversationRead(conversationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Socket                                                              */
/* ------------------------------------------------------------------ */

export type ChatSocketHandlers = {
  onMessageNew?: (payload: MessageNewEvent) => void;
  onConversationUpdated?: (payload: ConversationUpdatedEvent) => void;
  onMessagesRead?: (payload: MessagesReadEvent) => void;
};

/**
 * Wires the singleton /chat socket to handler callbacks. Handlers are kept
 * in a ref so reconnects never rebind or tear down the connection.
 */
export function useChatSocket(handlers: ChatSocketHandlers): void {
  const handlersRef = React.useRef(handlers);
  React.useEffect(() => {
    handlersRef.current = handlers;
  });

  React.useEffect(() => {
    const socket = getChatSocket();

    const onMessageNew = (payload: MessageNewEvent) =>
      handlersRef.current.onMessageNew?.(payload);
    const onConversationUpdated = (payload: ConversationUpdatedEvent) =>
      handlersRef.current.onConversationUpdated?.(payload);
    const onMessagesRead = (payload: MessagesReadEvent) =>
      handlersRef.current.onMessagesRead?.(payload);

    socket.on("message:new", onMessageNew);
    socket.on("conversation:updated", onConversationUpdated);
    socket.on("messages:read", onMessagesRead);
    socket.connect();

    return () => {
      socket.off("message:new", onMessageNew);
      socket.off("conversation:updated", onConversationUpdated);
      socket.off("messages:read", onMessagesRead);
      socket.disconnect();
    };
    // Bind once per mounted owner.
  }, []);
}
