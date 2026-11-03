/**
 * Tool domain types (see Brain/api-guide/tool-api-guide.md).
 * Transport lives in services/tool.service.ts; react-query wiring in
 * hooks/use-tools.ts.
 */

export type Tool = {
  id: string;
  userId: string;
  name: string;
  /** Plain text; null/"" means "no description". */
  description: string | null;
  /** Valid http/https URL, ≤ 2048 chars. */
  downloadLink: string;
  createdAt: string;
  updatedAt: string;
};

export type ToolSortBy = "createdAt" | "name";
export type ToolSortOrder = "asc" | "desc";

export type ToolListParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy: ToolSortBy;
  sortOrder: ToolSortOrder;
};

export type ToolPage = {
  items: Tool[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateToolInput = {
  name: string;
  /** Omit / null to leave no description. */
  description?: string | null;
  downloadLink: string;
};

export type UpdateToolPatch = Partial<
  Pick<Tool, "name" | "description" | "downloadLink">
>;
