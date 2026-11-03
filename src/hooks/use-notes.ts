"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createFile,
  deleteFile,
  fetchFileTree,
  fetchFilesPage,
  fetchNoteContent,
  fetchNotesPage,
  updateFile,
  updateNoteContent,
} from "@/services/note.service";
import type {
  CreateFileInput,
  FilesListParams,
  NoteDetail,
  NotesListParams,
  UpdateFilePatch,
} from "@/types/note.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const noteKeys = {
  all: () => ["notes"] as const,
  /** Workspace file/folder tree (GET /files/tree). */
  tree: () => ["notes", "tree"] as const,
  files: () => ["notes", "files"] as const,
  filesList: (params: FilesListParams) => ["notes", "files", params] as const,
  notesList: (params: NotesListParams) => ["notes", "list", params] as const,
  /** Rich content of one note, keyed by its 1:1 file id. */
  detail: (fileId: string) => ["notes", "detail", fileId] as const,
};

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

/** Full workspace tree (folders + note files, nested). */
export function useFileTree() {
  return useQuery({
    queryKey: noteKeys.tree(),
    queryFn: fetchFileTree,
  });
}

/** Paginated folder contents (flat rows). */
export function useFilesList(params: FilesListParams) {
  return useQuery({
    queryKey: noteKeys.filesList(params),
    queryFn: () => fetchFilesPage(params),
  });
}

/** Paginated note index with previews (searches content + file name). */
export function useNotesList(params: NotesListParams) {
  return useQuery({
    queryKey: noteKeys.notesList(params),
    queryFn: () => fetchNotesPage(params),
  });
}

/** Rich content of one note. Pass "" to disable until a file is selected. */
export function useNoteDetail(fileId: string) {
  return useQuery({
    queryKey: noteKeys.detail(fileId),
    queryFn: () => fetchNoteContent(fileId),
    enabled: fileId !== "",
    // Drafts live in page state; a re-mount within staleTime is free.
    staleTime: 60_000,
  });
}

/* ------------------------------------------------------------------ */
/* Tree mutations                                                      */
/* ------------------------------------------------------------------ */

function invalidateWorkspace(queryClient: ReturnType<typeof useQueryClient>) {
  // The tree is the unit of truth for structure; notes lists change
  // whenever files appear/rename/vanish (fileName / folderId columns).
  queryClient.invalidateQueries({ queryKey: noteKeys.tree() });
  queryClient.invalidateQueries({ queryKey: noteKeys.files() });
  queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
}

/** Create a folder or a note file (files may seed initial content). */
export function useCreateFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFileInput) => createFile(input),
    onSettled: () => invalidateWorkspace(queryClient),
  });
}

/** Rename and/or move a file/folder. */
export function useUpdateFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateFilePatch }) =>
      updateFile(id, patch),
    onSettled: () => invalidateWorkspace(queryClient),
  });
}

/**
 * Delete a file/folder (cascades to descendants + notes, server-side).
 * Callers should also `queryClient.removeQueries` the detail caches of
 * every deleted subtree id (they don't invalidate themselves — the
 * deleted ids no longer resolve: 404).
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFile(id),
    onSettled: () => invalidateWorkspace(queryClient),
  });
}

/* ------------------------------------------------------------------ */
/* Note content mutation                                               */
/* ------------------------------------------------------------------ */

/** Replace a note's rich HTML body ("" clears the content). */
export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, content }: { fileId: string; content: string }) =>
      updateNoteContent(fileId, content),
    // Optimistic: the detail cache mirrors what the editor already shows.
    onMutate: async ({ fileId, content }) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.detail(fileId) });
      const snapshots = queryClient.getQueriesData<NoteDetail>({
        queryKey: noteKeys.detail(fileId),
      });
      for (const [key, note] of snapshots) {
        if (!note) continue;
        queryClient.setQueryData<NoteDetail>(key, { ...note, content });
      }
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: (_data, _error, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(fileId) });
      queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
    },
  });
}
