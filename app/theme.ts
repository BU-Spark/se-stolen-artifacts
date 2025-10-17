import { createTheme, darken, lighten } from '@mui/material/styles';

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
          backgroundImage: `linear-gradient(45deg, ${lighten(primaryBlue, 0.4)} 0%, ${mist} 100%)`,
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
          backgroundImage: `linear-gradient(135deg, ${primaryBlue}, ${secondaryRed})`,
          color: '#fff',
        },
        containedSecondary: {
          backgroundImage: `linear-gradient(135deg, ${primaryRed}, ${darken(primaryRed, 0.18)})`,
          color: '#fff',
        },
        outlinedPrimary: {
          borderColor: secondary,
          color: secondary,
          '&:hover': {
            borderColor: darken(secondary, 0.12),
            backgroundColor: lighten(secondary, 0.88),
          },
        },
        outlinedSecondary: {
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
        filledPrimary: {
          backgroundColor: primaryLight,
          color: '#fff',
          '&.MuiChip-clickable:hover, &:hover': {
            backgroundColor: darken(primaryLight, 0.08),
          },
        },
        outlinedPrimary: {
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
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            '&:hover fieldset': {
              borderColor: inputHover,
            },
            '&.Mui-focused fieldset': {
              borderColor: focusOutline,
              boxShadow: `0 0 0 4px ${inputFocusGlow}`,
            },
          },
        },
      },
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
};
