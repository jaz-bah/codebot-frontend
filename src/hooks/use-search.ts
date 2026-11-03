"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchSearch } from "@/services/search.service";
import type { SearchParams, SearchResponse } from "@/types/search.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const searchKeys = {
  all: () => ["search"] as const,
  /** One live query per (term, per-scope-limit) shape. */
  results: (params: SearchParams) => ["search", params] as const,
};

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

/** `GET /search` for the topbar portal. The component layer debounces;
 * the hook just fetches whatever shape it is handed (placeholder data
 * keeps the dropdown stable between keystrokes). */
export function useSearch(params: SearchParams) {
  return useQuery<SearchResponse>({
    queryKey: searchKeys.results(params),
    queryFn: () => fetchSearch(params),
    enabled: params.q.trim().length > 0,
    placeholderData: keepPreviousData,
    /** Overlays want fresh hits on every open, not 60s-cached ones. */
    staleTime: 15_000,
  });
}
