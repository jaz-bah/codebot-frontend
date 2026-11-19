/**
 * Line-based text comparison for /dev-tools/text-compare.
 *
 * Strategy, in order of cost:
 *  1. Trim the common prefix and suffix with a single scan — for an edit in a
 *     large file this leaves only the touched region to align.
 *  2. Run an LCS dynamic program over what is left (direction matrix in a
 *     Uint8Array, rolling length rows) and walk it back into an edit script.
 *  3. If the remaining block is still enormous, degrade to a block replace
 *     (all removed + all added) instead of allocating hundreds of megabytes.
 *
 * The work is therefore bounded: the worst case is `MAX_DIFF_CELLS` cell
 * visits, which keeps the main thread responsive on very large pastes.
 */

export interface CompareOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

export type DiffRowKind = "equal" | "add" | "remove" | "modify";

export interface DiffLine {
  /** 1-based line number in its own document. */
  number: number;
  text: string;
}

export interface DiffRow {
  kind: DiffRowKind;
  /** Left ("original") side; null on pure additions. */
  left: DiffLine | null;
  /** Right ("changed") side; null on pure removals. */
  right: DiffLine | null;
}

export interface DiffStats {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  /** Rendered rows (a modified pair counts once). */
  totalRows: number;
  changes: number;
  /** Unchanged share of the rows, 0–100. */
  similarity: number;
  /** True when the inputs were too large to align line by line. */
  coarse: boolean;
}

export interface CompareResult {
  rows: DiffRow[];
  stats: DiffStats;
}

/**
 * Upper bound on LCS cells (n+1 × m+1). 4M cells ≈ 4 MB for the direction
 * matrix and well under a frame of work; beyond this the diff degrades to a
 * block replace instead of freezing the tab.
 */
const MAX_DIFF_CELLS = 4_000_000;

/** Splits into lines, normalising CRLF/CR to LF. "" has zero lines. */
export function splitLines(text: string): string[] {
  if (!text) return [];
  return text.replace(/\r\n?/g, "\n").split("\n");
}

function normalizeLine(line: string, options: CompareOptions): string {
  let value = line;
  if (options.ignoreWhitespace) value = value.replace(/\s+/g, " ").trim();
  if (options.ignoreCase) value = value.toLowerCase();
  return value;
}

type EditType = "equal" | "delete" | "insert";

interface Edit {
  type: EditType;
  /** Index inside the segment being diffed. */
  i: number;
  j: number;
}

function equalRow(rawA: string[], rawB: string[], aIndex: number, bIndex: number): DiffRow {
  return {
    kind: "equal",
    left: { number: aIndex + 1, text: rawA[aIndex] },
    right: { number: bIndex + 1, text: rawB[bIndex] },
  };
}

function removeRow(rawA: string[], aIndex: number): DiffRow {
  return { kind: "remove", left: { number: aIndex + 1, text: rawA[aIndex] }, right: null };
}

function addRow(rawB: string[], bIndex: number): DiffRow {
  return { kind: "add", left: null, right: { number: bIndex + 1, text: rawB[bIndex] } };
}

function modifyRow(rawA: string[], rawB: string[], aIndex: number, bIndex: number): DiffRow {
  return {
    kind: "modify",
    left: { number: aIndex + 1, text: rawA[aIndex] },
    right: { number: bIndex + 1, text: rawB[bIndex] },
  };
}

/** Turns a hunk of deletes/inserts into paired "modified" rows plus leftovers. */
function pushHunk(
  rows: DiffRow[],
  deletes: number[],
  inserts: number[],
  rawA: string[],
  rawB: string[]
): void {
  const pairs = Math.min(deletes.length, inserts.length);
  for (let p = 0; p < pairs; p += 1) {
    rows.push(modifyRow(rawA, rawB, deletes[p], inserts[p]));
  }
  for (let p = pairs; p < deletes.length; p += 1) {
    rows.push(removeRow(rawA, deletes[p]));
  }
  for (let p = pairs; p < inserts.length; p += 1) {
    rows.push(addRow(rawB, inserts[p]));
  }
}

/** Whole-range block replace — the bounded fallback for enormous inputs. */
function coarseRows(
  rawA: string[],
  rawB: string[],
  aFrom: number,
  aTo: number,
  bFrom: number,
  bTo: number
): DiffRow[] {
  const rows: DiffRow[] = [];
  const deletes = Array.from({ length: aTo - aFrom }, (_, k) => aFrom + k);
  const inserts = Array.from({ length: bTo - bFrom }, (_, k) => bFrom + k);
  pushHunk(rows, deletes, inserts, rawA, rawB);
  return rows;
}

/**
 * Aligns rawA[aFrom, aTo) with rawB[bFrom, bTo) and emits rows.
 * `coarse` comes back true when the block was too big to align precisely.
 */
