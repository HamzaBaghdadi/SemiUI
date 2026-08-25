import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck, lucideCopy } from '@ng-icons/lucide';
import { ButtonComponent } from '../../components/button/button.component';
import { Semi } from '@semiui/presets-semi';
import { resolvePresetToken, tokenPathToCssVar } from '@semiui/tokens';

const SNIPPETS = {
  shape: `interface ThemePreset {
  name: string;
  primitive: PrimitiveTokens;    // raw values -- blue.500, slate.200, white, night.base
  semantic: SemanticTokens;      // meanings -- primary, destructive, muted, spacing, radius, typography
  components: ComponentTokens;   // one entry per component -- button, input, tag...
  dark?: ThemeOverrides;         // dark-mode overrides, normally semantic tokens only
  icons: IconTokens;             // logical slot -> icon reference
}`,
  customPreset: `import { Semi } from '@semiui/presets-semi';
import { definePreset } from '@semiui/tokens';

export const Ember = definePreset(Semi, {
  name: 'ember',
  primitive: {
    ember: {
      50: '#fffaf5', 100: '#ffedd5', 200: '#fed7aa',
      400: '#fb923c', 500: '#ea580c', 800: '#9a3412', 900: '#431407',
    },
  },
  semantic: {
    primary: '{ember.500}',
    background: '{ember.50}',
    foreground: '{ember.900}',
    muted: '{ember.100}',
    mutedForeground: '{ember.800}',
    border: '{ember.200}',
  },
  dark: {
    semantic: { primary: '{ember.400}' },
  },
});
// Nothing else needs saying. Every component token references the semantic layer,
// so buttons, tags, focus rings, checked checkboxes and the rest follow automatically.`,
  customPresetUsage: `import { provideSemiUI } from '@semiui/theme';
import { Ember } from './presets/ember.preset';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...your existing providers
    provideSemiUI({ preset: Ember }),
  ],
};`,
  compButton: `components: {
  button: {
    radius: '{radius.md}',
    fontWeight: '{typography.fontWeight.medium}',
    focusRing: '{ring}',
    backgroundDisabled: '{muted}',
    foregroundDisabled: '{mutedForeground}',
    paddingX: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
    paddingY: { sm: '0.375rem', md: '0.5rem', lg: '0.625rem' },
    fontSize: { sm: '0.8125rem', md: '0.875rem', lg: '1rem' },
    variants: {
      primary: { background: '{primary}', foreground: '{primaryForeground}', border: '{primary}' },
      success: { background: '{success}', foreground: '{successForeground}', border: '{success}' },
      link: { background: '{transparent}', foreground: '{primary}', border: '{transparent}' },
      // ...secondary, destructive, danger, info, warn, help, contrast
    },
  },
},`,
  iconUsage: `protected readonly icons = injectSemiUIIcons();

// in the template:
// <s-icon [ref]="icons.checkboxCheck" />`,
  darkMode: `import { ColorModeService } from '@semiui/theme';

@Component({ /* ... */ })
export class TopbarComponent {
  protected readonly colorModeService = inject(ColorModeService);
}

// template: (click)="colorModeService.toggle()"`,
  tokenValues: `// A token's value is always a string. It can be any of these:

primary:    '{blue.500}',                                  // a reference
radius:     '0.5rem',                                      // a raw CSS value
shadow:     '0 8px 24px rgb(15 23 42 / 0.10)',             // ...however complex
background: 'color-mix(in srgb, {primary} 15%, transparent)', // refs inside an expression
accent:     'var(--color-green-500)',                      // an escape hatch to your own CSS

// References resolve against the semantic layer first, then primitives, then component
// tokens under an explicit "components." prefix. Any depth works:
'{blue.500}'  '{primary}'  '{spacing.md}'  '{typography.fontSize.sm}'
'{components.button.radius}'`,
  aliases: `semantic: {
  destructive: '{red.600}',
  warning: '{amber.600}',

  // Aliases, not copies. One source of truth per color, reachable under every name
  // the component APIs use -- repointing destructive moves danger and error with it.
  danger: '{destructive}',
  error: '{destructive}',
  warn: '{warning}',
}`,
  validation: `// A typo is a build-time error with a suggestion, not a silent var(--undefined):
semantic: { primary: '{blue.5000}' }
// MissingTokenReferenceError: Unknown token reference "{blue.5000}" used by
// "primary". Did you mean "{blue.500}"?

// So is a cycle, with the full path through it:
semantic: { primary: '{ring}', ring: '{primary}' }
// CircularTokenReferenceError: Circular token reference: primary -> ring -> primary.

// Both run automatically before any CSS is generated. Call it yourself in a test:
import { validatePreset } from '@semiui/tokens';
it('resolves', () => expect(() => validatePreset(MyTheme)).not.toThrow());`,
  composition: `// Every built-in preset except Semi is written this way -- Carbon is ~190 lines of
// genuine differences, not a second copy of the token tree.
export const Carbon = definePreset(Semi, {
  name: 'carbon',
  primitive: { blue: { 500: '#0f62fe', /* ...IBM's ramp */ } },
  semantic: {
    // One decision squares the entire library: every component token that used to
    // hard-code a corner reads {radius.sm|md|lg}.
    radius: { sm: '0', md: '0', lg: '0' },
    typography: { fontFamily: '"IBM Plex Sans", sans-serif' },
  },
});

// Derived presets can themselves be extended.
const CarbonPink = definePreset(Carbon, { semantic: { primary: '{pink.500}' } });`,
  tailwindPlugin: `// tailwind.config.js -- if you use a JS config rather than CSS-first
import { semiuiTailwind } from '@semiui/tailwind';
import { Semi } from '@semiui/presets-semi';

export default { plugins: [semiuiTailwind({ preset: Semi })] };

// Or generate the CSS yourself, for any preset:
import { renderTailwindThemeCss } from '@semiui/tailwind';
writeFileSync('src/tailwind/semiui.css', renderTailwindThemeCss({ preset: MyTheme }));`,
  tailwindUsage: `<!-- Semantic colors, with no dark: variant needed -->
<div class="bg-background text-foreground border border-border">
  <button class="bg-primary text-primary-foreground rounded-md">Save</button>
  <span class="bg-success/10 text-success">Saved</span>
  <span class="bg-danger/10 text-danger">Failed</span>
</div>

<!-- The preset's primitive scales and its primary ramp -->
<div class="bg-blue-500 ring-primary-200"></div>`,
  tailwindBridge: `npx semiui add tailwind`,
  tailwindImport: `@import "tailwindcss";
@import "./tailwind/tailwind.css"; /* wherever "semiui add" placed it -- after @import "tailwindcss" */`,
  tailwindCustomPrimary: `const MyTheme = definePreset(Semi, {
  name: 'my-theme',
  semantic: {
    primary: 'var(--color-green-500)',        // <- your own Tailwind theme's green-500
    primaryForeground: 'var(--color-white)',
  },
});`,
} as const;

