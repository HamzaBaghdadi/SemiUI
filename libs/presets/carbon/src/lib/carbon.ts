import { ThemePreset, definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi';

/** Carbon's elevation is a tight, opaque drop -- never the diffuse ambient glow other presets use. */
const dialogShadow = '0 4px 8px rgb(0 0 0 / 0.16), 0 1px 3px rgb(0 0 0 / 0.2)';

/**
 * Carbon -- IBM's design language: square corners everywhere, IBM Plex, the official Blue/Gray/
 * Red/Green/Yellow/Purple ramps, and flat opaque surfaces instead of blur and shadow.
 *
 * The zero radius is a single decision here (`semantic.radius`), not thirty: every component token
 * that used to hard-code a corner reads `{radius.sm|md|lg}`, so squaring the theme squares the
 * whole library. The handful of component overrides below are the places Carbon genuinely differs
 * in kind, not in value.
 */
export const Carbon: ThemePreset = definePreset(Semi, {
  name: 'carbon',

  // IBM's published ramps, mapped onto SemiUI's 50-950 steps. Carbon publishes ten steps (10-100)
  // and SemiUI's scale has eleven, so each ramp gains one extra tint at the light end.
  primitive: {
    blue: {
      50: '#edf5ff',
      100: '#d0e2ff',
      200: '#a6c8ff',
      300: '#78a9ff',
      400: '#4589ff',
      500: '#0f62fe',
      600: '#0043ce',
      700: '#002d9c',
      800: '#001d6c',
      900: '#001141',
      950: '#000b24',
    },
    slate: {
      50: '#fafafa',
      100: '#f4f4f4',
      200: '#e0e0e0',
      300: '#c6c6c6',
      400: '#a8a8a8',
      500: '#8d8d8d',
      600: '#6f6f6f',
      700: '#525252',
      800: '#393939',
      900: '#262626',
      950: '#161616',
    },
    red: {
      50: '#fff1f1',
      100: '#ffd7d9',
      200: '#ffb3b8',
      300: '#ff8389',
      400: '#fa4d56',
      500: '#da1e28',
      600: '#a2191f',
      700: '#750e13',
      800: '#520408',
      900: '#2d0709',
      950: '#1a0405',
    },
    green: {
      50: '#f2fdf5',
      100: '#defbe6',
      200: '#a7f0ba',
      300: '#6fdc8c',
      400: '#42be65',
      500: '#24a148',
      600: '#198038',
      700: '#0e6027',
      800: '#044317',
      900: '#022d0d',
      950: '#071908',
    },
    amber: {
      50: '#fefbef',
      100: '#fcf4d6',
      200: '#fddc69',
      300: '#f8d548',
      400: '#f4cc32',
      500: '#f1c21b',
      600: '#d2a106',
      700: '#b28600',
      /** Carbon's yellow-on-yellow text color -- the only legible ink over a Yellow 30 wash. */
      800: '#795600',
      900: '#684e00',
      950: '#483700',
    },
    violet: {
      50: '#f6f2ff',
      100: '#e8daff',
      200: '#d4bbff',
      300: '#be95ff',
      400: '#a56eff',
      500: '#8a3ffc',
      600: '#6929c4',
      700: '#491d8b',
      800: '#31135e',
      900: '#1c0f30',
      950: '#0f0620',
    },
  },

  semantic: {
    foreground: '{slate.950}',
    mutedForeground: '{slate.700}',
    // Carbon's status colors sit one step brighter than SemiUI's defaults -- Blue 70 for info,
    // Red 60 for danger, Green 50 for success, Yellow 30 for warning (with near-black ink, since
    // Carbon's yellow is far too light to carry white text).
    info: '{blue.600}',
    success: '{green.500}',
    destructive: '{red.500}',
    warning: '{amber.500}',
    warningForeground: '{slate.950}',

    // The single decision that squares the entire library.
    radius: { sm: '0', md: '0', lg: '0' },
    typography: { fontFamily: '"IBM Plex Sans", sans-serif' },
  },

  dark: {
    semantic: {
      background: '{slate.950}',
      foreground: '{slate.100}',
      muted: '{slate.900}',
      mutedForeground: '{slate.300}',
      // Carbon keeps white ink on every solid status fill in dark mode rather than flipping to
      // near-black the way SemiUI's default dark palette does.
      primaryForeground: '{white}',
      success: '{green.400}',
      successForeground: '{white}',
      infoForeground: '{white}',
      destructiveForeground: '{white}',
      helpForeground: '{white}',
      // Yellow 30 is already at its usable lightness; it doesn't lift further on a dark surface.
      warning: '{amber.500}',
      warningForeground: '{slate.950}',
    },
  },

  components: {
    button: {
      paddingX: { sm: '1rem', md: '1rem', lg: '1.25rem' },
      paddingY: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
    },

    // Carbon fields are a filled grey well with a single bottom rule, not an outlined box.
    input: { paddingY: '0.6875rem', background: '{muted}' },
    select: { paddingY: '0.6875rem', background: '{muted}', panelShadow: 'none' },

    switch: { background: '{mutedForeground}' },
    checkbox: { radius: '0.0625rem', border: '{mutedForeground}' },
    radio: { border: '{mutedForeground}' },

    popover: { shadow: 'none' },
    // Carbon's tooltip is Gray 80 in both modes -- deliberately not an inverted surface.
    tooltip: { background: '{slate.800}', foreground: '{white}' },
    chart: { tooltipBackground: '{slate.800}', tooltipForeground: '{white}' },

    // Carbon's offline dot is Gray 50 specifically, not the (much darker) Gray 70 its muted text uses.
    avatar: { radius: '{radius.full}', statusOffline: '{slate.500}' },
    tag: {
      radius: '0.125rem',
      variants: {
        // Yellow needs a heavier wash and its own dark ink to stay readable.
        warn: { background: 'color-mix(in srgb, {warn} 20%, transparent)', foreground: '{amber.800}' },
      },
    },

    pagination: { gap: '0', size: '2.5rem' },
    tabs: { foregroundActive: '{foreground}' },
    slider: {
      trackSize: '0.25rem',
      trackColor: '{border}',
      thumbSize: '1rem',
      thumbBackground: '{primary}',
    },

    // Opaque, bordered, un-blurred: a Carbon notification is a panel, not a floating glass card.
    toast: {
      shadow: dialogShadow,
      blur: 'none',
      variants: {
        default: { background: '{background}', border: '{border}' },
        success: { background: '{background}', border: '{success}' },
        error: { background: '{background}', border: '{error}' },
        warning: { background: '{background}', border: '{warning}', iconColor: '{amber.800}' },
        info: { background: '{background}', border: '{info}' },
      },
    },

    dialog: { shadow: dialogShadow, titleFontWeight: '600' },
    speedDial: { radius: '{radius.md}', gap: '{spacing.sm}', stagger: '0ms' },
    organizationChart: { gap: '1.25rem' },
    knob: { valueFontSize: '1.25rem' },
  },
});
