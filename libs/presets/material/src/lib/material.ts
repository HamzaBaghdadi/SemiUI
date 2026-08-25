import { ThemePreset, definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi';

/** Material's elevation ramp -- three stacked shadows per level (umbra, penumbra, ambient), which
 * is what gives it its characteristic soft-but-defined lift. */
const elevation6 =
  '0 3px 5px -1px rgb(0 0 0 / 0.2), 0 6px 10px 0 rgb(0 0 0 / 0.14), 0 1px 18px 0 rgb(0 0 0 / 0.12)';
const elevation8 =
  '0 5px 5px -3px rgb(0 0 0 / 0.2), 0 8px 10px 1px rgb(0 0 0 / 0.14), 0 3px 14px 2px rgb(0 0 0 / 0.12)';
const elevation24 =
  '0 11px 15px -7px rgb(0 0 0 / 0.2), 0 24px 38px 3px rgb(0 0 0 / 0.14), 0 9px 46px 8px rgb(0 0 0 / 0.12)';

/**
 * Material -- Google's design language: the Material 3 baseline purple, Roboto, pill-shaped buttons
 * and chips, generous touch targets, and the elevation ramp above.
 *
 * Material is the preset that diverges most in its *dark* scheme: M3 flips to light tonal fills
 * with dark on-color ink, which is expressed here as a per-ramp `*Foreground` override rather than
 * one shared ink -- exactly the kind of decision the semantic layer exists to hold.
 */
export const Material: ThemePreset = definePreset(Semi, {
  name: 'material',

  primitive: {
    /** M3's baseline Primary tonal palette (tones 95 down to 10). */
    purple: {
      50: '#f6edff',
      100: '#eaddff',
      200: '#d0bcff',
      300: '#b69df8',
      400: '#9a82db',
      500: '#6750a4',
      600: '#5b459a',
      700: '#4f378b',
      800: '#381e72',
      900: '#2a1461',
      950: '#21005d',
    },
    /** M3's Error tonal palette. */
    red: {
      50: '#fffbf9',
      100: '#f9dedc',
      200: '#f2b8b5',
      300: '#ec928e',
      400: '#e46962',
      500: '#b3261e',
      600: '#8c1d18',
      700: '#601410',
      800: '#410e0b',
      900: '#2d0a07',
      950: '#1a0604',
    },
    green: {
      50: '#e8f5e9',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: '#4caf50',
      600: '#43a047',
      700: '#388e3c',
      800: '#2e7d32',
      900: '#1b5e20',
      950: '#0d3311',
    },
    blue: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
      950: '#082e63',
    },
    /** Material Amber at the light end, Orange from 500 down -- the pairing Material itself uses
     * for "rating gold" versus "warning". */
    amber: {
      50: '#fff8e1',
      100: '#ffecb3',
      200: '#ffe082',
      300: '#ffd54f',
      400: '#ffc107',
      500: '#ff9800',
      600: '#fb8c00',
      700: '#f57c00',
      800: '#ef6c00',
      900: '#e65100',
      950: '#8f3200',
    },
    /** Material's signature teal secondary. */
    teal: {
      50: '#e0f7f4',
      100: '#b2ebe4',
      200: '#80ded3',
      300: '#4dd0c1',
      400: '#1fc9b3',
      500: '#03dac6',
      600: '#00bfa5',
      700: '#00897b',
      800: '#00695c',
      900: '#004d40',
      950: '#00201c',
    },
    /** M3's Neutral / Neutral-Variant tones. */
    slate: {
      50: '#fffbfe',
      100: '#e7e0ec',
      200: '#e6e1e5',
      300: '#cac4d0',
      400: '#b0aab8',
      500: '#9e9e9e',
      600: '#79747e',
      700: '#49454f',
      800: '#2b2930',
      900: '#1c1b1f',
      950: '#121212',
    },
    night: { base: '#121212', raised: '#2b2930', ink: '#1c1b1f' },
  },

  semantic: {
    primary: '{purple.500}',
    palette: { primary: '{purple}' },
    border: '{slate.300}',
    mutedForeground: '{slate.700}',
    success: '{green.500}',
    destructive: '{red.500}',
    warning: '{amber.500}',
    // Material's secondary accent is teal, not a neutral wash -- so `help` gets its own ramp and
    // its own dark ink, rather than aliasing white.
    help: '{teal.500}',
    helpForeground: '{teal.950}',

    radius: { sm: '0.25rem', md: '0.75rem', lg: '1rem' },
    typography: { fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' },
  },

  dark: {
    semantic: {
      // M3's dark scheme: a light tonal fill carrying dark on-color ink, per color family.
      primary: '{purple.200}',
      primaryForeground: '{purple.800}',
      destructive: '{red.200}',
      destructiveForeground: '{red.700}',
      success: '{green.300}',
      successForeground: '{green.950}',
      info: '{blue.300}',
      infoForeground: '{blue.950}',
      warning: '{amber.300}',
      warningForeground: '{amber.950}',
      help: '{teal.300}',
      helpForeground: '{teal.950}',

      border: '{slate.700}',
      mutedForeground: '{slate.300}',
    },
  },

  components: {
    button: {
      // The M3 pill.
      radius: '{radius.full}',
      paddingX: { sm: '1rem', md: '1.5rem', lg: '2rem' },
    },

    // Material's filled text field is tall and roomy, with a small corner.
    input: {
      paddingX: '1rem',
      paddingY: '1rem',
      radius: '{radius.sm}',
      fontSize: '{typography.fontSize.md}',
      borderHover: '{foreground}',
    },
    select: { radius: '{radius.sm}', panelShadow: elevation8 },

    // The M3 switch: a wide outlined track with a small neutral thumb until it's checked.
    switch: {
      trackBorderWidth: '2px',
      background: '{background}',
      border: '{mutedForeground}',
      thumbBackground: '{mutedForeground}',
      trackWidth: { sm: '2.5rem', md: '3.25rem', lg: '4rem' },
      trackHeight: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      thumbSize: { sm: '1.125rem', md: '1.5rem', lg: '1.875rem' },
    },

    popover: { shadow: elevation8 },
    avatar: { statusOffline: '{slate.500}' },

    // M3 chips are pills with a little more breathing room.
    tag: {
      radius: '{radius.full}',
      paddingX: '{spacing.md}',
      variants: {
        // Teal's wash needs a heavier mix and darker ink than the other statuses.
        help: { background: 'color-mix(in srgb, {help} 20%, transparent)', foreground: '{teal.800}' },
      },
    },
    pagination: { radius: '{radius.full}' },
    rating: { filledColor: '{amber.400}' },
    tabs: { indicatorThickness: '3px' },

    // The M3 slider: a thick track with a wide thumb and tick marks drawn *on* the fill.
    slider: {
      trackSize: '1rem',
      thumbSize: '1.5rem',
      thumbBackground: '{primary}',
      tickColor: '{primaryForeground}',
      tickSize: '0.125rem',
    },

    toast: {
      radius: '{radius.sm}',
      shadow: elevation6,
      variants: {
        default: { border: '{border}' },
        success: { border: '{success}' },
        error: { border: '{error}' },
        warning: { border: '{warning}' },
        info: { border: '{info}' },
      },
    },

    dialog: {
      // M3's extra-large corner, which is genuinely bigger than anything else in the theme --
      // a dialog-only shape, so it stays a dialog-only value.
      radius: '1.75rem',
      shadow: elevation24,
      titleFontWeight: '500',
    },

    speedDial: { actionSize: { sm: '2rem', md: '2.5rem', lg: '3rem' }, stagger: '50ms' },

    // Material's touch targets run larger than the default across the board.
    fullCalendar: {
      navButtonSize: '2.5rem',
      navIconSize: '1.05rem',
      toolbarButtonPaddingY: '0.5rem',
      titleFontSize: '1.25rem',
      cellMinHeight: '7rem',
      cellMinHeightWeek: '14rem',
      eventsGap: '0.1875rem',
      eventPaddingX: '0.5rem',
      eventPaddingY: '0.1875rem',
      eventFontSize: '0.75rem',
    },
    treeTable: {
      checkboxColumnWidth: '3rem',
      toggleSize: '1.5rem',
      toggleMarginEnd: '0.1875rem',
      toggleIconSize: '1.05rem',
    },
    richTextEditor: { toolbarGap: '0.1875rem', toolSize: '2rem', toolIconSize: '1.125rem' },
    progressBar: { trackHeight: { sm: '0.5rem', md: '0.625rem', lg: '0.875rem' } },
    scrollTop: { buttonSize: '3.25rem', iconSize: '1.3rem' },
    organizationChart: { nodeMinWidth: '12rem', toggleSize: '1.5rem', gap: '2rem' },
    knob: { valueFontSize: '1.75rem', labelFontSize: '0.8125rem' },
  },
});
