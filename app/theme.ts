import { createTheme, darken, lighten } from '@mui/material/styles';

const primary = '#5B3000';
const secondary = '#66462C';
const neutral = '#726953';
const slate = '#76877D';
const mist = '#82A6B1';

const backgroundDefault = lighten(neutral, 0.82);
const backgroundPaper = lighten(neutral, 0.88);
const borderColor = lighten(slate, 0.45);
const focusOutline = darken(mist, 0.2);

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primary,
      contrastText: lighten(neutral, 0.92),
    },
    secondary: {
      main: secondary,
      contrastText: lighten(neutral, 0.92),
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
      primary: primary,
      secondary: slate,
    },
    divider: borderColor,
  },
  typography: {
    fontFamily: 'var(--font-outfit), "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { color: primary },
    h2: { color: primary },
    h3: { color: primary },
    h4: { color: primary },
    h5: { color: primary },
    h6: { color: primary },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `linear-gradient(180deg, ${lighten(neutral, 0.1)} 0%, ${mist} 100%)`,
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          color: primary,
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
          backgroundImage: `linear-gradient(135deg, ${primary}, ${secondary})`,
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
          backgroundColor: mist,
          color: darken(mist, 0.6),
        },
        outlined: {
          borderColor: mist,
          color: darken(mist, 0.6),
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
              borderColor: mist,
            },
            '&.Mui-focused fieldset': {
              borderColor: focusOutline,
              boxShadow: `0 0 0 4px ${lighten(mist, 0.48)}`,
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: secondary,
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
  primary,
  secondary,
  neutral,
  slate,
  mist,
};
