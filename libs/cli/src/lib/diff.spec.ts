import { diffStat, unifiedDiff } from './diff';

describe('unifiedDiff', () => {
  it('returns nothing when the two sides match', () => {
    expect(unifiedDiff('a\nb\n', 'a\nb\n', 'f.ts', 'yours', 'semiui 2.0.0')).toBe('');
  });

  it('treats CRLF and LF as the same content', () => {
    expect(unifiedDiff('a\r\nb\r\n', 'a\nb\n', 'f.ts', 'yours', 'semiui 2.0.0')).toBe('');
  });

  it('marks added and removed lines and keeps surrounding context', () => {
    const before = ['1', '2', '3', '4', 'old', '6', '7', '8', '9'].join('\n');
    const after = ['1', '2', '3', '4', 'new', '6', '7', '8', '9'].join('\n');
    const out = unifiedDiff(before, after, 'f.ts', 'yours', 'semiui 2.0.0');

    expect(out).toContain('--- f.ts  (yours)');
    expect(out).toContain('+++ f.ts  (semiui 2.0.0)');
    expect(out).toContain('-old');
    expect(out).toContain('+new');
    expect(out).toContain(' 4');
    // Lines far from the change are outside the context window and stay out of the hunk.
    expect(out).not.toContain(' 1\n');
  });

  it('emits a hunk header with the right line numbers', () => {
    const out = unifiedDiff('a\nb\nc', 'a\nB\nc', 'f.ts', 'yours', 'semiui 2.0.0');
    expect(out).toMatch(/@@ -1,3 \+1,3 @@/);
  });

  it('handles one side being empty', () => {
    expect(unifiedDiff('', 'a\nb', 'f.ts', 'yours', 'x')).toContain('+a');
    expect(unifiedDiff('a\nb', '', 'f.ts', 'yours', 'x')).toContain('-a');
  });
});

describe('diffStat', () => {
  it('counts added and removed lines', () => {
    expect(diffStat('a\nb\nc', 'a\nc')).toEqual({ added: 0, removed: 1 });
    expect(diffStat('a\nc', 'a\nb\nc')).toEqual({ added: 1, removed: 0 });
    expect(diffStat('a\nb', 'a\nB')).toEqual({ added: 1, removed: 1 });
  });

  it('reports nothing for identical content', () => {
    expect(diffStat('a\nb', 'a\nb')).toEqual({ added: 0, removed: 0 });
  });
});
