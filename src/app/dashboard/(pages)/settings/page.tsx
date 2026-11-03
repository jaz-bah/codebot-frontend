"use client";

import * as React from "react";
import {
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  TriangleAlert,
} from "lucide-react";

import { Section, SectionCard } from "@/components/shared/Section";
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
  useResetSettings,
  useSettings,
  useUpdateSettings,
} from "@/hooks/use-settings";
import type { SettingsPatch, Settings, SettingsField } from "@/types/setting.type";
import { cn } from "cn";

/* ------------------------------------------------------------------ */
/* Field definitions                                                   */
/* ------------------------------------------------------------------ */

type SecretField = Exclude<SettingsField, "cloudinaryCloudName">;

/** Copy per secret input, keyed by field id. */
const SECRET_META: Record<
  SecretField,
  { label: string; placeholder: string; hint: string }
> = {
  openRouterApiKey: {
    label: "API key",
    placeholder: "sk-or-v1-…",
    hint: "Used server-side to call OpenRouter on your behalf.",
  },
  cloudinaryApiKey: {
    label: "API key",
    placeholder: "123456789012345",
    hint: "Pairs with your Cloudinary cloud name.",
  },
  cloudinaryApiSecret: {
    label: "API secret",
    placeholder: "abcdef0123456789",
    hint: "Kept encrypted at rest — never returned by the API.",
  },
};

const OPENROUTER_FIELDS: SecretField[] = ["openRouterApiKey"];
const CLOUDINARY_FIELDS: SecretField[] = ["cloudinaryApiKey", "cloudinaryApiSecret"];
const ALL_SECRET_FIELDS: SecretField[] = [
  ...OPENROUTER_FIELDS,
  ...CLOUDINARY_FIELDS,
];

