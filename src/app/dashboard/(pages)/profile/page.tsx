"use client";

import * as React from "react";
import {
  Code,
  File,
  FileCode,
  FileText,
  Folder,
  Globe,
  LayoutGrid,
  ListTodo,
  NotepadText,
  Pencil,
  RotateCcw,
  Save,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Section, SectionCard } from "@/components/shared/Section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteProfileImage,
  useProfile,
  useUpdateProfileImage,
} from "@/hooks/use-profile";
import { IMAGE_UPLOAD_EXTENSIONS } from "@/services/upload.service";
import { PROFILE_IMAGE_MAX_BYTES } from "@/services/profile.service";
import { authClient } from "@/lib/auth-client";
import type { Profile } from "@/types/profile.type";
import { cn } from "cn";

/* ------------------------------------------------------------------ */
/* Count definitions                                                   */
/* ------------------------------------------------------------------ */

const COUNT_META: Record<
  keyof Profile["counts"],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  todos: { label: "Todos", icon: ListTodo },
  notes: { label: "Notes", icon: NotepadText },
  files: { label: "Files", icon: File },
  folders: { label: "Folders", icon: Folder },
  documents: { label: "Documents", icon: FileText },
  components: { label: "Components", icon: LayoutGrid },
  presets: { label: "Presets", icon: Code },
  experts: { label: "Experts", icon: Globe },
  tools: { label: "Tools", icon: Wrench },
  snippets: { label: "Snippets", icon: FileCode },
} as const;

