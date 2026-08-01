export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

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
  };
}
