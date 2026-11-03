/**
 * Profile domain types (see Brain/api-guide/profile-api-guide.md).
 * Transport lives in services/profile.service.ts; react-query wiring in
 * hooks/use-profile.ts.
 */

/** LIVE row counts over every domain table — computed per request. */
export type ProfileCounts = {
  todos: number;
  notes: number;
  files: number;
  folders: number;
  documents: number;
  components: number;
  presets: number;
  experts: number;
  tools: number;
  snippets: number;
};

/** The BetterAuth user block echoed inside every profile payload. `image`
 * is set via the multipart PATCH /profile/image (Cloudinary URL); `username`
 * is the unique auth handle. */
export type ProfileUser = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  image: string | null;
};

/** Profile view: user identity, auto-generated or claimed nickname and live
 * counts. Returned by GET/PATCH /profile and both image endpoints. */
export type Profile = {
  /** Unique handle — grammar `[a-z0-9_]{3,24}`. */
  nickname: string;
  /** Fresh re-read of the auth user row (never a stale mirror). */
  user: ProfileUser;
  counts: ProfileCounts;
  createdAt: string;
  updatedAt: string;
};

/** PATCH /profile — claim a custom nickname (lower-cased server-side). */
export type ProfilePatch = {
  nickname: string;
};
