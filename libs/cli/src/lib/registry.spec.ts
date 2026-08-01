import { getComponent, listComponents, readRecipeFile } from './registry';

describe('registry', () => {
  it('lists the known components', () => {
    const names = listComponents().map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(['button', 'text-input', 'password']));
  });

  it('getComponent returns undefined for an unknown name', () => {
    expect(getComponent('does-not-exist')).toBeUndefined();
  });

  it('getComponent returns the component metadata', () => {
    const button = getComponent('button');
    expect(button?.files).toEqual(['button.component.ts', 'button.component.html', 'button.component.css']);
    expect(button?.npmDependencies).toContain('@zaytoon/primitives');
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
});
