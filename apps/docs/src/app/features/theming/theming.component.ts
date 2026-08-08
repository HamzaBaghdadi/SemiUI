import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck, lucideCopy } from '@ng-icons/lucide';
import { ButtonComponent } from '../../components/button/button.component';

const SNIPPETS = {
  shape: `interface ThemePreset {
  name: string;
  tokens: {
    color: ColorTokens;      // background, foreground, primary, border, ring...
    spacing: { xs: string; sm: string; md: string; lg: string; xl: string };
    radius: { sm: string; md: string; lg: string; full: string };
    typography: { fontFamily: string; fontSizeSm: string; fontSizeMd: string; fontWeightMedium: string };
    comp: ComponentTokens;   // one entry per component -- comp.button, comp.input, comp.tag...
  };
  darkColor: ColorTokens;    // paired dark-mode palette
  icons: IconTokens;         // logical slot -> icon reference
}`,
  customPreset: `import { Semi } from '@semiui/presets-semi';
import type { ThemePreset } from '@semiui/tokens';

export const Ember: ThemePreset = {
  ...Semi,
  name: 'ember',
  tokens: {
    ...Semi.tokens,
    color: {
      background: '#fffaf5',
      foreground: '#431407',
      primary: '#ea580c',
      primaryForeground: '#ffffff',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#fed7aa',
      ring: '#ea580c',
      muted: '#ffedd5',
      mutedForeground: '#9a3412',
    },
  },
  // darkColor and comp are inherited from Semi as-is -- override only what changes.
};`,
  customPresetUsage: `import { provideSemiUI } from '@semiui/theme';
import { Ember } from './presets/ember.preset';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...your existing providers
    provideSemiUI({ preset: Ember }),
  ],
};`,
  compButton: `comp: {
  button: {
    radius: '0.5rem',
    fontWeight: '500',
    focusRing: 'var(--semiui-color-ring)',
    backgroundDisabled: 'var(--semiui-color-muted)',
    foregroundDisabled: 'var(--semiui-color-muted-foreground)',
    paddingX: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
    paddingY: { sm: '0.375rem', md: '0.5rem', lg: '0.625rem' },
    fontSize: { sm: '0.8125rem', md: '0.875rem', lg: '1rem' },
    variants: {
      primary: {
        background: 'var(--semiui-color-primary)',
        foreground: 'var(--semiui-color-primary-foreground)',
        border: 'var(--semiui-color-primary)',
      },
      success: { background: '#16a34a', foreground: '#ffffff', border: '#16a34a' },
      link: { background: 'transparent', foreground: 'var(--semiui-color-primary)', border: 'transparent' },
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
  tailwindBridge: `@import "tailwindcss";
@import "./my-app.css"; /* wherever provideSemiUI's injected <style> lands is untouched by this */

@theme {
  --color-primary: var(--semiui-color-primary);
  --color-background: var(--semiui-color-background);
  /* map the rest of --semiui-* the same way, only where you need Tailwind utilities */
}`,
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

  protected readonly colorTokens = [
    { key: 'background', label: 'Background' },
    { key: 'foreground', label: 'Foreground' },
    { key: 'primary', label: 'Primary' },
    { key: 'primary-foreground', label: 'Primary foreground' },
    { key: 'destructive', label: 'Destructive' },
    { key: 'destructive-foreground', label: 'Destructive foreground' },
    { key: 'border', label: 'Border' },
    { key: 'ring', label: 'Ring' },
    { key: 'muted', label: 'Muted' },
    { key: 'muted-foreground', label: 'Muted foreground' },
  ];

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
