export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonVariantTokens {
  background: string;
  foreground: string;
  backgroundHover: string;
  backgroundActive: string;
  border: string;
}

export interface ThemeTokens {
  color: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    border: string;
    ring: string;
    muted: string;
    mutedForeground: string;
  };
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
  };
}
