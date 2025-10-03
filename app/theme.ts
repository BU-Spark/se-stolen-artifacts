import { PaletteMode, ThemeOptions, createTheme } from '@mui/material';

const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#4f9cf9',
      dark: '#226dba',
    },
    secondary: {
      main: '#28a745',
      dark: '#1e7a34',
    },
    error: {
      main: '#d32f2f',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "var(--font-outfit, 'Inter', 'Helvetica Neue', Arial, sans-serif)",
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          borderRadius: theme.shape.borderRadius,
          paddingBlock: theme.spacing(1.25),
          paddingInline: theme.spacing(2.5),
          fontSize: theme.typography.pxToRem(16),
          ...(ownerState.variant === 'contained' && {
            boxShadow: 'none',
          }),
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius * 1.2,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
  },
};

export const createAppTheme = (mode: PaletteMode) =>
  createTheme({
    ...baseThemeOptions,
    palette: {
      ...baseThemeOptions.palette,
      mode,
      background: {
        default: mode === 'light' ? '#f4f7fb' : '#0b1119',
        paper: mode === 'light' ? '#ffffff' : '#141b26',
      },
      text: {
        primary: mode === 'light' ? '#1e293b' : '#f8fafc',
        secondary: mode === 'light' ? '#475569' : '#cbd5f5',
      },
      divider: mode === 'light' ? 'rgba(15, 23, 42, 0.12)' : 'rgba(148, 163, 184, 0.24)',
    },
  });

export type AppThemeMode = PaletteMode;
