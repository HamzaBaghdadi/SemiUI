import { ThemePreset, definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi';

/** Fluent's depth ramp -- each level is an ambient + key shadow pair at a fixed blur, not a single
 * drop. The numbers are Fluent's own depth tokens (8/16/28). */
const shadow8 = '0 0.6px 1.8px rgb(0 0 0 / 0.1), 0 3.2px 7.2px rgb(0 0 0 / 0.13)';
const shadow16 = '0 1.2px 3.6px rgb(0 0 0 / 0.1), 0 6.4px 14.4px rgb(0 0 0 / 0.13)';
const shadow28 = '0 2.1px 6.4px rgb(0 0 0 / 0.1), 0 11.2px 25.6px rgb(0 0 0 / 0.13)';

/**
 * Fluent -- Microsoft's design language: communication blue, Segoe UI, small 2-4px corners, flat
 * opaque surfaces, and the depth ramp above instead of blur.
 */
export const Fluent: ThemePreset = definePreset(Semi, {
  name: 'fluent',

  primitive: {
    blue: {
      50: '#eff6fc',
      100: '#deecf9',
      200: '#c7e0f4',
      300: '#71afe5',
      400: '#479ef5',
      500: '#0078d4',
      600: '#106ebe',
      700: '#005a9e',
      800: '#004578',
      900: '#003966',
      950: '#002848',
    },
    red: {
      50: '#fdf3f4',
      100: '#fdd8db',
      200: '#fbb2b6',
      300: '#f28b8f',
      400: '#ff6a6a',
      500: '#d13438',
      600: '#a4262c',
      700: '#751d20',
      800: '#5c1518',
      900: '#3b0e10',
      950: '#240709',
    },
    green: {
      50: '#f1faf1',
      100: '#dff6dd',
      200: '#a7e3a5',
      300: '#5ec75e',
      400: '#13a10e',
      500: '#107c10',
      600: '#0e700e',
      700: '#0b5a0b',
      800: '#094509',
      900: '#063306',
      950: '#042104',
    },
    amber: {
      50: '#fff9f0',
      100: '#fff4ce',
      200: '#ffe8a6',
      300: '#ffd335',
      400: '#ffb900',
      500: '#d68e00',
      600: '#9d5d00',
      700: '#7a4900',
      800: '#5c3700',
      900: '#3d2500',
      950: '#241600',
    },
    violet: {
      50: '#f7f2fa',
      100: '#eddff3',
      200: '#dabde6',
      300: '#b98fcd',
      400: '#8b5aa5',
      500: '#5b2c6f',
      600: '#4c2a5c',
      700: '#3e2249',
      800: '#301a38',
      900: '#221226',
      950: '#150b17',
    },
    slate: {
      50: '#faf9f8',
      100: '#f5f5f5',
      200: '#d1d1d1',
      300: '#c8c6c4',
      400: '#a19f9d',
      500: '#8a8886',
      600: '#616161',
      700: '#3b3a39',
      800: '#2b2b2b',
      900: '#242424',
      950: '#1f1f1f',
    },
    // Fluent's dark surfaces are the same neutral family as its light ones, just further down the
    // ramp -- so pointing the shared "night" group at them is all dark mode needs.
    night: { base: '#1f1f1f', raised: '#2b2b2b', ink: '#1f1f1f' },
  },

  semantic: {
    mutedForeground: '{slate.600}',
    success: '{green.500}',
    destructive: '{red.500}',
    // Fluent's info accent *is* its communication blue -- the same token, not a second copy.
    info: '{primary}',

    radius: { sm: '0.25rem', md: '0.25rem', lg: '0.5rem' },
    typography: {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontWeight: { medium: '600' },
    },
  },

  dark: {
    semantic: {
      foreground: '{white}',
      mutedForeground: '{slate.300}',
      border: '{slate.700}',
    },
  },

  components: {
    button: {
      radius: '{radius.sm}',
      // Fluent's secondary is an outlined white button, not a grey fill.
      variants: { secondary: { background: '{background}', border: '{border}' } },
    },

    select: { panelShadow: shadow16 },
    switch: { background: '{mutedForeground}', border: '{transparent}' },
    checkbox: { radius: '0.1875rem', border: '{mutedForeground}' },
    radio: { border: '{mutedForeground}' },

    popover: { shadow: shadow16, radius: '{radius.lg}' },
    // Fluent's tooltip is its darkest neutral in both modes, not an inverted surface.
    tooltip: { background: '{slate.950}', foreground: '{white}' },
    chart: { tooltipBackground: '{slate.950}', tooltipForeground: '{white}' },

    avatar: { radius: '{radius.full}', statusOffline: '{slate.500}' },
    // Fluent's rating star is its bright gold, a step above the (much deeper) warning brown.
    rating: { filledColor: '{amber.400}' },
    slider: { trackSize: '0.25rem' },

    // Opaque and bordered in its own status color -- Fluent doesn't use translucency here.
    toast: {
      radius: '{radius.lg}',
      shadow: shadow8,
      blur: 'none',
      variants: {
        default: { background: '{background}', border: '{border}' },
        success: { background: '{background}', border: '{success}' },
        error: { background: '{background}', border: '{error}' },
        warning: { background: '{background}', border: '{warning}' },
        info: { background: '{background}', border: '{info}' },
      },
    },

    dialog: { backdropColor: 'rgb(0 0 0 / 0.4)', shadow: shadow28, titleFontWeight: '600' },
    speedDial: { radius: '{radius.sm}', gap: '{spacing.sm}', stagger: '30ms' },
  },
});
