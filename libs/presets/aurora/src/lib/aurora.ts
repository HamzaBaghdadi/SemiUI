import { ThemePreset, definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi';

/**
 * Aurora -- SemiUI's own house style: indigo primary, a neutral gray (rather than blue-cast)
 * surface family, tighter corners, and soft diffuse shadows.
 *
 * Everything Aurora doesn't mention is inherited from `Semi`, which is the point: a preset is a
 * set of *differences* from a base, not a second full copy of the token tree. The whole file is
 * roughly a hundred design decisions, and every component that reads `{primary}`, `{info}`,
 * `{help}` or `{border}` picks them up with no per-component overrides.
 */
export const Aurora: ThemePreset = definePreset(Semi, {
  name: 'aurora',

  primitive: {
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    night: {
      base: '#0b1220',
      raised: '#111827',
      ink: '#0b1220',
      /** Aurora's dark-mode body text -- gray-200 with a faint cool cast, so it sits in the same
       * family as the surfaces underneath it rather than reading as pure neutral. */
      text: '#e5e9f0',
    },
  },

  semantic: {
    primary: '{indigo.500}',
    // Aurora's neutrals come from the gray family, not slate -- less blue in the mid-greys.
    foreground: '{night.ink}',
    muted: '{gray.100}',
    mutedForeground: '{gray.500}',
    border: '{gray.200}',
    // Info and help sit one shade deeper than Semi's, which reads better against Aurora's
    // higher-contrast page. Button/Tag/Badge/Timeline all follow from here.
    info: '{blue.600}',
    help: '{violet.600}',

    palette: { primary: '{indigo}' },

    radius: { sm: '0.25rem' },
  },

  dark: {
    semantic: {
      primary: '{indigo.400}',
      foreground: '{night.text}',
      mutedForeground: '{gray.400}',
      border: '{gray.800}',
    },
  },

  components: {
    // Softer and closer to the surface than Semi's -- Aurora leans on a diffuse ambient shadow
    // rather than a hard drop.
    select: { panelShadow: '0 4px 16px color-mix(in srgb, black 15%, transparent)' },
    popover: { shadow: '0 4px 16px color-mix(in srgb, black 15%, transparent)' },
    dialog: { shadow: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.15)' },

    // Aurora's toasts carry a visible edge in their own status color rather than sitting
    // borderless on the blur.
    toast: {
      variants: {
        default: { border: '{border}' },
        success: { border: '{success}' },
        error: { border: '{error}' },
        warning: { border: '{warning}' },
        info: { border: '{info}' },
      },
    },
  },
});