type SnippetId = keyof typeof SNIPPETS;

@Component({
  selector: 'app-theming',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.css'],
  imports: [NgIcon, ButtonComponent],
  providers: [provideIcons({ lucideCopy, lucideClipboardCheck })],
})
export class ThemingComponent {
  private readonly router = inject(Router);

  protected readonly presets = [
    { key: 'semi', label: 'Semi', description: 'The default -- a clean, neutral baseline preset with a blue accent. Not modeled on any particular product.' },
    { key: 'aurora', label: 'Aurora', description: 'A vibrant indigo original, also not modeled on any real product -- a bolder alternative starting point to Semi.' },
    { key: 'material', label: 'Material', description: "Google's Material 3 baseline -- the real spec values (#6750a4 primary, MDC elevation shadows) and pill-shaped buttons." },
    { key: 'carbon', label: 'Carbon', description: "IBM's Carbon Design System -- the documented palette (#0f62fe blue, #161616 text), almost no radius, almost no shadow." },
    { key: 'fluent', label: 'Fluent', description: "Microsoft's Fluent 2 -- the Windows/Office blue (#0078d4) and Fluent's documented ambient+key shadow pairs." },
    { key: 'cupertino', label: 'Cupertino', description: "iOS's system colors (#007aff, OLED black in dark mode), continuous corners, and capsule-shaped buttons." },
    { key: 'samsung', label: 'Samsung', description: "Samsung's One UI -- the documented #0381fe system blue, big 'focus block' rounded corners, true-black dark mode." },
  ];

