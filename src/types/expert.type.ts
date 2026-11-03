/**
 * Expert domain types (see Brain/api-guide/expert-api-guide.md).
 * Transport lives in services/expert.service.ts; react-query wiring in
 * hooks/use-experts.ts.
 */

export type Expert = {
  id: string;
  userId: string;
  title: string;
  /** Rich HTML from the editor; null/"" means "no description". */
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpertSortBy = "createdAt" | "title";
export type ExpertSortOrder = "asc" | "desc";

export type ExpertListParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy: ExpertSortBy;
  sortOrder: ExpertSortOrder;
};

export type ExpertPage = {
  items: Expert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateExpertInput = {
  title: string;
  /** Omit / null to leave no description. */
  description?: string | null;
};

export type UpdateExpertPatch = Partial<
  Pick<Expert, "title" | "description">
>;
