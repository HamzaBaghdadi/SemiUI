import { ComponentTokens, PrimitiveTokens, SemanticTokens, ThemeOverrides, ThemePreset } from '@semiui/tokens';

/**
 * Semi -- SemiUI's default preset, and the reference implementation of the token architecture.
 *
 * Read it top to bottom and it reads as a chain of design decisions:
 *
 *     primitive   what colors and scales exist at all
 *     semantic    what those values *mean* in this theme
 *     dark        the handful of meanings that change in dark mode
 *     components  which meaning each component part uses
 *
 * Nothing below names a CSS custom property. Every cross-reference is a `{token.path}`, and the
 * token engine turns those into live `var()` references at generation time -- which is what makes
 * `definePreset(Semi, { semantic: { primary: '{violet.500}' } })` re-color the entire library
 * without touching a single component token.
 */

// ---------------------------------------------------------------------------------------------
// Layer 1 -- primitives: raw values, no meaning attached
// ---------------------------------------------------------------------------------------------

const primitive: PrimitiveTokens = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },

  /** Semi's own dark-mode surfaces -- a touch bluer than `slate.950`, which is what gives the
   * dark theme its cool cast rather than reading as neutral charcoal. */
  night: {
    /** The page itself. */
    base: '#0b1120',
    /** Recessed/raised surfaces on top of `base` -- input fills, striped rows. */
    raised: '#111827',
    /** Ink drawn *on* a vivid fill in dark mode, where pure white would glare. */
    ink: '#0b1220',
  },
};

// ---------------------------------------------------------------------------------------------
// Layer 2 -- semantics: what the values mean
// ---------------------------------------------------------------------------------------------

const semantic: SemanticTokens = {
  background: '{white}',
  foreground: '{slate.900}',

  primary: '{blue.500}',
  primaryForeground: '{white}',
  // Secondary is a recessive wash rather than a color of its own, so it's an alias pair. Presets
  // that want a genuinely distinct secondary hue just point these at a scale instead.
  secondary: '{muted}',
  secondaryForeground: '{foreground}',
  success: '{green.600}',
  successForeground: '{white}',
  info: '{blue.500}',
  infoForeground: '{white}',
  warning: '{amber.600}',
  warningForeground: '{white}',
  destructive: '{red.600}',
  destructiveForeground: '{white}',
  help: '{violet.500}',
  helpForeground: '{white}',
  // Maximum contrast against the current surface. Because these alias foreground/background, they
  // invert for free in dark mode -- no dark override needed.
  contrast: '{foreground}',
  contrastForeground: '{background}',

  muted: '{slate.100}',
  mutedForeground: '{slate.500}',
  border: '{slate.200}',
  ring: '{primary}',

  // Aliases, not copies: one source of truth per color, reachable under every name the library's
  // component APIs use. Repointing `destructive` moves `danger` and `error` with it.
  danger: '{destructive}',
  dangerForeground: '{destructiveForeground}',
  error: '{destructive}',
  errorForeground: '{destructiveForeground}',
  warn: '{warning}',
  warnForeground: '{warningForeground}',

  // The full ramp behind `primary`, referenced as a whole object and expanded shade by shade by
  // the engine. This is what the Tailwind bridge exposes as `primary-50` .. `primary-950`.
  palette: {
    primary: '{blue}',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      sm: '0.875rem',
      md: '1rem',
    },
    fontWeight: {
      medium: '500',
    },
  },
};

// ---------------------------------------------------------------------------------------------
// Dark mode -- semantic overrides only
// ---------------------------------------------------------------------------------------------

/**
 * Ten semantic re-points, and the whole library follows. There is no parallel dark component tree:
 * `button.variants.primary.background` is `'{primary}'` in both modes, and `{primary}` is what
 * changes here.
 */
const dark: ThemeOverrides = {
  semantic: {
    background: '{night.base}',
    foreground: '{slate.200}',

    // Vivid mid-tones are too heavy on a dark surface; every status color steps one shade lighter,
    // and its foreground steps to near-black ink so the contrast direction flips with it.
    primary: '{blue.400}',
    primaryForeground: '{night.ink}',
    success: '{green.500}',
    successForeground: '{night.ink}',
    info: '{blue.400}',
    infoForeground: '{night.ink}',
    warning: '{amber.500}',
    warningForeground: '{night.ink}',
    destructive: '{red.400}',
    destructiveForeground: '{night.ink}',
    help: '{violet.400}',
    helpForeground: '{night.ink}',

    muted: '{night.raised}',
    mutedForeground: '{slate.400}',
    border: '{slate.800}',
  },
};