  /** The full semantic color vocabulary, in the order the preset declares it. Every entry here is
   * one `semantic.*` token -- the swatch reads the generated variable live, so it shows whatever
   * the active preset and color mode resolve it to. */
  protected readonly colorGroups = [
    {
      title: 'Surface',
      caption: 'The page itself, and the ink drawn on it.',
      tokens: [
        { key: 'background', label: 'background' },
        { key: 'foreground', label: 'foreground' },
        { key: 'muted', label: 'muted' },
        { key: 'muted-foreground', label: 'mutedForeground' },
        { key: 'border', label: 'border' },
        { key: 'ring', label: 'ring' },
      ],
    },
    {
      title: 'Status',
      caption: 'Each pairs with a foreground designed to sit on it.',
      tokens: [
        { key: 'primary', label: 'primary' },
        { key: 'primary-foreground', label: 'primaryForeground' },
        { key: 'secondary', label: 'secondary' },
        { key: 'secondary-foreground', label: 'secondaryForeground' },
        { key: 'success', label: 'success' },
        { key: 'success-foreground', label: 'successForeground' },
        { key: 'info', label: 'info' },
        { key: 'info-foreground', label: 'infoForeground' },
        { key: 'warning', label: 'warning' },
        { key: 'warning-foreground', label: 'warningForeground' },
        { key: 'destructive', label: 'destructive' },
        { key: 'destructive-foreground', label: 'destructiveForeground' },
        { key: 'help', label: 'help' },
        { key: 'help-foreground', label: 'helpForeground' },
        { key: 'contrast', label: 'contrast' },
        { key: 'contrast-foreground', label: 'contrastForeground' },
      ],
    },
    {
      title: 'Aliases',
      caption:
        'Not colors of their own -- each references one of the tokens above, so repointing that token moves the alias with it.',
      tokens: [
        { key: 'danger', label: 'danger → destructive' },
        { key: 'error', label: 'error → destructive' },
        { key: 'warn', label: 'warn → warning' },
      ],
    },
  ];

  /**
   * The reference chain behind one component token, resolved by the real engine rather than
   * written out by hand -- `resolvePresetToken` is the same function tooling uses, so if the Semi
   * preset is ever repointed this table follows it.
   */
  protected readonly resolutionChain = [
    {
      layer: 'Component',
      path: 'components.button.variants.primary.background',
      authored: "'{primary}'",
      note: 'What the button asks for.',
    },
    {
      layer: 'Semantic',
      path: 'primary',
      authored: "'{blue.500}'",
      note: 'What "primary" means in this preset.',
    },
    {
      layer: 'Primitive',
      path: 'blue.500',
      authored: `'${resolvePresetToken(Semi, 'blue.500')}'`,
      note: 'The raw value the chain bottoms out at.',
    },
  ].map((step) => ({
    ...step,
    cssVar: tokenPathToCssVar(
      step.layer === 'Primitive' ? 'primitive' : step.layer === 'Component' ? 'components' : 'semantic',
      (step.layer === 'Component' ? step.path.replace(/^components./, '') : step.path).split('.'),
    ),
    resolved: resolvePresetToken(Semi, step.path),
  }));

  protected readonly spacingScale = [
    { key: 'xs', value: '0.25rem' },
    { key: 'sm', value: '0.5rem' },
    { key: 'md', value: '0.75rem' },
    { key: 'lg', value: '1rem' },
    { key: 'xl', value: '1.5rem' },
  ];

  protected readonly radiusScale = [
    { key: 'sm', value: '0.375rem' },
    { key: 'md', value: '0.5rem' },
    { key: 'lg', value: '0.75rem' },
    { key: 'full', value: '9999px' },
  ];

  protected readonly iconSlots = [
    { slot: 'loading', icon: 'lucideLoaderCircle' },
    { slot: 'chevronDown', icon: 'lucideChevronDown' },
    { slot: 'clear', icon: 'lucideX' },
    { slot: 'checkboxCheck', icon: 'lucideCheck' },
    { slot: 'search', icon: 'lucideSearch' },
    { slot: 'toastSuccess', icon: 'lucideCircleCheck' },
    { slot: 'toastError', icon: 'lucideCircleX' },
  ];

  private readonly copiedId = signal<string | null>(null);

  protected goInstallation(): void {
    this.router.navigate(['/installation']);
  }

  /** Renders a snippet into the template. Interpolating the same string the Copy button writes
   * to the clipboard means the two can never drift -- the older hand-escaped code blocks on this
   * page have to keep them in sync by hand. */
  protected snippet(id: SnippetId): string {
    return SNIPPETS[id];
  }

  protected isCopied(id: string): boolean {
    return this.copiedId() === id;
  }

  protected async copy(id: SnippetId | string): Promise<void> {
    const text = id in SNIPPETS ? SNIPPETS[id as SnippetId] : `var(--semiui-color-${id})`;
    await navigator.clipboard.writeText(text);
    this.copiedId.set(id);
    setTimeout(() => {
      if (this.copiedId() === id) {
        this.copiedId.set(null);
      }
    }, 1500);
  }

  protected initCommand(presetKey: string): string {
    return `npx @semiui/cli init --preset ${presetKey}`;
  }

  protected async copyPresetCommand(presetKey: string): Promise<void> {
    const id = `preset:${presetKey}`;
    await navigator.clipboard.writeText(this.initCommand(presetKey));
    this.copiedId.set(id);
    setTimeout(() => {
      if (this.copiedId() === id) {
        this.copiedId.set(null);
      }
    }, 1500);
  }
}
