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
      paddingX: string;
      paddingY: string;
      radius: string;
      fontWeight: string;
      background: string;
      foreground: string;
      backgroundHover: string;
      backgroundActive: string;
      backgroundDisabled: string;
      foregroundDisabled: string;
      focusRing: string;
    };
  };
}