// ---------------------------------------------------------------------------------------------
// Layer 3 -- components: which meaning each part uses
// ---------------------------------------------------------------------------------------------

const components: ComponentTokens = {
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
      secondary: { background: '{secondary}', foreground: '{secondaryForeground}', border: '{secondary}' },
      destructive: { background: '{destructive}', foreground: '{destructiveForeground}', border: '{destructive}' },
      danger: { background: '{danger}', foreground: '{dangerForeground}', border: '{danger}' },
      success: { background: '{success}', foreground: '{successForeground}', border: '{success}' },
      info: { background: '{info}', foreground: '{infoForeground}', border: '{info}' },
      warn: { background: '{warn}', foreground: '{warnForeground}', border: '{warn}' },
      help: { background: '{help}', foreground: '{helpForeground}', border: '{help}' },
      contrast: { background: '{contrast}', foreground: '{contrastForeground}', border: '{contrast}' },
      link: { background: '{transparent}', foreground: '{primary}', border: '{transparent}' },
    },
  },

  input: {
    paddingX: '{spacing.md}',
    paddingY: '{spacing.sm}',
    radius: '{radius.md}',
    fontSize: '{typography.fontSize.sm}',
    background: '{background}',
    foreground: '{foreground}',
    placeholderForeground: '{mutedForeground}',
    border: '{border}',
    borderHover: '{mutedForeground}',
    borderFocus: '{ring}',
    focusRing: '{ring}',
    borderInvalid: '{destructive}',
    backgroundDisabled: '{muted}',
    foregroundDisabled: '{mutedForeground}',
  },

  select: {
    paddingX: '{spacing.md}',
    paddingY: '{spacing.sm}',
    radius: '{radius.md}',
    fontSize: '{typography.fontSize.sm}',
    background: '{background}',
    foreground: '{foreground}',
    placeholderForeground: '{mutedForeground}',
    border: '{border}',
    borderHover: '{mutedForeground}',
    borderFocus: '{ring}',
    focusRing: '{ring}',
    borderInvalid: '{destructive}',
    backgroundDisabled: '{muted}',
    foregroundDisabled: '{mutedForeground}',
    panelBackground: '{background}',
    panelBorder: '{border}',
    // A shadow is a raw CSS value -- there's no design-system token that means "this elevation",
    // and inventing one for a single component would be a meaningless global.
    panelShadow: '0 8px 24px rgb(15 23 42 / 0.10)',
    panelMaxHeight: '16rem',
    optionForeground: '{foreground}',
    optionBackgroundHover: '{muted}',
    optionBackgroundSelected: '{primary}',
    optionForegroundSelected: '{primaryForeground}',
  },

  switch: {
    trackPadding: '0.125rem',
    trackBorderWidth: '1px',
    radius: '{radius.full}',
    background: '{muted}',
    backgroundChecked: '{primary}',
    border: '{border}',
    borderChecked: '{primary}',
    thumbBackground: '{background}',
    focusRing: '{ring}',
    backgroundDisabled: '{muted}',
    transitionDuration: '0.15s',
    trackWidth: { sm: '2rem', md: '2.75rem', lg: '3.5rem' },
    trackHeight: { sm: '1.125rem', md: '1.5rem', lg: '1.875rem' },
    thumbSize: { sm: '0.875rem', md: '1.125rem', lg: '1.5rem' },
  },

  checkbox: {
    radius: '0.25rem',
    border: '{border}',
    borderChecked: '{primary}',
    background: '{background}',
    backgroundChecked: '{primary}',
    foregroundChecked: '{primaryForeground}',
    focusRing: '{ring}',
    backgroundDisabled: '{muted}',
    borderDisabled: '{border}',
    size: { sm: '1rem', md: '1.25rem', lg: '1.5rem' },
  },

  radio: {
    border: '{border}',
    borderChecked: '{primary}',
    background: '{background}',
    backgroundDisabled: '{muted}',
    borderDisabled: '{border}',
    dotBackground: '{primary}',
    focusRing: '{ring}',
    size: { sm: '1rem', md: '1.25rem', lg: '1.5rem' },
  },

  popover: {
    background: '{background}',
    border: '{border}',
    shadow: '0 8px 24px rgb(15 23 42 / 0.10)',
    radius: '{radius.md}',
    foreground: '{foreground}',
    paddingX: '{spacing.lg}',
    paddingY: '{spacing.md}',
  },

  tooltip: {
    background: '{contrast}',
    foreground: '{contrastForeground}',
    radius: '{radius.sm}',
    paddingX: '{spacing.sm}',
    paddingY: '{spacing.xs}',
    fontSize: '{typography.fontSize.sm}',
  },

  skeleton: {
    background: '{muted}',
    shimmer: 'color-mix(in srgb, {mutedForeground} 20%, transparent)',
    radius: '{radius.sm}',
  },

  avatar: {
    background: '{muted}',
    foreground: '{foreground}',
    radius: '{radius.md}',
    // Presence dots are status colors, not avatar colors -- so they come from the semantic layer
    // and shift with it in dark mode like everything else.
    statusOnline: '{success}',
    statusAway: '{warning}',
    statusBusy: '{destructive}',
    statusOffline: '{mutedForeground}',
    size: { sm: '1.75rem', md: '2.5rem', lg: '3.5rem', xl: '5rem' },
    fontSize: { sm: '0.625rem', md: '0.875rem', lg: '1.125rem', xl: '1.5rem' },
  },

  tag: {
    radius: '{radius.sm}',
    fontSize: '{typography.fontSize.sm}',
    paddingX: '{spacing.sm}',
    paddingY: '0.125rem',
    // Every status tag is the same recipe -- a 15% wash of its own semantic color, with that color
    // as the ink. Nothing here restates what the color *is*.
    variants: {
      default: { background: '{muted}', foreground: '{foreground}', border: '{transparent}' },
      primary: {
        background: 'color-mix(in srgb, {primary} 15%, transparent)',
        foreground: '{primary}',
        border: '{transparent}',
      },
      secondary: { background: '{muted}', foreground: '{mutedForeground}', border: '{transparent}' },
      destructive: {
        background: 'color-mix(in srgb, {destructive} 15%, transparent)',
        foreground: '{destructive}',
        border: '{transparent}',
      },
      danger: {
        background: 'color-mix(in srgb, {danger} 15%, transparent)',
        foreground: '{danger}',
        border: '{transparent}',
      },
      success: {
        background: 'color-mix(in srgb, {success} 15%, transparent)',
        foreground: '{success}',
        border: '{transparent}',
      },
      info: {
        background: 'color-mix(in srgb, {info} 15%, transparent)',
        foreground: '{info}',
        border: '{transparent}',
      },
      warn: {
        background: 'color-mix(in srgb, {warn} 15%, transparent)',
        foreground: '{warn}',
        border: '{transparent}',
      },
      help: {
        background: 'color-mix(in srgb, {help} 15%, transparent)',
        foreground: '{help}',
        border: '{transparent}',
      },
      contrast: { background: '{contrast}', foreground: '{contrastForeground}', border: '{transparent}' },
      outline: { background: '{transparent}', foreground: '{foreground}', border: '{border}' },
    },
  },

  breadcrumb: {
    foreground: '{mutedForeground}',
    currentForeground: '{foreground}',
    separatorColor: '{mutedForeground}',
    fontSize: '{typography.fontSize.sm}',
    gap: '0.375rem',
  },

  badge: {
    size: '1.25rem',
    dotSize: '0.625rem',
    fontSize: '0.6875rem',
    ringColor: '{background}',
    variants: {
      default: { background: '{muted}', foreground: '{foreground}', border: '{transparent}' },
      primary: { background: '{primary}', foreground: '{primaryForeground}', border: '{transparent}' },
      secondary: { background: '{secondary}', foreground: '{secondaryForeground}', border: '{transparent}' },
      destructive: { background: '{destructive}', foreground: '{destructiveForeground}', border: '{transparent}' },
      danger: { background: '{danger}', foreground: '{dangerForeground}', border: '{transparent}' },
      success: { background: '{success}', foreground: '{successForeground}', border: '{transparent}' },
      info: { background: '{info}', foreground: '{infoForeground}', border: '{transparent}' },
      warn: { background: '{warn}', foreground: '{warnForeground}', border: '{transparent}' },
      help: { background: '{help}', foreground: '{helpForeground}', border: '{transparent}' },
      contrast: { background: '{contrast}', foreground: '{contrastForeground}', border: '{transparent}' },
      outline: { background: '{background}', foreground: '{foreground}', border: '{border}' },
    },
  },

  pagination: {
    radius: '{radius.sm}',
    gap: '{spacing.xs}',
    size: '2.25rem',
    border: '{border}',
    background: '{transparent}',
    foreground: '{foreground}',
    backgroundHover: '{muted}',
    backgroundActive: '{primary}',
    foregroundActive: '{primaryForeground}',
    foregroundDisabled: '{mutedForeground}',
  },

  rating: {
    filledColor: '{warning}',
    emptyColor: '{border}',
    gap: '0',
    size: { sm: '1.25rem', md: '2rem', lg: '2.75rem' },
  },

  accordion: {
    border: '{border}',
    radius: '{radius.md}',
    headerBackground: '{transparent}',
    headerBackgroundHover: '{muted}',
    headerForeground: '{foreground}',
    panelBackground: '{transparent}',
    panelForeground: '{mutedForeground}',
    fontSize: '{typography.fontSize.sm}',
    fontWeight: '{typography.fontWeight.medium}',
    paddingX: '{spacing.md}',
    paddingY: '{spacing.sm}',
  },

  tabs: {
    border: '{border}',
    gap: '{spacing.md}',
    foreground: '{mutedForeground}',
    foregroundActive: '{primary}',
    foregroundDisabled: '{mutedForeground}',
    indicatorColor: '{primary}',
    indicatorThickness: '2px',
    fontSize: '{typography.fontSize.sm}',
    fontWeight: '{typography.fontWeight.medium}',
    paddingX: '{spacing.md}',
    paddingY: '{spacing.sm}',
  },

  stepper: {
    circleSize: '2rem',
    circleBorder: '{border}',
    circleBackground: '{background}',
    circleForeground: '{mutedForeground}',
    circleBackgroundActive: '{primary}',
    circleForegroundActive: '{primaryForeground}',
    circleBackgroundCompleted: '{primary}',
    circleForegroundCompleted: '{primaryForeground}',
    connectorColor: '{border}',
    connectorColorCompleted: '{primary}',
    labelColor: '{mutedForeground}',
    labelColorActive: '{foreground}',
    descriptionColor: '{mutedForeground}',
    fontSize: '{typography.fontSize.sm}',
    gap: '{spacing.sm}',
  },

  slider: {
    trackSize: '0.375rem',
    trackColor: '{muted}',
    fillColor: '{primary}',
    thumbSize: '1.125rem',
    thumbBackground: '{background}',
    thumbBorder: '{primary}',
    thumbBorderFocus: '{ring}',
    tickColor: '{border}',
    tickSize: '0.25rem',
    bubbleBackground: '{contrast}',
    bubbleForeground: '{contrastForeground}',
  },

  chart: {
    gridColor: '{border}',
    axisLabelColor: '{mutedForeground}',
    axisLabelFontSize: '9px',
    tooltipBackground: '{contrast}',
    tooltipForeground: '{contrastForeground}',
    tooltipRadius: '{radius.sm}',
    legendFontSize: '{typography.fontSize.sm}',
    legendGap: '{spacing.md}',
    lineStrokeWidth: '2',
    areaOpacity: '0.15',
  },

  table: {
    border: '{border}',
    radius: '{radius.md}',
    headerBackground: '{muted}',
    headerForeground: '{foreground}',
    rowBackground: '{background}',
    rowBackgroundStriped: '{muted}',
    rowBackgroundHover: '{muted}',
    rowBackgroundSelected: 'color-mix(in srgb, {primary} 12%, transparent)',
    fontSize: '{typography.fontSize.sm}',
    cellPaddingX: '{spacing.md}',
    cellPaddingY: '{spacing.sm}',
    sortIconColor: '{mutedForeground}',
    sortIconColorActive: '{foreground}',
  },

  colorPicker: {
    svAreaSize: '12rem',
    hueTrackHeight: '0.75rem',
    thumbSize: '1rem',
    hueThumbWidth: '0.75rem',
    presetSize: '1.5rem',
    presetGap: '0.375rem',
    presetBorder: '{border}',
    presetBorderSelected: '{primary}',
  },

  datePicker: {
    daySize: '2.25rem',
    fontSize: '{typography.fontSize.sm}',
    dayForeground: '{foreground}',
    dayForegroundOutsideMonth: '{mutedForeground}',
    dayBackgroundHover: '{muted}',
    dayBackgroundSelected: '{primary}',
    dayForegroundSelected: '{primaryForeground}',
    dayBorderToday: '{primary}',
    navBackgroundHover: '{muted}',
    weekdayForeground: '{mutedForeground}',
    monthLabelForeground: '{foreground}',
  },

  carousel: {
    radius: '{radius.lg}',
    arrowSize: '2.5rem',
    // Chrome drawn over arbitrary photography, so it's deliberately not theme-derived: it has to
    // read against whatever image is underneath, in either mode.
    arrowBackground: 'rgb(0 0 0 / 0.4)',
    arrowBackgroundHover: 'rgb(0 0 0 / 0.6)',
    arrowColor: '{white}',
    dotSize: '0.5rem',
    dotColor: '{border}',
    dotColorActive: '{primary}',
    dotGap: '{spacing.xs}',
  },

  toast: {
    radius: '{radius.md}',
    shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    paddingX: '{spacing.md}',
    paddingY: '{spacing.sm}',
    gap: '{spacing.sm}',
    width: '24rem',
    blur: 'blur(12px)',
    variants: {
      default: {
        background: 'color-mix(in srgb, {background} 88%, transparent)',
        foreground: '{foreground}',
        border: '{transparent}',
        iconColor: '{mutedForeground}',
      },
      success: {
        background: 'color-mix(in srgb, {success} 14%, color-mix(in srgb, {background} 88%, transparent))',
        foreground: '{foreground}',
        border: '{transparent}',
        iconColor: '{success}',
      },
      error: {
        background: 'color-mix(in srgb, {error} 14%, color-mix(in srgb, {background} 88%, transparent))',
        foreground: '{foreground}',
        border: '{transparent}',
        iconColor: '{error}',
      },
      warning: {
        background: 'color-mix(in srgb, {warning} 14%, color-mix(in srgb, {background} 88%, transparent))',
        foreground: '{foreground}',
        border: '{transparent}',
        iconColor: '{warning}',
      },
      info: {
        background: 'color-mix(in srgb, {info} 14%, color-mix(in srgb, {background} 88%, transparent))',
        foreground: '{foreground}',
        border: '{transparent}',
        iconColor: '{info}',
      },
    },
  },

  fileUpload: {
    border: '{border}',
    borderDragOver: '{primary}',
    background: '{transparent}',
    backgroundDragOver: '{muted}',
    radius: '{radius.lg}',
    iconColor: '{mutedForeground}',
    hintColor: '{foreground}',
    acceptColor: '{mutedForeground}',
    itemBackground: '{muted}',
    itemBorder: '{border}',
    itemRadius: '{radius.md}',
    thumbSize: '2.5rem',
    rejectionColor: '{destructive}',
  },

  dialog: {
    backdropColor: 'rgb(0 0 0 / 0.5)',
    panelBackground: '{background}',
    panelBorder: '{border}',
    radius: '{radius.lg}',
    shadow: '0 24px 48px -12px rgb(15 23 42 / 0.20), 0 12px 24px -12px rgb(15 23 42 / 0.12)',
    headerBorder: '{border}',
    footerBorder: '{border}',
    titleFontSize: '1.125rem',
    titleFontWeight: '700',
    padding: '{spacing.lg}',
    // Genuinely component-local: a dialog's width has no design-system meaning outside dialogs,
    // so it stays here rather than becoming a global token nothing else would use.
    widths: { sm: '24rem', md: '32rem', lg: '48rem', full: 'calc(100vw - 2rem)' },
  },

  speedDial: {
    radius: '{radius.full}',
    shadow: '{components.popover.shadow}',
    gap: '{spacing.md}',
    actionSize: { sm: '1.75rem', md: '2rem', lg: '2.375rem' },
    // A speed-dial action *is* a secondary button; referencing Button's own tokens keeps them in
    // step rather than restating the decision. Component-to-component references are allowed --
    // they just have to be references, not copied values.
    actionBackground: '{components.button.variants.secondary.background}',
    actionForeground: '{components.button.variants.secondary.foreground}',
    actionBorder: '{components.button.variants.secondary.border}',
    stagger: '40ms',
  },

  fullCalendar: {
    navButtonSize: '2rem',
    navIconSize: '0.85rem',
    toolbarButtonPaddingY: '0.375rem',
    titleFontSize: '1.1rem',
    cellMinHeight: '6rem',
    cellMinHeightWeek: '12rem',
    eventsGap: '0.125rem',
    eventPaddingX: '0.375rem',
    eventPaddingY: '0.125rem',
    eventFontSize: '0.7rem',
  },

  treeTable: {
    checkboxColumnWidth: '2.5rem',
    toggleSize: '1.25rem',
    toggleMarginEnd: '0.125rem',
    toggleIconSize: '0.85rem',
  },

  richTextEditor: {
    toolbarGap: '0.125rem',
    toolSize: '1.75rem',
    toolIconSize: '0.95rem',
    contentHeadingFontSizeLg: '1.5em',
    contentHeadingFontSizeMd: '1.25em',
    contentBlockSpacing: '0.5em',
    contentListIndent: '1.5em',
  },

  timeline: {
    markerIconSize: '0.85rem',
    connectorMinLength: '2rem',
    contentGap: '0.125rem',
  },

  cascadeSelect: {
    panelMinWidth: '12rem',
  },

  contextMenu: {
    panelMinWidth: '12rem',
  },

  autoComplete: {
    inputPaddingEnd: '2rem',
  },

  progressBar: {
    trackHeight: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem' },
    labelFontSize: '0.75rem',
  },

  scrollTop: {
    buttonSize: '2.75rem',
    iconSize: '1.1rem',
  },

  splitButton: {
    menuMinWidth: '10rem',
  },

  imageCropper: {
    // Drawn over the user's own image rather than over app chrome, so it's translucent white in
    // both modes by design -- one of the few places a raw value is the right answer.
    gridLineColor: 'rgba(255, 255, 255, 0.6)',
    zoomSliderMaxWidth: '16rem',
  },

  organizationChart: {
    nodeMinWidth: '10rem',
    nodeBackgroundSelected: 'color-mix(in srgb, {primary} 12%, transparent)',
    nodeBorderSelected: '{primary}',
    toggleSize: '1.25rem',
    gap: '1.5rem',
  },

  knob: {
    valueFontSize: '1.5rem',
    labelColor: '{mutedForeground}',
    labelFontSize: '0.75rem',
  },
};

