import type { CodeEditorLanguage } from "@/components/code-editor";
import type { WorkspaceFile } from "@/components/editor-workspace";

type PathOnly = {
  /** Slash path relative to a component root, e.g. "assets/logo.svg". */
  path: string;
};

/**
 * Turns flat slash paths into a nested `WorkspaceFile` tree for the
 * `EditorWorkbench`. File ids are the full path; folder ids get a
 * trailing slash so both stay unique.
 */
export function buildFileTree(files: PathOnly[]): WorkspaceFile[] {
  const root: WorkspaceFile[] = [];
  for (const file of files) {
    insertNode(root, 0, file.path.split("/"), file.path);
  }
  return root;
}

function insertNode(
  into: WorkspaceFile[],
  depth: number,
  segments: string[],
  path: string
): void {
  const name = segments[depth] ?? "";
  if (name === "") return;

  if (depth === segments.length - 1) {
    if (!into.some((node) => node.type === "file" && node.name === name)) {
      into.push({ id: path, name, type: "file" });
    }
    return;
  }

  let folder = into.find(
    (node) => node.type === "folder" && node.name === name
  );
  if (!folder) {
    folder = {
      id: segments.slice(0, depth + 1).join("/") + "/",
      name,
      type: "folder",
      children: [],
    };
    into.push(folder);
  }
  folder.children = folder.children ?? [];
  insertNode(folder.children, depth + 1, segments, path);
}

/** Every folder id in the tree (used to expand the tree on mount). */
export function collectFolderIds(files: WorkspaceFile[]): string[] {
  return files.flatMap((node) =>
    node.type === "folder"
      ? [node.id, ...collectFolderIds(node.children ?? [])]
      : []
  );
}

const EXTENSION_LANGUAGES: Record<string, CodeEditorLanguage> = {
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  js: "javascript",
  mjs: "javascript",
  ts: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  json: "json",
  md: "markdown",
  svg: "xml",
  xml: "xml",
  yml: "yaml",
  yaml: "yaml",
  py: "python",
  sh: "shell",
  sql: "sql",
};

/** Maps a file name to the CodeMirror language id for the editor. */
export function languageForFile(name: string): CodeEditorLanguage {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return "plaintext";
  const extension = name.slice(dot + 1).toLowerCase();
  return EXTENSION_LANGUAGES[extension] ?? "plaintext";
}
