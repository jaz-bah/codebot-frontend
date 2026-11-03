/**
 * Chat domain types (see Brain/api-guide/chat-api-guide.md).
 * Transport lives in services/chat.service.ts (REST) and
 * services/chat-socket.ts (Socket.IO namespace /chat); react-query wiring in
 * hooks/use-chat.ts.
 */

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

/** The other participant of a conversation (BetterAuth user). */
export type ChatPeer = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
};

/** Hit from GET /chat/users — people search by username substring. */
export type ChatUserSearchHit = ChatPeer & {
  /** Set when the caller already chats with this user — jump in. */
  conversationId: string | null;
};

/* ------------------------------------------------------------------ */
/* Conversations                                                       */
/* ------------------------------------------------------------------ */

/** Preview line in the conversation list. */
export type MessagePreview = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
};

/** Item in GET /chat/conversations (same shape minus `created`). */
export type ConversationSummary = {
  id: string;
  otherUser: ChatPeer;
  lastMessage: MessagePreview | null;
  /** Messages from the OTHER user not yet read by the caller. */
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Response of POST /chat/conversations — start-or-open, idempotent. */
export type Conversation = ConversationSummary & {
  /** false when the pair-index recovered the existing row. */
  created: boolean;
};

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

/** One message in a thread. `mine` is caller-relative, computed in the UI. */
export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* Envelopes                                                           */
/* ------------------------------------------------------------------ */

/** Shared pagination envelope (same as todos). */
export type ChatPageMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** GET /chat/conversations — most-recent-activity first. */
export type ConversationsPage = ChatPageMeta & {
  items: ConversationSummary[];
};

/** GET /chat/conversations/:id/messages — NEWEST FIRST, otherUser echoed. */
export type MessagesPage = ChatPageMeta & {
  items: ChatMessage[];
  otherUser: ChatPeer;
};

/** POST /chat/conversations/:id/messages. */
export type SendMessageResult = {
  message: ChatMessage;
  otherUserId: string;
};

/** PATCH /chat/conversations/:id/read. */
export type ReadReceipt = {
  conversationId: string;
  markedRead: boolean;
  readByUserId: string;
};

/* ------------------------------------------------------------------ */
/* Shared workspace items (preview cards in the thread)                */
/* ------------------------------------------------------------------ */

import type { SearchHitType } from "@/types/search.type";

/** Recreate-able share payload — only code-bearing domains carry one.
 * Everything travels INSIDE the message text, so the recipient needs no
 * access to the sender's rows (detail endpoints are ownership-gated). */
export type ChatSharePayload =
  | { kind: "preset"; name: string; language: string; data: string }
  | { kind: "snippet"; language: string; data: string }
  | {
      kind: "component";
      name: string;
      preview: string;
      files: { language: string; code: string }[];
    };

/** Machine-readable share message: a JSON object whose `kind` marks it, so
 * plain prose never parses by accident. `payload === null` renders a plain
 * chip (documents, tools, notes and oversized code). */
export type ChatShareData = {
  kind: "chat-share";
  type: SearchHitType;
  title: string;
  subtitle: string | null;
  payload: ChatSharePayload | null;
};

/** One part of an oversized share — the JSON `ChatShareData` split into
 * base64 slices sent as SEQUENTIAL text messages. Receivers reassemble by
 * `sid`; rendering completes when every part of the group is present. */
export type ChatShareChunk = {
  kind: "chat-share-part";
  /** Random share id grouping the parts (not a domain id). */
  sid: string;
  type: SearchHitType;
  title: string;
  subtitle: string | null;
  /** 1-based part index. */
  part: number;
  parts: number;
  body: string;
};

/* ------------------------------------------------------------------ */
/* Socket.IO events (namespace /chat, server → client)                 */
/* ------------------------------------------------------------------ */

/** Fired after the insert+stamp transaction commits. */
export type MessageNewEvent = {
  conversationId: string;
  message: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
  };
};

/** Conversation list is stale — refresh it. */
export type ConversationUpdatedEvent = {
  conversationId: string;
  preview: MessagePreview | null;
  updatedAt: string;
};

/** The other user read the thread (sender side). */
export type MessagesReadEvent = {
  conversationId: string;
  readByUserId: string;
  markedRead: boolean;
};
