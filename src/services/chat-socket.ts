/**
 * Chat socket — the shared Socket.IO client for the /chat namespace
 * (Brain/api-guide/chat-api-guide.md, "Real-time"). Same HTTP server as the
 * REST API (http://localhost:3000), auth rides the BetterAuth session cookie
 * via `withCredentials`. Server events fire after commit; messages are
 * always SENT via REST — this socket is receive-only (+ ping/whoami acks).
 */
import { io, type Socket } from "socket.io-client";

import { API_URL } from "@/lib/auth-client";

import type {
  ConversationUpdatedEvent,
  MessageNewEvent,
  MessagesReadEvent,
} from "@/types/chat.type";

/* ------------------------------------------------------------------ */
/* Event maps                                                          */
/* ------------------------------------------------------------------ */

type ChatServerToClientEvents = {
  "message:new": (payload: MessageNewEvent) => void;
  "conversation:updated": (payload: ConversationUpdatedEvent) => void;
  "messages:read": (payload: MessagesReadEvent) => void;
};

/** Client → server ack calls (no `{ event, data }` shapes — adapter quirk). */
type ChatClientToServerEvents = {
  ping: (ack: (result: { connectedAs: string }) => void) => void;
  whoami: (ack: (result: { userId: string }) => void) => void;
};

export type ChatSocket = Socket<ChatServerToClientEvents, ChatClientToServerEvents>;

/* ------------------------------------------------------------------ */
/* Singleton                                                           */
/* ------------------------------------------------------------------ */

let socket: ChatSocket | null = null;

/** One socket per tab; `autoConnect: false` — the consumer connects it. */
export function getChatSocket(): ChatSocket {
  if (!socket) {
    socket = io(`${API_URL}/chat`, {
      withCredentials: true,
      autoConnect: false,
      // Session was already verified at REST; a lazy connect avoids the
      // very first handshake racing the cookie on a cold tab.
      transports: ["polling", "websocket"],
    });
  }
  return socket;
}

/** Drop the singleton (used by tests / hard resets). */
export function resetChatSocket(): void {
  socket?.disconnect();
  socket = null;
}
