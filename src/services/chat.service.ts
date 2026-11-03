/**
 * Chat service — the transport layer for the /chat REST endpoints
 * (Brain/api-guide/chat-api-guide.md). No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  ChatUserSearchHit,
  Conversation,
  ConversationsPage,
  MessagesPage,
  ReadReceipt,
  SendMessageResult,
} from "@/types/chat.type";

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

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/** GET /chat/users?q=&limit= — substring search on unique usernames. */
export function searchChatUsers(q: string, limit = 10): Promise<ChatUserSearchHit[]> {
  const qs = new URLSearchParams({ q, limit: String(limit) });
  return request<ChatUserSearchHit[]>(`/chat/users?${qs.toString()}`);
}

/** POST /chat/conversations — start-or-open (idempotent on the pair). */
export function startConversation(username: string): Promise<Conversation> {
  return request<Conversation>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

/** GET /chat/conversations — threads, most-recent-activity first. */
export function fetchConversations(page: number, limit = 20): Promise<ConversationsPage> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request<ConversationsPage>(`/chat/conversations?${qs.toString()}`);
}

/** GET /chat/conversations/:id/messages — history, NEWEST FIRST. */
export function fetchChatMessages(
  conversationId: string,
  page: number,
  limit = 20
): Promise<MessagesPage> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request<MessagesPage>(
    `/chat/conversations/${conversationId}/messages?${qs.toString()}`
  );
}

/** POST /chat/conversations/:id/messages — send text (trimmed, 1–5000). */
export function sendChatMessage(
  conversationId: string,
  content: string
): Promise<SendMessageResult> {
  return request<SendMessageResult>(
    `/chat/conversations/${conversationId}/messages`,
    { method: "POST", body: JSON.stringify({ content }) }
  );
}

/** PATCH /chat/conversations/:id/read — flips unread messages of the other user. */
export function markConversationRead(conversationId: string): Promise<ReadReceipt> {
  return request<ReadReceipt>(`/chat/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
}