export const Semi: ThemePreset = {
  name: 'semi',
  primitive,
  semantic,
  dark,
  components,
  icons: {
    loading: { type: 'ng-icon', name: 'lucideLoaderCircle' },
    chevronDown: { type: 'ng-icon', name: 'lucideChevronDown' },
    clear: { type: 'ng-icon', name: 'lucideX' },
    passwordShow: { type: 'ng-icon', name: 'lucideEye' },
    passwordHide: { type: 'ng-icon', name: 'lucideEyeOff' },
    checkboxCheck: { type: 'ng-icon', name: 'lucideCheck' },
    checkboxIndeterminate: { type: 'ng-icon', name: 'lucideMinus' },
    search: { type: 'ng-icon', name: 'lucideSearch' },
    plus: { type: 'ng-icon', name: 'lucidePlus' },
    minus: { type: 'ng-icon', name: 'lucideMinus' },
    avatarFallback: { type: 'ng-icon', name: 'lucideUser' },
    rating: { type: 'ng-icon', name: 'lucideStar' },
    upload: { type: 'ng-icon', name: 'lucideUpload' },
    file: { type: 'ng-icon', name: 'lucideFile' },
    toastSuccess: { type: 'ng-icon', name: 'lucideCircleCheck' },
    toastError: { type: 'ng-icon', name: 'lucideCircleX' },
    toastWarning: { type: 'ng-icon', name: 'lucideTriangleAlert' },
    toastInfo: { type: 'ng-icon', name: 'lucideInfo' },
  },
};
