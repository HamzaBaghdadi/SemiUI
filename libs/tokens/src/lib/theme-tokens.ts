export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type TagVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline';

export interface ButtonVariantTokens {
  background: string;
  foreground: string;
  border: string;
}

/**
 * The palette category is the only part of the token contract that's expected to differ between
 * light and dark mode. Everything else (spacing, radius, component tokens) stays mode-agnostic --
 * component tokens should reference these via `var(--zaytoon-color-*)` rather than literal colors,
 * so they adapt automatically when the color palette swaps.
 */
export interface ColorTokens {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  ring: string;
  muted: string;
  mutedForeground: string;
}

export interface ThemeTokens {
  color: ColorTokens;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  typography: {
    fontFamily: string;
    fontSizeSm: string;
    fontSizeMd: string;
    fontWeightMedium: string;
  };
  comp: {
    button: {
      radius: string;
      fontWeight: string;
      focusRing: string;
      backgroundDisabled: string;
      foregroundDisabled: string;
      paddingX: Record<ButtonSize, string>;
      paddingY: Record<ButtonSize, string>;
      fontSize: Record<ButtonSize, string>;
      variants: Record<ButtonVariant, ButtonVariantTokens>;
    };
    input: {
      paddingX: string;
      paddingY: string;
      radius: string;
      fontSize: string;
      background: string;
      foreground: string;
      placeholderForeground: string;
      border: string;
      borderHover: string;
      borderFocus: string;
      focusRing: string;
      borderInvalid: string;
      backgroundDisabled: string;
      foregroundDisabled: string;
    };
    select: {
      paddingX: string;
      paddingY: string;
      radius: string;
      fontSize: string;
      background: string;
      foreground: string;
      placeholderForeground: string;
      border: string;
      borderHover: string;
      borderFocus: string;
      focusRing: string;
      borderInvalid: string;
      backgroundDisabled: string;
      foregroundDisabled: string;
      panelBackground: string;
      panelBorder: string;
      panelShadow: string;
      optionForeground: string;
      optionBackgroundHover: string;
      optionBackgroundSelected: string;
      optionForegroundSelected: string;
    };
    switch: {
      trackPadding: string;
      trackBorderWidth: string;
      radius: string;
      background: string;
      backgroundChecked: string;
      border: string;
      borderChecked: string;
      thumbBackground: string;
      focusRing: string;
      backgroundDisabled: string;
      transitionDuration: string;
      trackWidth: Record<ButtonSize, string>;
      trackHeight: Record<ButtonSize, string>;
      thumbSize: Record<ButtonSize, string>;
    };
    checkbox: {
      radius: string;
      border: string;
      borderChecked: string;
      background: string;
      backgroundChecked: string;
      foregroundChecked: string;
      focusRing: string;
      backgroundDisabled: string;
      borderDisabled: string;
      size: Record<ButtonSize, string>;
    };
    radio: {
      border: string;
      borderChecked: string;
      background: string;
      backgroundDisabled: string;
      borderDisabled: string;
      dotBackground: string;
      focusRing: string;
      size: Record<ButtonSize, string>;
    };
    popover: {
      background: string;
      border: string;
      shadow: string;
      radius: string;
      foreground: string;
      paddingX: string;
      paddingY: string;
    };
    tooltip: {
      background: string;
      foreground: string;
      radius: string;
      paddingX: string;
      paddingY: string;
      fontSize: string;
    };
    skeleton: {
      background: string;
      shimmer: string;
      radius: string;
    };
    avatar: {
      background: string;
      foreground: string;
      radius: string;
      statusOnline: string;
      statusAway: string;
      statusBusy: string;
      statusOffline: string;
      size: Record<'sm' | 'md' | 'lg' | 'xl', string>;
      fontSize: Record<'sm' | 'md' | 'lg' | 'xl', string>;
    };
    tag: {
      radius: string;
      fontSize: string;
      paddingX: string;
      paddingY: string;
      variants: Record<TagVariant, ButtonVariantTokens>;
    };
    breadcrumb: {
      foreground: string;
      currentForeground: string;
      separatorColor: string;
      fontSize: string;
      gap: string;
    };
    badge: {
      size: string;
      dotSize: string;
      fontSize: string;
      ringColor: string;
      variants: Record<TagVariant, ButtonVariantTokens>;
    };
    pagination: {
      radius: string;
      gap: string;
      size: string;
      border: string;
      background: string;
      foreground: string;
      backgroundHover: string;
      backgroundActive: string;
      foregroundActive: string;
      foregroundDisabled: string;
    };
    rating: {
      filledColor: string;
      emptyColor: string;
      gap: string;
      size: Record<ButtonSize, string>;
    };
    accordion: {
      border: string;
      radius: string;
      headerBackground: string;
      headerBackgroundHover: string;
      headerForeground: string;
      panelBackground: string;
      panelForeground: string;
      fontSize: string;
      fontWeight: string;
      paddingX: string;
      paddingY: string;
    };
  };
}