function diffSegment(
  rawA: string[],
  normA: string[],
  rawB: string[],
  normB: string[],
  aFrom: number,
  aTo: number,
  bFrom: number,
  bTo: number
): { rows: DiffRow[]; coarse: boolean } {
  const n = aTo - aFrom;
  const m = bTo - bFrom;

  if (n === 0 && m === 0) return { rows: [], coarse: false };
  if (n === 0) {
    return {
      rows: Array.from({ length: m }, (_, k) => addRow(rawB, bFrom + k)),
      coarse: false,
    };
  }
  if (m === 0) {
    return {
      rows: Array.from({ length: n }, (_, k) => removeRow(rawA, aFrom + k)),
      coarse: false,
    };
  }

  const cells = (n + 1) * (m + 1);
  if (cells > MAX_DIFF_CELLS) {
    return {
      rows: coarseRows(rawA, rawB, aFrom, aTo, bFrom, bTo),
      coarse: true,
    };
  }

  // LCS length matrix, but only the direction (1 = diagonal/equal,
  // 2 = up/delete, 3 = left/insert) is kept — one byte per cell.
  const width = m + 1;
  const dir = new Uint8Array(cells);
  let prev = new Uint32Array(width);
  let curr = new Uint32Array(width);

  for (let i = 1; i <= n; i += 1) {
    const left = normA[aFrom + i - 1];
    const rowStart = i * width;
    for (let j = 1; j <= m; j += 1) {
      if (left === normB[bFrom + j - 1]) {
        curr[j] = prev[j - 1] + 1;
        dir[rowStart + j] = 1;
      } else if (prev[j] >= curr[j - 1]) {
        curr[j] = prev[j];
        dir[rowStart + j] = 2;
      } else {
        curr[j] = curr[j - 1];
        dir[rowStart + j] = 3;
      }
    }
    const swap = prev;
    prev = curr;
    curr = swap;
    curr[0] = 0;
  }

  // Walk the direction matrix back into an edit script.
  const edits: Edit[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const direction = dir[i * width + j];
    if (i > 0 && j > 0 && direction === 1) {
      edits.push({ type: "equal", i: i - 1, j: j - 1 });
      i -= 1;
      j -= 1;
    } else if (i > 0 && (j === 0 || direction === 2)) {
      edits.push({ type: "delete", i: i - 1, j });
      i -= 1;
    } else {
      edits.push({ type: "insert", i, j: j - 1 });
      j -= 1;
    }
  }
  edits.reverse();

  // Group into rows, pairing each hunk's deletions with its insertions so a
  // changed line reads as "modified" instead of delete + add.
  const rows: DiffRow[] = [];
  let k = 0;
  while (k < edits.length) {
    const edit = edits[k];
    if (edit.type === "equal") {
      rows.push(equalRow(rawA, rawB, aFrom + edit.i, bFrom + edit.j));
      k += 1;
      continue;
    }
    const deletes: number[] = [];
    const inserts: number[] = [];
    while (k < edits.length && edits[k].type !== "equal") {
      const current = edits[k];
      if (current.type === "delete") deletes.push(aFrom + current.i);
      else inserts.push(bFrom + current.j);
      k += 1;
    }
    pushHunk(rows, deletes, inserts, rawA, rawB);
  }

  return { rows, coarse: false };
}

function computeStats(rows: DiffRow[], coarse: boolean): DiffStats {
  let added = 0;
  let removed = 0;
  let modified = 0;
  let unchanged = 0;

  for (const row of rows) {
    switch (row.kind) {
      case "add":
        added += 1;
        break;
      case "remove":
        removed += 1;
        break;
      case "modify":
        modified += 1;
        break;
      default:
        unchanged += 1;
    }
  }

  const totalRows = rows.length;
  const changes = added + removed + modified;

  return {
    added,
    removed,
    modified,
    unchanged,
    totalRows,
    changes,
    similarity: totalRows === 0 ? 100 : Math.round((unchanged / totalRows) * 100),
    coarse,
  };
}

/**
 * Compares two documents line by line. A "modified" row is a removed line
 * paired positionally with an added line inside the same hunk.
 */
export function compareText(
  before: string,
  after: string,
  options: CompareOptions
): CompareResult {
  const rawA = splitLines(before);
  const rawB = splitLines(after);
  const normA = rawA.map((line) => normalizeLine(line, options));
  const normB = rawB.map((line) => normalizeLine(line, options));

  // 1. Common prefix.
  let start = 0;
  while (start < rawA.length && start < rawB.length && normA[start] === normB[start]) {
    start += 1;
  }

  // 2. Common suffix (never overlapping the prefix).
  let endA = rawA.length;
  let endB = rawB.length;
  while (endA > start && endB > start && normA[endA - 1] === normB[endB - 1]) {
    endA -= 1;
    endB -= 1;
  }

  const rows: DiffRow[] = [];
  for (let i = 0; i < start; i += 1) rows.push(equalRow(rawA, rawB, i, i));

  const middle = diffSegment(rawA, normA, rawB, normB, start, endA, start, endB);
  rows.push(...middle.rows);

  for (let k = 0; endA + k < rawA.length; k += 1) {
    rows.push(equalRow(rawA, rawB, endA + k, endB + k));
  }

  return { rows, stats: computeStats(rows, middle.coarse) };
}
