import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { EditorView } from "@codemirror/view"
import { tags as t } from "@lezer/highlight"

/**
 * Editor chrome driven entirely by shadcn CSS variables, so light/dark and
 * consumer themes apply automatically. Syntax colours use the `--code-*`
 * tokens (ARCHITECTURE.md ADR-005) shipped with the registry item.
 */
const chrome = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "var(--foreground)",
    fontSize: "0.875rem",
    lineHeight: "1.5",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, monospace)",
    // Minimal custom scrollbars. Standard props cover Firefox + Chromium
    // 121+ (rendered as the built-in thin variant there); the webkit
    // pseudo rules below cover older engines and correlation cases.
    scrollbarWidth: "thin",
    scrollbarColor:
      "color-mix(in oklch, var(--foreground) 25%, transparent) transparent",
  },
  ".cm-scroller::-webkit-scrollbar": {
    width: "10px",
    height: "10px",
  },
  ".cm-scroller::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },
  ".cm-scroller::-webkit-scrollbar-corner": {
    backgroundColor: "transparent",
  },
  ".cm-scroller::-webkit-scrollbar-thumb": {
    backgroundColor: "color-mix(in oklch, var(--foreground) 25%, transparent)",
    border: "2.5px solid transparent",
    borderRadius: "9999px",
    backgroundClip: "padding-box",
  },
  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "color-mix(in oklch, var(--foreground) 40%, transparent)",
  },
  ".cm-content": {
    caretColor: "var(--foreground)",
    padding: "0.5rem 0",
  },
  ".cm-line": { padding: "0 0.75rem" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--foreground)" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection":
    {
      backgroundColor:
        "color-mix(in oklch, var(--primary) 20%, transparent) !important",
    },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklch, var(--accent) 60%, transparent)",
  },
  // `--muted-foreground` on `--background` is the shadcn-approved AA pair;
  // on `--muted` it drops below 4.5:1 (axe color-contrast), so keep the
  // gutter on the page background and separate it with the border only.
  ".cm-gutters": {
    backgroundColor: "var(--background)",
    color: "var(--muted-foreground)",
    borderRight: "1px solid var(--border)",
  },
  ".cm-gutter.cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.5rem 0 0.75rem",
    minWidth: "2.5rem",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklch, var(--accent) 60%, transparent)",
    color: "var(--foreground)",
  },
  ".cm-foldGutter .cm-gutterElement": { padding: "0 0.25rem" },
  ".cm-placeholder": { color: "var(--muted-foreground)" },
  ".cm-matchingBracket": {
    backgroundColor: "color-mix(in oklch, var(--primary) 15%, transparent)",
    outline: "1px solid color-mix(in oklch, var(--primary) 40%, transparent)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  },
  ".cm-panels": {
    backgroundColor: "var(--muted)",
    color: "var(--foreground)",
  },
  ".cm-searchMatch": {
    backgroundColor: "color-mix(in oklch, var(--primary) 25%, transparent)",
  },
  ".cm-selectionMatch": {
    backgroundColor: "color-mix(in oklch, var(--primary) 12%, transparent)",
  },
})

const highlight = HighlightStyle.define([
  {
    tag: [t.keyword, t.modifier, t.operatorKeyword],
    color: "var(--code-keyword)",
  },
  {
    tag: [t.string, t.special(t.string), t.regexp],
    color: "var(--code-string)",
  },
  { tag: [t.number, t.bool, t.null, t.atom], color: "var(--code-number)" },
  {
    tag: [t.comment, t.lineComment, t.blockComment, t.docComment],
    color: "var(--code-comment)",
    fontStyle: "italic",
  },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName), t.labelName],
    color: "var(--code-function)",
  },
  {
    tag: [t.typeName, t.className, t.namespace, t.tagName],
    color: "var(--code-type)",
  },
  {
    tag: [t.propertyName, t.attributeName, t.definition(t.variableName)],
    color: "var(--code-property)",
  },
  { tag: [t.operator, t.punctuation, t.separator], color: "var(--foreground)" },
  { tag: t.heading, fontWeight: "600" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strong, fontWeight: "600" },
  { tag: t.link, color: "var(--code-function)", textDecoration: "underline" },
  { tag: t.invalid, color: "var(--destructive)" },
])

export const codeEditorTheme = [chrome, syntaxHighlighting(highlight)]
