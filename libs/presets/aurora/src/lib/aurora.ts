import { ColorTokens, ThemePreset } from '@zaytoon/tokens';

const lightColor: ColorTokens = {
  background: '#ffffff',
  foreground: '#0b1220',
  primary: '#6366f1',
  primaryForeground: '#ffffff',
  destructive: '#dc2626',
  destructiveForeground: '#ffffff',
  border: '#e5e7eb',
  ring: '#6366f1',
  muted: '#f3f4f6',
  mutedForeground: '#6b7280',
};

const darkColor: ColorTokens = {
  background: '#0b1220',
  foreground: '#e5e9f0',
  primary: '#818cf8',
  primaryForeground: '#0b1220',
  destructive: '#f87171',
  destructiveForeground: '#0b1220',
  border: '#1f2937',
  ring: '#818cf8',
  muted: '#111827',
  mutedForeground: '#9ca3af',
};

export const Aurora: ThemePreset = {
  name: 'aurora',
  tokens: {
    color: lightColor,
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
        focusRing: 'var(--zaytoon-color-ring)',
        backgroundDisabled: 'var(--zaytoon-color-muted)',
        foregroundDisabled: 'var(--zaytoon-color-muted-foreground)',
        paddingX: { sm: '0.75rem', md: '1rem', lg: '1.25rem', icon: '0.5rem' },
        paddingY: { sm: '0.375rem', md: '0.5rem', lg: '0.625rem', icon: '0.5rem' },
        fontSize: { sm: '0.8125rem', md: '0.875rem', lg: '1rem', icon: '0.875rem' },
        variants: {
          primary: {
            background: 'var(--zaytoon-color-primary)',
            foreground: 'var(--zaytoon-color-primary-foreground)',
            border: 'var(--zaytoon-color-primary)',
          },
          secondary: {
            background: 'var(--zaytoon-color-muted)',
            foreground: 'var(--zaytoon-color-foreground)',
            border: 'var(--zaytoon-color-muted)',
          },
          outline: {
            background: 'transparent',
            foreground: 'var(--zaytoon-color-foreground)',
            border: 'var(--zaytoon-color-border)',
          },
          ghost: {
            background: 'transparent',
            foreground: 'var(--zaytoon-color-foreground)',
            border: 'transparent',
          },
          destructive: {
            background: 'var(--zaytoon-color-destructive)',
            foreground: 'var(--zaytoon-color-destructive-foreground)',
            border: 'var(--zaytoon-color-destructive)',
          },
          link: {
            background: 'transparent',
            foreground: 'var(--zaytoon-color-primary)',
            border: 'transparent',
          },
        },
      },
      input: {
        paddingX: '0.75rem',
        paddingY: '0.5rem',
        radius: '0.5rem',
        fontSize: '0.875rem',
        background: 'var(--zaytoon-color-background)',
        foreground: 'var(--zaytoon-color-foreground)',
        placeholderForeground: 'var(--zaytoon-color-muted-foreground)',
        border: 'var(--zaytoon-color-border)',
        borderHover: 'var(--zaytoon-color-muted-foreground)',
        borderFocus: 'var(--zaytoon-color-ring)',
        focusRing: 'var(--zaytoon-color-ring)',
        borderInvalid: 'var(--zaytoon-color-destructive)',
        backgroundDisabled: 'var(--zaytoon-color-muted)',
        foregroundDisabled: 'var(--zaytoon-color-muted-foreground)',
      },
    },
  },
  darkColor,
  icons: {
    loading: { type: 'ng-icon', name: 'lucideLoaderCircle' },
  },
};
