import { ThemePreset, definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi';

/** One UI leans on very soft, wide shadows and rounded "capsule card" surfaces rather than edges. */
const softShadow = '0 4px 16px rgb(0 0 0 / 0.14)';
const softShadowLg = '0 12px 36px rgb(0 0 0 / 0.22)';

/**
 * Samsung -- One UI: unusually large corner radii, borderless filled fields and cards, a bright
 * cyan-leaning accent set, and true-black dark mode.
 *
 * The oversized radius scale is one decision (`semantic.radius`), and it reshapes buttons, cards,
 * panels, dialogs and chips together -- which is the whole reason component tokens reference the
 * scale instead of carrying their own corner values.
 */
export const Samsung: ThemePreset = definePreset(Semi, {
  name: 'samsung',

  primitive: {
    blue: {
      50: '#eef6ff',
      100: '#d6e9ff',
      200: '#a9d0ff',
      300: '#6db2ff',
      400: '#3e91ff',
      500: '#0381fe',
      600: '#0072de',
      700: '#0059ad',
      800: '#004282',
      900: '#002d59',
      950: '#001a33',
    },
    red: {
      50: '#fff1f1',
      100: '#ffdcdc',
      200: '#ffbdbd',
      300: '#ff8f8f',
      400: '#ff6b6b',
      500: '#ff5252',
      600: '#e03131',
      700: '#b02525',
      800: '#851c1c',
      900: '#5c1313',
      950: '#330a0a',
    },
    green: {
      50: '#e6fbf5',
      100: '#c0f5e6',
      200: '#84ecd0',
      300: '#3ddfb4',
      400: '#12d3a4',
      500: '#00c896',
      600: '#00a87e',
      700: '#00875f',
      800: '#00664a',
      900: '#004633',
      950: '#00281d',
    },
    amber: {
      50: '#fff8e6',
      100: '#ffefc2',
      200: '#ffdd85',
      300: '#ffc647',
      400: '#ffb31a',
      500: '#ffa000',
      600: '#d68600',
      700: '#a86800',
      800: '#7d4e00',
      900: '#523300',
      950: '#2e1d00',
    },
    violet: {
      50: '#f6f1fd',
      100: '#ece0fa',
      200: '#d9c2f4',
      300: '#bd97ea',
      400: '#ab80e4',
      500: '#9c6ade',
      600: '#7f4cc4',
      700: '#653a9e',
      800: '#4c2b78',
      900: '#341d52',
      950: '#1e102f',
    },
    slate: {
      50: '#fafafc',
      100: '#f5f5f7',
      200: '#e8e8ea',
      300: '#d1d1d6',
      400: '#9a9a9e',
      500: '#8a8a8e',
      600: '#636366',
      700: '#48484a',
      800: '#2c2c2e',
      900: '#1c1c1e',
      950: '#191919',
    },
    night: {
      base: '#000000',
      raised: '#1c1c1e',
      ink: '#000000',
      /** One UI's dark-mode body text -- a hair off pure white, so long reads don't glare. */
      text: '#f2f2f2',
    },
  },

  semantic: {
    foreground: '{slate.950}',
    success: '{green.500}',
    destructive: '{red.500}',
    warning: '{amber.500}',

    // One UI's defining shape decision.
    radius: { sm: '0.75rem', md: '1.25rem', lg: '1.75rem' },
    typography: {
      fontFamily: '"SamsungOne", "Noto Sans", Roboto, system-ui, sans-serif',
      fontWeight: { medium: '600' },
    },
  },

  dark: {
    semantic: {
      foreground: '{night.text}',
      // One UI keeps white ink on its blue, but its bright accents read better with black.
      primaryForeground: '{white}',
    },
  },

  components: {
    button: {
      radius: '{radius.lg}',
      paddingX: { sm: '1rem', md: '1.375rem', lg: '1.75rem' },
      paddingY: { sm: '0.5rem', md: '0.6875rem', lg: '0.875rem' },
      fontSize: { sm: '0.8125rem', md: '0.9375rem', lg: '1.0625rem' },
    },

    // Borderless filled fields, One UI's form style.
    input: {
      paddingX: '0.875rem',
      paddingY: '0.625rem',
      radius: '{radius.sm}',
      fontSize: '0.9375rem',
      background: '{muted}',
      border: '{transparent}',
    },
    select: {
      paddingX: '0.875rem',
      paddingY: '0.625rem',
      radius: '{radius.sm}',
      fontSize: '0.9375rem',
      background: '{muted}',
      border: '{transparent}',
      panelBorder: '{transparent}',
      panelShadow: softShadow,
    },

    switch: {
      trackBorderWidth: '0px',
      background: '{border}',
      border: '{transparent}',
      thumbBackground: '{white}',
      transitionDuration: '0.2s',
    },
    checkbox: { radius: '{radius.sm}', border: '{mutedForeground}' },
    radio: { border: '{mutedForeground}' },

    popover: { border: '{transparent}', shadow: softShadow },
    tooltip: { background: 'color-mix(in srgb, {contrast} 92%, transparent)' },
    chart: { tooltipBackground: 'color-mix(in srgb, {contrast} 92%, transparent)' },

    avatar: { radius: '{radius.full}' },
    tag: {
      radius: '{radius.full}',
      paddingX: '0.625rem',
      variants: {
        // The bright cyan-green and blue washes need their own darker ink to stay legible.
        success: { foreground: '{green.700}' },
        info: { foreground: '{blue.600}' },
      },
    },

    pagination: {
      radius: '{radius.md}',
      border: '{transparent}',
      background: '{muted}',
      backgroundHover: '{border}',
    },

    // One UI groups content on tinted cards rather than separating it with rules.
    accordion: {
      border: '{transparent}',
      headerBackground: '{muted}',
      headerBackgroundHover: '{border}',
      panelBackground: '{muted}',
    },
    tabs: { border: '{transparent}' },
    table: { border: '{transparent}' },
    stepper: { circleBorder: '{transparent}', circleBackground: '{muted}' },

    slider: {
      trackSize: '0.25rem',
      thumbSize: '1.5rem',
      thumbBackground: '{white}',
      thumbBorder: '{transparent}',
    },

    carousel: { arrowBackground: 'rgb(0 0 0 / 0.3)', arrowBackgroundHover: 'rgb(0 0 0 / 0.5)' },

    toast: {
      shadow: softShadow,
      variants: {
        default: { background: 'color-mix(in srgb, {background} 92%, transparent)' },
        success: {
          background: 'color-mix(in srgb, {success} 16%, color-mix(in srgb, {background} 92%, transparent))',
        },
        error: {
          background: 'color-mix(in srgb, {error} 16%, color-mix(in srgb, {background} 92%, transparent))',
        },
        warning: {
          background: 'color-mix(in srgb, {warning} 16%, color-mix(in srgb, {background} 92%, transparent))',
        },
        info: {
          background: 'color-mix(in srgb, {info} 16%, color-mix(in srgb, {background} 92%, transparent))',
        },
      },
    },

    fileUpload: {
      background: '{muted}',
      backgroundDragOver: '{border}',
      itemBackground: '{background}',
    },

    dialog: {
      backdropColor: 'rgb(0 0 0 / 0.45)',
      panelBorder: '{transparent}',
      shadow: softShadowLg,
      titleFontSize: '1.0625rem',
      titleFontWeight: '600',
    },

    speedDial: { actionSize: { sm: '2rem', md: '2.375rem', lg: '2.75rem' }, stagger: '45ms' },

    fullCalendar: {
      navButtonSize: '2.375rem',
      navIconSize: '1rem',
      toolbarButtonPaddingY: '0.4375rem',
      titleFontSize: '1.2rem',
      cellMinHeight: '6.5rem',
      cellMinHeightWeek: '13rem',
      eventsGap: '0.1875rem',
      eventPaddingX: '0.4375rem',
      eventPaddingY: '0.1875rem',
      eventFontSize: '0.75rem',
    },
    treeTable: {
      checkboxColumnWidth: '2.75rem',
      toggleSize: '1.375rem',
      toggleMarginEnd: '0.1875rem',
      toggleIconSize: '1rem',
    },
    richTextEditor: { toolbarGap: '0.1875rem', toolSize: '1.875rem', toolIconSize: '1.05rem' },
    scrollTop: { buttonSize: '3rem', iconSize: '1.2rem' },
    organizationChart: { nodeMinWidth: '11rem', toggleSize: '1.375rem', gap: '1.75rem' },
    knob: { valueFontSize: '1.625rem', labelFontSize: '0.8125rem' },
  },
});
