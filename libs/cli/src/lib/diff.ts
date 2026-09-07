/**
 * A small unified-diff formatter, so `semiui diff` works with no git and no dependencies. Only
 * `update`'s three-way merge needs git; showing a developer what changed should never require it.
 */

const CONTEXT_LINES = 3;

function splitLines(text: string): string[] {
  return text.replace(/\r\n/g, '\n').split('\n');
}

/**
 * Longest common subsequence over lines, as a table of match lengths. O(n*m) -- fine for source
 * files a person reads, and it keeps the whole thing dependency-free.
 */
function lcsTable(a: string[], b: string[]): number[][] {
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  return table;
}

type Op = { kind: ' ' | '-' | '+'; line: string };

function diffOps(a: string[], b: string[]): Op[] {
  const table = lcsTable(a, b);
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ kind: ' ', line: a[i] });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      ops.push({ kind: '-', line: a[i++] });
    } else {
      ops.push({ kind: '+', line: b[j++] });
    }
  }
  while (i < a.length) ops.push({ kind: '-', line: a[i++] });
  while (j < b.length) ops.push({ kind: '+', line: b[j++] });
  return ops;
}

/**
 * Renders a unified diff with `@@` hunk headers, or an empty string when the two sides match.
 * `label` names the file in the `---`/`+++` header lines.
 */
export function unifiedDiff(before: string, after: string, label: string, fromTag: string, toTag: string): string {
  const a = splitLines(before);
  const b = splitLines(after);
  const ops = diffOps(a, b);
  if (!ops.some((op) => op.kind !== ' ')) {
    return '';
  }

  // Group changed ops into hunks, padded by CONTEXT_LINES of surrounding unchanged lines.
  const changed = ops.map((op) => op.kind !== ' ');
  const keep = new Array<boolean>(ops.length).fill(false);
  for (let i = 0; i < ops.length; i++) {
    if (!changed[i]) continue;
    for (let k = Math.max(0, i - CONTEXT_LINES); k <= Math.min(ops.length - 1, i + CONTEXT_LINES); k++) {
      keep[k] = true;
    }
  }

  const out: string[] = [`--- ${label}  (${fromTag})`, `+++ ${label}  (${toTag})`];
  let aLine = 1;
  let bLine = 1;
  let index = 0;
  while (index < ops.length) {
    if (!keep[index]) {
      if (ops[index].kind !== '+') aLine++;
      if (ops[index].kind !== '-') bLine++;
      index++;
      continue;
    }
    const hunkStartA = aLine;
    const hunkStartB = bLine;
    const body: string[] = [];
    let countA = 0;
    let countB = 0;
    while (index < ops.length && keep[index]) {
      const op = ops[index];
      body.push(op.kind + op.line);
      if (op.kind !== '+') {
        aLine++;
        countA++;
      }
      if (op.kind !== '-') {
        bLine++;
        countB++;
      }
      index++;
    }
    out.push(`@@ -${hunkStartA},${countA} +${hunkStartB},${countB} @@`, ...body);
  }
  return out.join('\n');
}

/** How many lines differ, for one-line summaries like "+12 -3". */
export function diffStat(before: string, after: string): { added: number; removed: number } {
  const ops = diffOps(splitLines(before), splitLines(after));
  return {
    added: ops.filter((op) => op.kind === '+').length,
    removed: ops.filter((op) => op.kind === '-').length,
  };
}
