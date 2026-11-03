/**
 * Setting domain types (see Brain/api-guide/settings-api-guide.md).
 * Transport lives in services/setting.service.ts; react-query wiring in
 * hooks/use-settings.ts.
 */

/**
 * Masked settings view. Secrets NEVER arrive as plaintext — values are
 * masked previews ("sk-…f3ak") or null when not configured.
 */
export type Settings = {
  openRouterApiKey: string | null;
  cloudinaryCloudName: string | null;
  cloudinaryApiKey: string | null;
  cloudinaryApiSecret: string | null;
  updatedAt: string;
};

/**
 * Partial upsert: any subset of the four fields. Secrets must be 4–512
 * chars after trim; cloud name 1–255. `null` clears a stored credential.
 */
export type SettingsPatch = {
  openRouterApiKey?: string | null;
  cloudinaryCloudName?: string | null;
  cloudinaryApiKey?: string | null;
  cloudinaryApiSecret?: string | null;
};

/** Field identifiers for the settings form. */
export type SettingsField =
  | "openRouterApiKey"
  | "cloudinaryCloudName"
  | "cloudinaryApiKey"
  | "cloudinaryApiSecret";
