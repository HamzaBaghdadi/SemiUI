import { ThemePreset } from '@zaytoon/tokens';

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
        paddingX: '1rem',
        paddingY: '0.5rem',
        radius: '0.5rem',
        fontWeight: '500',
        background: '#6366f1',
        foreground: '#ffffff',
        backgroundHover: '#4f46e5',
        backgroundActive: '#4338ca',
        backgroundDisabled: '#374151',
        foregroundDisabled: '#6b7280',
        focusRing: '#818cf8',
      },
    },
  },
};