type FormValues = {
  secrets: Record<SecretField, string>;
  visibility: Record<SecretField, boolean>;
  /** Explicit "clear on save" flags for configured secrets. */
  clear: Record<SecretField, boolean>;
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const query = useSettings();
  const data = query.data;

  return (
    <Section
      title="Settings"
      description="Third-party credentials the platform uses later, server-side. Secrets are AES-256-GCM encrypted at rest and never returned as plaintext."
      columns={1}
    >
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
        <>
          <SectionCard title="OpenRouter">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Cloudinary">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : (
        /* Remount on fresh data so the form starts pristine — masked
         * previews and cloud name (returned as-is) stay current. */
        <SettingsForm key={data?.updatedAt ?? "empty"} settings={data} />
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

function SettingsForm({ settings }: { settings?: Settings }) {
  const saveMutation = useUpdateSettings();
  const resetMutation = useResetSettings();

  const [confirmReset, setConfirmReset] = React.useState(false);

  /* Cloudinary cloud name is non-secret (returned as-is) so prefill it. */
  const [cloudName, setCloudName] = React.useState(
    settings?.cloudinaryCloudName ?? ""
  );
  /* Secrets start empty: leave blank = keep what's stored. */
  const [secrets, setSecrets] = React.useState<FormValues["secrets"]>({
    openRouterApiKey: "",
    cloudinaryApiKey: "",
    cloudinaryApiSecret: "",
  });
  const [show, setShow] = React.useState<FormValues["visibility"]>({
    openRouterApiKey: false,
    cloudinaryApiKey: false,
    cloudinaryApiSecret: false,
  });
  const [clear, setClear] = React.useState<FormValues["clear"]>({
    openRouterApiKey: false,
    cloudinaryApiKey: false,
    cloudinaryApiSecret: false,
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<SecretField | "cloudinaryCloudName", string>>
  >({});

  const patch = buildPatch(cloudName, secrets, clear, settings);
  const isDirty = patch !== null && Object.keys(patch).length > 0;

  const validate = () => {
    const next: typeof errors = {};
    const name = cloudName.trim();
    if (name.length > 255) {
      next.cloudinaryCloudName = "Cloud name must be 1–255 characters.";
    }
    for (const id of ALL_SECRET_FIELDS) {
      const value = clear[id] ? "" : secrets[id].trim();
      if (value && (value.length < 4 || value.length > 512)) {
        next[id] = "Secret must be 4–512 characters.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (saveMutation.isPending || !patch || !validate()) return;
    saveMutation.mutate(patch);
  };

  const doReset = () => {
    resetMutation.mutate(undefined, {
      onSuccess: () => setConfirmReset(false),
    });
  };

  const renderSecretField = (id: SecretField) => {
    const meta = SECRET_META[id];
    return (
      <SecretInput
        id={id}
        label={meta.label}
        placeholder={meta.placeholder}
        hint={meta.hint}
        value={secrets[id]}
        visible={show[id]}
        mask={settings?.[id] ?? null}
        clearing={clear[id]}
        error={errors[id]}
        onValueChange={(value) =>
          setSecrets((prev) => ({ ...prev, [id]: value }))
        }
        onToggleVisible={() =>
          setShow((prev) => ({ ...prev, [id]: !prev[id] }))
        }
        onClearChange={(clearing) =>
          setClear((prev) => ({ ...prev, [id]: clearing }))
        }
      />
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* OpenRouter block */}
        <SectionCard
          title="OpenRouter"
          description="Leave the key blank to keep the stored value. Use Clear to unset it on save."
        >
          <div className="flex flex-col gap-4">
            {OPENROUTER_FIELDS.map(renderSecretField)}
          </div>
        </SectionCard>

        {/* Cloudinary block */}
        <SectionCard
          title="Cloudinary"
          description="Leave a secret blank to keep the stored value. Use Clear to unset one on save."
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cloudinaryCloudName">Cloud name</Label>
              <Input
                id="cloudinaryCloudName"
                value={cloudName}
                onChange={(event) => setCloudName(event.target.value)}
                placeholder="my-cloud"
                aria-invalid={Boolean(errors.cloudinaryCloudName)}
              />
              {errors.cloudinaryCloudName && (
                <p className="text-xs text-destructive">
                  {errors.cloudinaryCloudName}
                </p>
              )}
            </div>
            {CLOUDINARY_FIELDS.map(renderSecretField)}
          </div>
        </SectionCard>

        {(saveMutation.error || resetMutation.error) && (
          <p className="text-sm text-destructive">
            {saveMutation.error?.message ??
              resetMutation.error?.message ??
              "Something went wrong."}
          </p>
        )}
        {saveMutation.isSuccess && saveMutation.data && (
          <p className="text-sm text-success">
            Saved — stored values never come back, only the masked view.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              className="gap-1.5"
              disabled={!isDirty}
            >
              {saveMutation.isPending ? (
                <RotateCcw className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save changes
            </Button>
            {settings?.updatedAt && (
              <span className="text-xs text-muted-foreground">
                Last updated{" "}
                {new Date(settings.updatedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmReset(true)}
          >
            Reset all credentials
          </Button>
        </div>
      </form>

      {/* Confirm wipe */}
      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all credentials?</DialogTitle>
            <DialogDescription>
              This deletes stored OpenRouter and Cloudinary credentials for
              your account. They cannot be recovered — enter them again if
              needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={resetMutation.isPending}
              onClick={doReset}
            >
              {resetMutation.isPending ? "Resetting…" : "Delete everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Secret input                                                        */
/* ------------------------------------------------------------------ */

function SecretInput({
  id,
  label,
  placeholder,
  hint,
  value,
  visible,
  mask,
  clearing,
  error,
  onValueChange,
  onToggleVisible,
  onClearChange,
}: {
  id: SecretField;
  label: string;
  placeholder: string;
  hint: string;
  value: string;
  visible: boolean;
  /** Masked preview from the API, null when not configured. */
  mask: string | null;
  clearing: boolean;
  error?: string;
  onValueChange: (value: string) => void;
  onToggleVisible: () => void;
  onClearChange: (clearing: boolean) => void;
}) {
  const isConfigured = mask !== null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`setting-${id}`}>{label}</Label>
        {isConfigured && value === "" && (
          <button
            type="button"
            className={cn(
              "text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline",
              clearing && "text-destructive"
            )}
            onClick={() => onClearChange(!clearing)}
          >
            {clearing ? "Will be cleared — undo" : `Clear (${mask})`}
          </button>
        )}
      </div>
      <div className="relative">
        <Input
          id={`setting-${id}`}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          className="pr-9"
          autoComplete="off"
          disabled={clearing}
          aria-invalid={Boolean(error)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-1.5 top-0.5 text-muted-foreground"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          onClick={onToggleVisible}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : clearing ? (
          <span className="text-destructive">
            Stored value will be removed on save.
          </span>
        ) : (
          <>
            {hint}
            {isConfigured && " Configured: "}
          </>
        )}
        {!error && !clearing && isConfigured && (
          <code className="rounded bg-muted px-1 py-0.5 font-mono">{mask}</code>
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Patch builder                                                       */
/* ------------------------------------------------------------------ */

/** Builds the PATCH payload from the form state:
 * - non-empty trimmed value → send it
 * - empty + previously configured → omit (keep stored value);
 *   only the explicit Clear picker sends `null`
 * - never set → omit
 */
function buildPatch(
  cloudName: string,
  secrets: FormValues["secrets"],
  clear: FormValues["clear"],
  settings?: Settings
): SettingsPatch | null {
  if (!settings) return null;
  const patch: SettingsPatch = {};
  const hasOwn = (field: SettingsField) =>
    settings[field] !== null && settings[field] !== undefined;

  const name = cloudName.trim();
  if (name) {
    if (name !== (settings.cloudinaryCloudName ?? "")) {
      patch.cloudinaryCloudName = name;
    }
  } else if (hasOwn("cloudinaryCloudName")) {
    patch.cloudinaryCloudName = null;
  }

  for (const id of ALL_SECRET_FIELDS) {
    const value = secrets[id].trim();
    if (clear[id] && hasOwn(id)) {
      patch[id] = null;
    } else if (value) {
      patch[id] = value;
    }
  }

  return patch;
}
