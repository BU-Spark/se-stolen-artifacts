import { createTheme, darken, lighten } from '@mui/material/styles';
import { PaletteMode, ThemeOptions } from '@mui/material';

const primaryRed = '#E00025';
const secondaryRed = '#E37D8E';
const primaryBlue = '#032EA1';
const secondaryBlue = '#566CA6';
const primaryGray = '#757474';
const secondaryGray = '#76877D';

const primary = primaryRed; // interactive
const secondary = primaryBlue; // text
const neutral = primaryGray;
const slate = secondaryGray;
const primaryLight = lighten(primary, 0.35);

const mist = lighten(secondary, 0.65);
const inputHover = lighten(secondary, 0.4);
const inputFocusGlow = lighten(secondary, 0.75);

const backgroundDefault = lighten(primaryBlue, 0.82);
const backgroundPaper = lighten(primaryGray, 0.88);
const borderColor = lighten(slate, 0.45);
const focusOutline = secondary;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primary,
      light: primaryLight,
      contrastText: '#fff',
    },
    secondary: {
      main: secondary,
      contrastText: lighten(neutral, 0.92),
    },
    error: {
      main: secondaryRed,
      contrastText: '#fff',
    },
    warning: {
      main: '#D98C00',
      contrastText: darken('#D98C00', 0.6),
    },
    info: {
      main: mist,
      contrastText: darken(mist, 0.6),
    },
    background: {
      default: backgroundDefault,
      paper: backgroundPaper,
    },
    text: {
      primary: secondary,
      secondary: neutral,
    },
    divider: borderColor,
    grey: {
      500: neutral,
      400: slate,
    },
  },
  typography: {
    fontFamily: 'var(--font-outfit), "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      color: secondary,
    },
    h2: {
      color: secondary,
    },
    h3: {
      color: secondary,
    },
    h4: {
      color: secondary,
    },
    h5: {
      color: secondary,
    },
    h6: {
      color: secondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `linear-gradient(45deg, ${secondaryBlue} 0%, ${lighten(secondaryRed, 0.6)} 100%)`,
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          color: secondary,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: '1.5rem',
        },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${primaryBlue}, ${primaryRed})`,
          color: '#fff',
        },
        containedSecondary: {
          backgroundImage: `linear-gradient(135deg, ${primaryRed}, ${darken(primaryRed, 0.18)})`,
          color: '#fff',
        },
        outlined: {
          borderColor: secondary,
          color: secondary,
          '&:hover': {
            borderColor: darken(secondary, 0.12),
            backgroundColor: lighten(secondary, 0.88),
          },
        },
        textPrimary: {
          color: secondary,
          '&:hover': {
            backgroundColor: lighten(secondary, 0.9),
          },
        },
        textSecondary: {
          color: secondary,
          '&:hover': {
            backgroundColor: lighten(secondary, 0.9),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: backgroundPaper,
          backdropFilter: 'blur(3px)',
          border: `1px solid ${borderColor}`,
        },
      },
    },
    MuiChip: {
      defaultProps: {
        size: 'medium',
      },
      styleOverrides: {
        filled: {
          backgroundColor: primaryLight,
          color: '#fff',
          '&.MuiChip-clickable:hover, &:hover': {
            backgroundColor: darken(primaryLight, 0.08),
          },
        },
        outlined: {
          borderColor: primaryLight,
          color: primaryLight,
          '&.MuiChip-clickable:hover, &:hover': {
            backgroundColor: lighten(primaryLight, 0.9),
          },
        },
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {},
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: inputHover,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: focusOutline,
            boxShadow: `0 0 0 4px ${inputFocusGlow}`,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: secondary,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: secondary,
          '&.Mui-focused': {
            color: secondary,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: lighten(secondary, 0.35),
          '&.Mui-checked': {
            color: primary,
          },
        },
      },
    },
  },
});

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
          borderRadius: Number(theme.shape.borderRadius) * 1.2,
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

export default theme;
export const themeTokens = {
  // semantic aliases
  primary,
  primaryLight,
  secondary,
  neutral,
  slate,
  mist,
  backgroundDefault,
  backgroundPaper,
  borderColor,
  focusOutline,
  // raw color set
  primaryRed,
  secondaryRed,
  primaryBlue,
  secondaryBlue,
  primaryGray,
  secondaryGray,
} as const;
