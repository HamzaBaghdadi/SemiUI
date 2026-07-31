import { ButtonSize, ButtonVariant, ButtonVariantTokens, ThemePreset } from '@zaytoon/tokens';

const buttonVariants: Record<ButtonVariant, ButtonVariantTokens> = {
  primary: {
    background: '#6366f1',
    foreground: '#ffffff',
    backgroundHover: '#4f46e5',
    backgroundActive: '#4338ca',
    border: '#6366f1',
  },
  secondary: {
    background: '#1f2937',
    foreground: '#e5e9f0',
    backgroundHover: '#27303f',
    backgroundActive: '#111827',
    border: '#1f2937',
  },
  outline: {
    background: 'transparent',
    foreground: '#e5e9f0',
    backgroundHover: '#1f2937',
    backgroundActive: '#111827',
    border: '#374151',
  },
  ghost: {
    background: 'transparent',
    foreground: '#e5e9f0',
    backgroundHover: '#1f2937',
    backgroundActive: '#111827',
    border: 'transparent',
  },
  destructive: {
    background: '#ef4444',
    foreground: '#ffffff',
    backgroundHover: '#dc2626',
    backgroundActive: '#b91c1c',
    border: '#ef4444',
  },
  link: {
    background: 'transparent',
    foreground: '#6366f1',
    backgroundHover: 'transparent',
    backgroundActive: 'transparent',
    border: 'transparent',
  },
};

const buttonPaddingX: Record<ButtonSize, string> = {
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  icon: '0.5rem',
};

const buttonPaddingY: Record<ButtonSize, string> = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.625rem',
  icon: '0.5rem',
};

const buttonFontSize: Record<ButtonSize, string> = {
  sm: '0.8125rem',
  md: '0.875rem',
  lg: '1rem',
  icon: '0.875rem',
};

export const Aurora: ThemePreset = {
  name: 'aurora',
  tokens: {
    color: {
      background: '#0b1220',
      foreground: '#e5e9f0',
      primary: '#6366f1',
      primaryForeground: '#ffffff',
      border: '#1f2937',
      ring: '#818cf8',
      muted: '#111827',
      mutedForeground: '#9ca3af',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
    radius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      full: '9999px',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSizeSm: '0.875rem',
      fontSizeMd: '1rem',
      fontWeightMedium: '500',
    },
    comp: {
      button: {
        radius: '0.5rem',
        fontWeight: '500',
        focusRing: '#818cf8',
        backgroundDisabled: '#374151',
        foregroundDisabled: '#6b7280',
        paddingX: buttonPaddingX,
        paddingY: buttonPaddingY,
        fontSize: buttonFontSize,
        variants: buttonVariants,
      },
    },
  },
  icons: {
    loading: { type: 'ng-icon', name: 'lucideLoaderCircle' },
  },
};
