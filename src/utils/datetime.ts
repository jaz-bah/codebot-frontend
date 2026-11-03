/** Pure date/time helpers — no side effects, no React, no fetching. */

/** ISO string → value for `<input type="datetime-local">`. */
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

/** `<input type="datetime-local">` value → ISO string (or null). */
export function localInputToIso(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
