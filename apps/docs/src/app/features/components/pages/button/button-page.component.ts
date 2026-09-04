import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideSave } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../components/button/button.component';
import { ButtonSize, ButtonVariant, IconRef } from '@semiui/tokens';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-button-page',
  imports: [
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './button-page.component.html',
  styleUrl: './button-page.component.css',
  providers: [provideIcons({ lucideSave })],
})
export class ButtonPageComponent {
  protected variants: ButtonVariant[] = ['primary', 'secondary', 'destructive', 'link'];
  protected severities: ButtonVariant[] = ['success', 'info', 'warn', 'help', 'danger', 'contrast'];
  protected allSeverities: ButtonVariant[] = ['primary', 'secondary', 'success', 'info', 'warn', 'help', 'danger', 'contrast'];
  protected allVariants: ButtonVariant[] = ['primary', 'secondary', 'destructive', 'danger', 'success', 'info', 'warn', 'help', 'contrast', 'link'];
  protected sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  protected loading = signal(false);
  protected saveIcon: IconRef = { type: 'ng-icon', name: 'lucideSave' };

  protected readonly fluidCode = `<s-button [fluid]="true">Continue</s-button>`;

  protected readonly variantsCode = `<s-button variant="primary">primary</s-button>
<s-button variant="destructive">destructive</s-button>`;

  protected readonly severityCode = `<s-button variant="success">success</s-button>
<s-button variant="info">info</s-button>
<s-button variant="warn">warn</s-button>
<s-button variant="help">help</s-button>
<s-button variant="danger">danger</s-button>
<s-button variant="contrast">contrast</s-button>`;

  protected readonly outlinedTextCode = `<s-button variant="success" [outlined]="true">success</s-button>
<s-button variant="danger" [text]="true">danger</s-button>`;

  protected readonly sizesCode = `<s-button size="sm">Small</s-button>`;

  protected readonly iconOnlyCode = `<s-button icon [iconLeading]="{ type: 'ng-icon', name: 'lucideSave' }" aria-label="Save" />`;

  protected readonly iconCode = `<s-button [iconLeading]="{ type: 'ng-icon', name: 'lucideSave' }">Save</s-button>`;

  protected readonly disabledCode = `<s-button variant="destructive" [disabled]="true">destructive</s-button>
<s-button variant="success" [outlined]="true" [disabled]="true">success</s-button>`;

  protected readonly disabledPresetCode = `definePreset(Semi, {
  components: {
    button: {
      // Every variant carries its own disabled palette, defaulting to that
      // variant's live colors -- override one variant, or all of them.
      variants: {
        destructive: { opacityDisabled: '45%' },
        // Prefer the flat-grey disabled style? Point them at a neutral:
        primary: {
          backgroundDisabled: '{muted}',
          foregroundDisabled: '{mutedForeground}',
          borderDisabled: '{muted}',
          opacityDisabled: '100%',
        },
      },
    },
  },
})`;

  protected readonly loadingCode = `<s-button [loading]="isSubmitting()">Submit</s-button>`;

  toggleLoading(): void {
    this.loading.update((value) => !value);
  }

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'destructive' | 'link' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'",
      default: "'primary'",
      description: 'Visual style. danger is a plain alias of destructive -- both resolve to the same tokens.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Controls padding and font size via the size-scoped tokens.',
    },
    {
      name: 'icon',
      type: 'boolean',
      default: 'false',
      description: 'Icon-only mode: hides the label and renders just iconLeading, sized to a perfect square.',
    },
    {
      name: 'outlined',
      type: 'boolean',
      default: 'false',
      description: 'Transparent background, border and text in the variant color. Combines with any variant.',
    },
    {
      name: 'text',
      type: 'boolean',
      default: 'false',
      description: 'Transparent background, no border, text in the variant color. Combines with any variant.',
    },
    {
      name: 'fluid',
      type: 'boolean',
      default: 'false',
      description: 'Stretches the button to fill its container instead of sizing to its label -- replaces reaching in with [&_.s-button]:w-full.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the button and switches to the disabled background/foreground tokens.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Functionally disables the button and swaps in the loading icon, keeping the variant colors dimmed via opacity.',
    },
    {
      name: 'iconLeading',
      type: 'IconRef',
      default: 'undefined',
      description: 'Icon shown before the label (or as the sole content when icon is set).',
    },
    {
      name: 'iconTrailing',
      type: 'IconRef',
      default: 'undefined',
      description: 'Icon shown after the label. Hidden while loading or icon is set.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'pressed',
      type: 'EventEmitter<void>',
      description: 'Emitted on click or Enter/Space keydown, unless disabled or loading.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-fluid', description: 'Present on the host when fluid is set -- switches it to full-container width.' },
    { name: 'data-variant', description: "The active variant, e.g. [data-variant='primary'] -- drives the color tokens read below." },
    { name: 'data-size', description: "The active size, e.g. [data-size='md'] -- drives padding and font-size tokens." },
    { name: 'data-icon-only', description: 'Present when icon is set -- makes the button a 1:1 square.' },
    { name: 'data-outlined', description: 'Present when outlined is set -- switches to the transparent/bordered style.' },
    { name: 'data-text', description: 'Present when text is set -- switches to the transparent/borderless style.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-button', description: 'The inner element carrying background, border, and typography.' },
    { name: '.s-button--loading', description: "Applied while loading -- keeps the variant's at-rest colors rather than switching to its disabled ones." },
    { name: '.s-button__icon', description: 'Wraps each rendered icon (leading, trailing, or loading spinner).' },
    { name: '.s-button__icon--spin', description: 'Added to the loading icon to animate its rotation.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-button-radius', description: 'Corner radius, shared across all sizes and variants.' },
    { name: '--semiui-comp-button-font-weight', description: 'Label font weight.' },
    { name: '--semiui-comp-button-focus-ring', description: 'Color of the focus-visible ring (rendered at 45% opacity).' },
    {
      name: '--semiui-comp-button-{background,foreground,border,opacity}-disabled',
      description:
        'Disabled fallback, used only by a button with no variant. Every variant overrides these with its own disabled tokens below.',
    },
    { name: '--semiui-comp-button-padding-x-{sm,md,lg}', description: 'Horizontal padding per size.' },
    { name: '--semiui-comp-button-padding-y-{sm,md,lg}', description: 'Vertical padding per size.' },
    { name: '--semiui-comp-button-font-size-{sm,md,lg}', description: 'Font size per size.' },
    {
      name: '--semiui-comp-button-variants-{variant}-{background,foreground,border}',
      description: 'Per-variant color triad (primary, secondary, destructive, danger, success, info, warn, help, contrast, link). Hover/active states are derived from background/border via color-mix(), not separate tokens.',
    },
    {
      name: '--semiui-comp-button-variants-{variant}-{background,foreground,border}-disabled',
      description:
        "Per-variant disabled triad. Each defaults to that variant's own at-rest color, so a disabled button keeps its identity instead of collapsing to grey -- set them to a neutral if you want the flat-grey style. Outlined and text buttons have no fill, so background-disabled is ignored for them; their ink follows the variant's accent color.",
    },
    {
      name: '--semiui-comp-button-variants-{variant}-opacity-disabled',
      description:
        "Opacity applied to the whole button when disabled -- the sole source of the dimming, since the disabled colors are the variant's own. Any CSS opacity value ('60%' or '0.6'); note a bare '60' clamps to a fully opaque 1.",
    },
  ];
}
