import { ThemePreset, definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi';

/** iOS shadows are soft, diffuse and low-opacity -- a big blur radius with barely any spread --
 * the opposite instinct from Material's crisp layered elevation or Fluent's tight ambient+key
 * pairs. Panels lean on this plus translucency (see `toast.blur`) rather than a hard edge. */
const softShadow = '0 8px 30px rgb(0 0 0 / 0.12)';
const softShadowLg = '0 20px 60px rgb(0 0 0 / 0.2)';

/**
 * Cupertino -- Apple's system colors and iOS shape language: capsule buttons and tags, generously
 * rounded cards, borderless filled fields, translucent blurred overlays, and OLED-black dark mode.
 *
 * Note how few color decisions there are. Apple's system palette *is* the primitive layer, so the
 * semantic layer mostly just re-points a shade, and the component layer is almost entirely about
 * shape and translucency rather than color.
 */
export const Cupertino: ThemePreset = definePreset(Semi, {
  name: 'cupertino',

  primitive: {
    // Apple's system colors, light value at 500 and the matching dark value at 400 -- which is
    // exactly the step SemiUI's dark overrides already reach for.
    blue: {
      50: '#eff6ff',
      100: '#d6e9ff',
      200: '#addaff',
      300: '#66b2ff',
      400: '#0a84ff',
      500: '#007aff',
      600: '#0062cc',
      700: '#0a4d9e',
      800: '#0b3b77',
      900: '#0a2a54',
      950: '#061a35',
    },
    red: {
      50: '#fff1f0',
      100: '#ffdedb',
      200: '#ffbdb8',
      300: '#ff8e86',
      400: '#ff453a',
      500: '#ff3b30',
      600: '#d70015',
      700: '#a20811',
      800: '#7a0a10',
      900: '#54080c',
      950: '#320406',
    },
    green: {
      50: '#f0fdf3',
      100: '#d9f8e0',
      200: '#aeefbe',
      300: '#6fe38c',
      400: '#30d158',
      500: '#34c759',
      600: '#248a3d',
      700: '#1c6e31',
      800: '#155526',
      900: '#0f3b1b',
      950: '#082210',
    },
    amber: {
      50: '#fff8ed',
      100: '#ffedd3',
      200: '#ffd8a3',
      300: '#ffbc66',
      400: '#ff9f0a',
      500: '#ff9500',
      600: '#c26f00',
      700: '#94550a',
      800: '#70410b',
      900: '#4d2d08',
      950: '#2d1a05',
    },
    violet: {
      50: '#faf4ff',
      100: '#f3e6ff',
      200: '#e6ccfd',
      300: '#d29ef7',
      400: '#bf5af2',
      500: '#af52de',
      600: '#8b32b8',
      700: '#6d2591',
      800: '#531c6f',
      900: '#39134c',
      950: '#210b2c',
    },
    /** Apple's systemTeal family, which is what iOS uses for informational blue-cyan accents --
     * a genuinely different hue from systemBlue, so it gets its own ramp rather than borrowing a
     * blue shade. */
    cyan: {
      50: '#f0faff',
      100: '#dcf3fe',
      200: '#b9e7fd',
      300: '#8ddafb',
      400: '#71d1fb',
      500: '#5ac8fa',
      600: '#2aa9e0',
      700: '#0071a4',
      800: '#005478',
      900: '#003a53',
      950: '#00212f',
    },
    /** systemGray 1-6, light values at the top of the ramp and dark values at the bottom -- Apple
     * designs them as one continuous neutral family rather than two. */
    slate: {
      50: '#f9f9fb',
      100: '#f2f2f7',
      200: '#e5e5ea',
      300: '#d1d1d6',
      400: '#98989d',
      500: '#8e8e93',
      600: '#636366',
      700: '#48484a',
      800: '#38383a',
      900: '#1c1c1e',
      950: '#000000',
    },
    /** systemYellow. Only the rating star uses it, but it's a real Apple system color, not an
     * arbitrary literal. */
    yellow: '#ffcc00',
  },

  semantic: {
    // True black text on true white, and OLED black in dark mode -- Apple doesn't soften either.
    foreground: '{slate.950}',
    success: '{green.500}',
    destructive: '{red.500}',
    warning: '{amber.500}',
    info: '{cyan.500}',

    radius: { sm: '0.5rem', md: '0.875rem', lg: '1.25rem' },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
      fontWeight: { medium: '600' },
    },
  },

  dark: {
    semantic: {
      background: '{slate.950}',
      foreground: '{white}',
      muted: '{slate.900}',
      // iOS keeps white ink on every vivid fill in dark mode.
      primaryForeground: '{white}',
      successForeground: '{white}',
      infoForeground: '{white}',
      warningForeground: '{white}',
      destructiveForeground: '{white}',
      helpForeground: '{white}',
    },
  },

  components: {
    button: {
      // The capsule "GET"/"Continue" button shape used everywhere in modern iOS.
      radius: '{radius.full}',
      paddingX: { sm: '1rem', md: '1.5rem', lg: '2rem' },
      paddingY: { sm: '0.4375rem', md: '0.625rem', lg: '0.8125rem' },
      fontSize: { sm: '0.8125rem', md: '0.9375rem', lg: '1.0625rem' },
      // iOS's grey secondary button carries blue text, not body text.
      variants: { secondary: { foreground: '{primary}' } },
    },

    // Borderless filled wells, the iOS form field.
    input: {
      paddingY: '0.625rem',
      radius: '{radius.sm}',
      fontSize: '0.9375rem',
      background: '{muted}',
      border: '{transparent}',
    },
    select: {
      paddingY: '0.625rem',
      radius: '{radius.sm}',
      fontSize: '0.9375rem',
      background: '{muted}',
      border: '{transparent}',
      panelBorder: '{transparent}',
      panelShadow: softShadow,
    },

    // The iOS switch is green when on, borderless, and slightly slower than the default.
    switch: {
      trackBorderWidth: '0px',
      background: '{border}',
      backgroundChecked: '{success}',
      border: '{transparent}',
      borderChecked: '{success}',
      thumbBackground: '{white}',
      transitionDuration: '0.2s',
    },
    checkbox: { radius: '{radius.full}', border: '{mutedForeground}' },
    radio: { border: '{mutedForeground}' },

    popover: { border: '{transparent}', shadow: softShadow },
    // Slightly translucent rather than fully opaque, so it reads as glass over the content.
    tooltip: { background: 'color-mix(in srgb, {contrast} 90%, transparent)' },
    chart: { tooltipBackground: 'color-mix(in srgb, {contrast} 90%, transparent)' },

    avatar: { radius: '{radius.full}' },
    tag: {
      radius: '{radius.full}',
      paddingX: '0.625rem',
      variants: {
        // Apple's green and teal washes need their own darker ink to stay legible.
        success: { foreground: '{green.600}' },
        info: { background: 'color-mix(in srgb, {info} 20%, transparent)', foreground: '{cyan.700}' },
      },
    },

    pagination: {
      radius: '{radius.full}',
      border: '{transparent}',
      background: '{muted}',
      backgroundHover: '{border}',
    },
    rating: { filledColor: '{yellow}' },

    // iOS groups content on tinted cards rather than separating it with rules.
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

    // Heavier blur and a more transparent base than the default -- iOS notification glass.
    toast: {
      shadow: softShadow,
      blur: 'blur(20px)',
      variants: {
        default: { background: 'color-mix(in srgb, {background} 75%, transparent)' },
        success: {
          background: 'color-mix(in srgb, {success} 16%, color-mix(in srgb, {background} 75%, transparent))',
        },
        error: {
          background: 'color-mix(in srgb, {error} 16%, color-mix(in srgb, {background} 75%, transparent))',
        },
        warning: {
          background: 'color-mix(in srgb, {warning} 16%, color-mix(in srgb, {background} 75%, transparent))',
        },
        info: {
          background: 'color-mix(in srgb, {info} 16%, color-mix(in srgb, {background} 75%, transparent))',
        },
      },
    },

    fileUpload: {
      background: '{muted}',
      backgroundDragOver: '{border}',
      itemBackground: '{background}',
    },

    dialog: {
      backdropColor: 'rgb(0 0 0 / 0.4)',
      panelBorder: '{transparent}',
      shadow: softShadowLg,
      titleFontSize: '1.0625rem',
      titleFontWeight: '600',
    },

    speedDial: { actionSize: { sm: '1.875rem', md: '2.25rem', lg: '2.625rem' }, stagger: '45ms' },

    // iOS runs a touch larger than the default across the board.
    fullCalendar: {
      navButtonSize: '2.25rem',
      navIconSize: '0.95rem',
      toolbarButtonPaddingY: '0.4375rem',
      titleFontSize: '1.15rem',
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
      toggleIconSize: '0.95rem',
    },
    richTextEditor: { toolbarGap: '0.1875rem', toolSize: '1.875rem', toolIconSize: '1.05rem' },
    scrollTop: { buttonSize: '3rem', iconSize: '1.2rem' },
    organizationChart: { nodeMinWidth: '11rem', toggleSize: '1.375rem', gap: '1.75rem' },
    knob: { valueFontSize: '1.625rem', labelFontSize: '0.8125rem' },
  },
});
