import { getComponent, listComponents, readRecipeFile, resolveWithDependencies } from './registry';

describe('registry', () => {
  it('lists the known components', () => {
    const names = listComponents().map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(['error-message', 'button', 'text-input', 'password']));
  });

  it('getComponent returns undefined for an unknown name', () => {
    expect(getComponent('does-not-exist')).toBeUndefined();
  });

  it('getComponent returns the component metadata', () => {
    const button = getComponent('button');
    expect(button?.files).toEqual(['button.component.ts', 'button.component.html', 'button.component.css']);
    expect(button?.npmDependencies).toContain('@semiui/primitives');
  });

  it('reads real recipe file contents for every registered file', () => {
    for (const component of listComponents()) {
      for (const file of component.files) {
        const contents = readRecipeFile(component.name, file);
        expect(contents.length).toBeGreaterThan(0);
      }
    }
  });

  it('throws a clear error for a missing recipe file', () => {
    expect(() => readRecipeFile('button', 'does-not-exist.ts')).toThrow(/not found/);
  });

  describe('resolveWithDependencies', () => {
    it('returns just the component when it has no recipe dependencies', () => {
      expect(resolveWithDependencies('button').map((c) => c.name)).toEqual(['button']);
    });

    it('includes recipe dependencies before the requesting component, deduplicated', () => {
      expect(resolveWithDependencies('text-input').map((c) => c.name)).toEqual(['error-message', 'text-input']);
      expect(resolveWithDependencies('password').map((c) => c.name)).toEqual(['error-message', 'password']);
    });

    it('returns an empty array for an unknown component', () => {
      expect(resolveWithDependencies('does-not-exist')).toEqual([]);
    });
  });
});
