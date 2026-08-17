export const CRAFTOR_TOKENS = {
  colors: {
    dark: {
      bgCanvas: 'hsl(222, 47%, 7%)',
      bgSurface: 'hsl(222, 47%, 11%)',
      bgSurfaceHover: 'hsl(222, 47%, 16%)',
      borderSubtle: 'hsl(222, 30%, 18%)',
      borderFocus: 'hsl(243, 75%, 59%)',
      textPrimary: 'hsl(210, 40%, 98%)',
      textSecondary: 'hsl(215, 20%, 65%)',
      primary: 'hsl(243, 75%, 59%)',
      diffAdded: 'hsl(158, 64%, 52%)',
      diffModified: 'hsl(38, 92%, 50%)',
      diffDeleted: 'hsl(0, 84%, 60%)',
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    space1: '4px',
    space2: '8px',
    space3: '12px',
    space4: '16px',
    space6: '24px',
    space8: '32px',
  },
  radii: {
    sm: '4px',
    md: '6px',
    lg: '10px',
    full: '9999px',
  },
} as const;
