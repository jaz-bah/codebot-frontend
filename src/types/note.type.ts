/**
 * Notes workspace types (see Brain/api-guide/notes-api-guide.md).
 * Transport lives in services/note.service.ts; react-query wiring in
 * hooks/use-notes.ts.
 */

export const WORKSPACE_NODE_TYPES = ["folder", "file"] as const;
export type WorkspaceNodeType = (typeof WORKSPACE_NODE_TYPES)[number];

/**
 * One row of the `workspace_file` tree. Folders carry `children`
 * (GET /files/tree returns the full nested tree in one response);
 * bare rows from POST/PATCH are `FileRow` (no children).
 */
export type WorkspaceFileNode = {
  id: string;
  userId: string;
  /** 1–255 chars; no `/` or `\`; files must end `.html`. */
  name: string;
  type: WorkspaceNodeType;
  /** Self-FK; `null` = workspace root. */
  parentId: string | null;
  /** 0-based, gap-free ordering rank among siblings. */
  position: number;
  createdAt: string;
  updatedAt: string;
  children: WorkspaceFileNode[];
};

/** Flat file row as returned by POST /files and PATCH /files/:id. */
export type FileRow = Omit<WorkspaceFileNode, "children">;

export type FileSortBy = "position" | "name" | "createdAt" | "updatedAt";

export type FilesListParams = {
  // Parent folder id; omitted/null = workspace root.
  parentId?: string | null;
  type?: WorkspaceNodeType;
  search?: string;
  sortBy: FileSortBy;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
};

export type FilePage = {
  items: FileRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateFileInput = {
  name: string;
  type: WorkspaceNodeType;
  /** Omitted/null → workspace root. */
  parentId?: string | null;
  /** Files only: optional initial note content (seeds the note row). */
  content?: string;
};

/** Rename and/or move; at least one field must be set. */
export type UpdateFilePatch = {
  name?: string;
  parentId?: string | null;
};

export type DeleteFileResult = { deleted: boolean; id: string };

/** Files list / note list share the pagination envelope. */
export type ListPage<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** A content row — one per `file` node of type "file". */
export type NoteDetail = {
  id: string;
  /** Addressed 1:1 by its workspace file id. */
  fileId: string;
  fileName: string;
  folderId: string | null;
  /** Rich HTML, ≤ 500 KB, stored and returned verbatim. */
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteSortBy = "updatedAt" | "createdAt" | "fileName";

export type NotesListParams = {
  /** ILIKE over note content and file name. */
  search?: string;
  folderId?: string | null;
  sortBy: NoteSortBy;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
};

export type NoteListItem = {
  id: string;
  fileId: string;
  fileName: string;
  folderId: string | null;
  /** Content tags stripped, trimmed to 200 chars — raw content never lists. */
  preview: string;
  createdAt: string;
  updatedAt: string;
};

export type NotePage = ListPage<NoteListItem>;