const COUNT_ORDER = Object.keys(COUNT_META) as Array<keyof Profile["counts"]>;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const query = useProfile();
  const data = query.data;

  return (
    <Section
      title="Profile"
      description="Your handle across the platform plus live counts over everything you've made."
      columns={1}
    >
      <IdentityCard profile={data} />
      {query.error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          <span>
            {(query.error as { message?: string } | null)?.message ??
              "Something went wrong."}
          </span>
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto gap-1.5"
            onClick={() => query.refetch()}
          >
            <RotateCcw className="size-3" />
            Retry
          </Button>
        </div>
      )}

      {query.isPending ? (
        <SectionCard title="Counts">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </SectionCard>
      ) : (
        <>
          {data && <CountsCard profile={data} />}
        </>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Identity (BetterAuth session)                                       */
/* ------------------------------------------------------------------ */

/** The username plugin's column on the BetterAuth `user` table. */
type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
};

/** Account identity: avatar, name, email and the unique username. Identity
 * prefers the profile view's `user` block — it is re-read on every request
 * (GET /profile) so the avatar/handle are always fresh from the user row. */
function IdentityCard({ profile }: { profile: Profile | undefined }) {
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const user: SessionUser = session?.user ?? {};

  const name =
    profile?.user.name?.trim() || user.name?.trim() || "Signed in user";
  const email = profile?.user.email ?? user.email ?? "";
  const username = profile?.user.username ?? user.username?.trim() ?? null;
  const image = profile?.user.image ?? user.image ?? null;

  const [open, setOpen] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState("");
  const [usernameDraft, setUsernameDraft] = React.useState("");
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [usernameError, setUsernameError] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const updateMutation = useMutation({
    mutationFn: async (payload: { name: string; username?: string }) => {
      const res = await authClient.updateUser(payload);
      if (res.error) {
        throw new Error(res.error.message ?? "Couldn't save changes.");
      }
    },
    onSuccess: async () => {
      setOpen(false);
      await refetchSession();
    },
  });

  const uploadMutation = useUpdateProfileImage();
  const deleteMutation = useDeleteProfileImage();

  /* Image mutations change the SESSION user too (sidebar, header, chat
   * widget) — refresh the session so every BetterAuth-backed avatar
   * across the shell picks up the new URL. */
  React.useEffect(() => {
    if (uploadMutation.isSuccess || deleteMutation.isSuccess) {
      void refetchSession();
    }
  }, [uploadMutation.isSuccess, deleteMutation.isSuccess, refetchSession]);

  /* Client-side pre-filter mirroring the server contract: jpg/png/webp/gif,
   * ≤ 10 MB. Real type validation happens by magic bytes on the backend. */
  const validateImageFile = (file: File): string | null => {
    const ext = file.name.toLowerCase().split(".").pop() ?? "";
    if (!IMAGE_UPLOAD_EXTENSIONS.includes(ext as never)) {
      return "Images only: jpg, png, webp or gif.";
    }
    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      return "Image must be 10 MB or smaller.";
    }
    return null;
  };

  const handleFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file after a failure
    if (!file || uploadMutation.isPending) return;
    const problem = validateImageFile(file);
    if (problem) {
      setImageError(problem);
      return;
    }
    setImageError(null);
    uploadMutation.mutate(file);
  };

  const clearImage = () => {
    if (deleteMutation.isPending) return;
    setImageError(null);
    deleteMutation.mutate();
  };

  const openEditor = () => {
    setNameDraft(profile?.user.name?.trim() ?? user.name?.trim() ?? "");
    setUsernameDraft(username ?? "");
    setNameError(null);
    setUsernameError(null);
    setImageError(null);
    updateMutation.reset();
    uploadMutation.reset();
    deleteMutation.reset();
    setOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (updateMutation.isPending) return;

    const nextName = nameDraft.trim();
    const nextUsername = usernameDraft.trim().toLowerCase();

    if (!nextName) {
      setNameError("Name can't be empty.");
      return;
    }
    // Same contract as the backend username plugin: 3–30 chars of
    // [a-z0-9_.] after normalization. Empty = leave unchanged.
    if (nextUsername && !/^[a-z0-9_.]{3,30}$/.test(nextUsername)) {
      setUsernameError("3–30 characters: a–z, 0–9, underscore, dot.");
      return;
    }

    const nameUnchanged =
      nextName === (profile?.user.name?.trim() ?? user.name?.trim() ?? "");
    const usernameUnchanged = nextUsername === (username ?? "");
    if (nameUnchanged && usernameUnchanged) {
      setOpen(false);
      return;
    }

    setNameError(null);
    setUsernameError(null);
    updateMutation.mutate({
      name: nextName,
      ...(usernameUnchanged || !nextUsername ? {} : { username: nextUsername }),
    });
  };

  const imagePending = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <SectionCard
        header={
          <div className="flex min-w-0 flex-wrap items-center gap-4 px-4">
            {/* Click the avatar to upload directly */}
            <button
              type="button"
              className="group relative size-14 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Change profile image"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="size-14">
                {image && <AvatarImage src={image} alt={name} />}
                <AvatarFallback>{initialsOf(name)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute inset-0 grid place-items-center overflow-hidden rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                  imagePending && "opacity-100"
                )}
              >
                {imagePending ? (
                  <RotateCcw className="size-4 animate-spin text-white" />
                ) : (
                  <Pencil className="size-4 text-white" />
                )}
              </span>
            </button>

            {/* Name + email — truncated, pinned next to the avatar */}
            <div className="grid min-w-0 gap-1">
              <span className="font-heading truncate text-base font-medium leading-snug">
                {name}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {email}
              </span>
            </div>

            {/* Handle + edit pinned right */}
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {username ? (
                <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                  @{username}
                </code>
              ) : (
                <code className="rounded bg-muted px-2 py-1 font-mono text-sm text-muted-foreground">
                  @no-username-yet
                </code>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Edit profile"
                onClick={openEditor}
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          </div>
        }
      />

      {/* Edit image + name + username */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update your image, display name or unique handle. Email stays as
              signed up.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-14">
                {image && <AvatarImage src={image} alt={name} />}
                <AvatarFallback>{initialsOf(name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imagePending}
                  >
                    <Pencil className="size-3.5" />
                    {image ? "Change image" : "Upload image"}
                  </Button>
                  {image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={clearImage}
                      disabled={imagePending}
                    >
                      <RotateCcw className="size-3.5" />
                      Remove image
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  jpg/png/webp/gif · max 10 MB
                </p>
                {(imageError ||
                  uploadMutation.error ||
                  deleteMutation.error) && (
                  <p className="text-xs text-destructive">
                    {imageError ??
                      uploadMutation.error?.message ??
                      deleteMutation.error?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={nameDraft}
                onChange={(event) => {
                  setNameDraft(event.target.value);
                  setNameError(null);
                  updateMutation.reset();
                }}
                maxLength={255}
                aria-invalid={Boolean(nameError)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-username">Username</Label>
              <Input
                id="profile-username"
                value={usernameDraft}
                onChange={(event) => {
                  setUsernameDraft(event.target.value.toLowerCase());
                  setUsernameError(null);
                  updateMutation.reset();
                }}
                maxLength={30}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={Boolean(usernameError)}
              />
              <p className="text-xs text-muted-foreground">
                3–30 characters: a–z, 0–9, underscore, dot. Left empty, it
                stays unchanged.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={imagePending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gap-1.5"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <RotateCcw className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save changes
              </Button>
            </DialogFooter>
          </form>
          {updateMutation.error && (
            <p className="text-sm text-destructive">
              {updateMutation.error.message}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden picker shared by the avatar button and the dialog */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFilePicked}
      />
    </>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    parts.length === 1
      ? parts[0].slice(0, 2)
      : parts.slice(0, 2).map((part) => part[0]).join("")
  ).toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Counts                                                              */
/* ------------------------------------------------------------------ */

function CountsCard({ profile }: { profile: Profile }) {
  return (
    <SectionCard
      title="Counts"
      description="How many rows you own in each domain table right now."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {COUNT_ORDER.map((key) => {
          const meta = COUNT_META[key];
          const Icon = meta.icon;
          return (
            <div
              key={key}
              className="flex flex-col items-start gap-2 rounded-lg border bg-muted/30 p-3"
            >
              <Icon className="size-4 text-muted-foreground" />
              <span className="font-heading text-2xl font-semibold tabular-nums">
                {profile.counts[key]}
              </span>
              <span className="text-xs text-muted-foreground">
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
