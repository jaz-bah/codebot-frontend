/**
 * Notes workspace service — transport for the /files + /notes NestJS
 * endpoints (Brain/api-guide/notes-api-guide.md). No react-query / UI
 * code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  CreateFileInput,
  DeleteFileResult,
  FilePage,
  FileRow,
  FilesListParams,
  NoteDetail,
  NotePage,
  NotesListParams,
  UpdateFilePatch,
  WorkspaceFileNode,
} from "@/types/note.type";

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
/* Files — /files (folders + note files)                               */
/* ------------------------------------------------------------------ */

/** GET /files/tree — full workspace tree, one query. */
export function fetchFileTree(): Promise<WorkspaceFileNode[]> {
  return request<WorkspaceFileNode[]>("/files/tree");
}

function filesQuerystring(params: FilesListParams): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sortBy", params.sortBy);
  qs.set("sortOrder", params.sortOrder);
  if (params.type) qs.set("type", params.type);
  if (params.search) qs.set("search", params.search);
  if (params.parentId) qs.set("parentId", params.parentId);
  return qs.toString();
}

/** GET /files — folder contents (paginated); omit parentId → root. */
export function fetchFilesPage(params: FilesListParams): Promise<FilePage> {
  return request<FilePage>(`/files?${filesQuerystring(params)}`);
}

/** POST /files — create a folder or a note file (files get an empty
 * note row seeded unless `content` is provided). */
export function createFile(input: CreateFileInput): Promise<FileRow> {
  return request<FileRow>("/files", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /files/:id — rename and/or move. */
export function updateFile(id: string, patch: UpdateFilePatch): Promise<FileRow> {
  return request<FileRow>(`/files/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** DELETE /files/:id — cascades to all descendants + their notes;
 * sibling positions compact server-side. */
export function deleteFile(id: string): Promise<DeleteFileResult> {
  return request<DeleteFileResult>(`/files/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* Notes — /notes (rich content, addressed by the 1:1 file id)          */
/* ------------------------------------------------------------------ */

function notesQuerystring(params: NotesListParams): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sortBy", params.sortBy);
  qs.set("sortOrder", params.sortOrder);
  if (params.search) qs.set("search", params.search);
  if (params.folderId) qs.set("folderId", params.folderId);
  return qs.toString();
}

/** GET /notes — paginated note index with content previews. */
export function fetchNotesPage(params: NotesListParams): Promise<NotePage> {
  return request<NotePage>(`/notes?${notesQuerystring(params)}`);
}

/** GET /notes/:fileId — full rich HTML content. */
export function fetchNoteContent(fileId: string): Promise<NoteDetail> {
  return request<NoteDetail>(`/notes/${fileId}`);
}

/** PATCH /notes/:fileId — replace the body ("" clears it). */
export function updateNoteContent(
  fileId: string,
  content: string
): Promise<NoteDetail> {
  return request<NoteDetail>(`/notes/${fileId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}
