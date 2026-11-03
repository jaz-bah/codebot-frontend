"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchSettings,
  resetSettings,
  updateSettings,
} from "@/services/setting.service";
import type { SettingsPatch } from "@/types/setting.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const settingKeys = {
  all: () => ["settings"] as const,
  detail: () => ["settings", "detail"] as const,
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Masked settings for the signed-in user (null = not configured). */
export function useSettings() {
  return useQuery({
    queryKey: settingKeys.detail(),
    queryFn: () => fetchSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: SettingsPatch) => updateSettings(patch),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.detail() });
    },
  });
}

export function useResetSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resetSettings(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.detail() });
    },
  });
}
