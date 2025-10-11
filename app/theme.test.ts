import theme, { themeTokens } from './theme';
import { createTheme, darken, lighten } from '@mui/material/styles';

describe('theme', () => {
  it('exports a valid theme object', () => {
    expect(theme).toBeDefined();
    expect(theme.palette).toBeDefined();
    expect(theme.typography).toBeDefined();
    expect(theme.shape).toBeDefined();
    expect(theme.components).toBeDefined();
  });

  it('has light mode configured', () => {
    expect(theme.palette.mode).toBe('light');
  });

  it('has correct primary color', () => {
    expect(theme.palette.primary.main).toBe('#5B3000');
  });

  it('has correct secondary color', () => {
    expect(theme.palette.secondary.main).toBe('#66462C');
  });

  it('has correct info color', () => {
    expect(theme.palette.info.main).toBe('#82A6B1');
  });

  it('has correct text colors', () => {
    expect(theme.palette.text.primary).toBe('#5B3000');
    expect(theme.palette.text.secondary).toBe('#76877D');
  });

  it('has custom border radius', () => {
    expect(theme.shape.borderRadius).toBe(16);
  });

  it('has correct font family', () => {
    expect(theme.typography.fontFamily).toContain('Outfit');
    expect(theme.typography.fontFamily).toContain('var(--font-outfit)');
  });

  it('has button text transform set to none', () => {
    expect(theme.typography.button.textTransform).toBe('none');
  });

  it('has button font weight configured', () => {
    expect(theme.typography.button.fontWeight).toBe(600);
  });

  it('sets all heading colors to primary', () => {
    expect(theme.typography.h1.color).toBe('#5B3000');
    expect(theme.typography.h2.color).toBe('#5B3000');
    expect(theme.typography.h3.color).toBe('#5B3000');
    expect(theme.typography.h4.color).toBe('#5B3000');
    expect(theme.typography.h5.color).toBe('#5B3000');
    expect(theme.typography.h6.color).toBe('#5B3000');
  });

  it('has background colors configured', () => {
    expect(theme.palette.background.default).toBeDefined();
    expect(theme.palette.background.paper).toBeDefined();
  });

  it('has divider color configured', () => {
    expect(theme.palette.divider).toBeDefined();
  });

  it('configures MuiButton component', () => {
    expect(theme.components?.MuiButton).toBeDefined();
    expect(theme.components?.MuiButton?.defaultProps?.disableElevation).toBe(true);
  });

  it('configures MuiButton with rounded corners', () => {
    expect(theme.components?.MuiButton?.styleOverrides?.root?.borderRadius).toBe(999);
  });

  it('configures MuiButton with horizontal padding', () => {
    expect(theme.components?.MuiButton?.styleOverrides?.root?.paddingInline).toBe('1.5rem');
  });

  it('configures MuiButton contained primary with gradient', () => {
    const gradient = theme.components?.MuiButton?.styleOverrides?.containedPrimary?.backgroundImage;
    expect(gradient).toBeDefined();
    expect(gradient).toContain('linear-gradient');
    expect(gradient).toContain('#5B3000');
    expect(gradient).toContain('#66462C');
  });

  it('configures MuiPaper component', () => {
    expect(theme.components?.MuiPaper).toBeDefined();
    expect(theme.components?.MuiPaper?.styleOverrides?.root?.backdropFilter).toBe('blur(3px)');
  });

  it('configures MuiPaper with border', () => {
    const border = theme.components?.MuiPaper?.styleOverrides?.root?.border;
    expect(border).toBeDefined();
    expect(border).toContain('1px solid');
  });

  it('configures MuiChip component', () => {
    expect(theme.components?.MuiChip).toBeDefined();
    expect(theme.components?.MuiChip?.defaultProps?.size).toBe('medium');
  });

  it('configures MuiChip with font weight', () => {
    expect(theme.components?.MuiChip?.styleOverrides?.root?.fontWeight).toBe(600);
  });

  it('configures MuiTextField component', () => {
    expect(theme.components?.MuiTextField).toBeDefined();
    expect(theme.components?.MuiTextField?.styleOverrides?.root).toBeDefined();
  });

  it('configures MuiTextField with rounded input', () => {
    const borderRadius =
      theme.components?.MuiTextField?.styleOverrides?.root?.['& .MuiOutlinedInput-root']?.borderRadius;
    expect(borderRadius).toBe(14);
  });

  it('configures MuiTextField hover state', () => {
    const hoverState =
      theme.components?.MuiTextField?.styleOverrides?.root?.['& .MuiOutlinedInput-root']?.['&:hover fieldset'];
    expect(hoverState?.borderColor).toBe('#82A6B1');
  });

  it('configures MuiTextField focus state with shadow', () => {
    const focusState =
      theme.components?.MuiTextField?.styleOverrides?.root?.['& .MuiOutlinedInput-root']?.['&.Mui-focused fieldset'];
    expect(focusState?.boxShadow).toBeDefined();
    expect(focusState?.boxShadow).toContain('0 0 0 4px');
  });

  it('configures MuiCheckbox component', () => {
    expect(theme.components?.MuiCheckbox).toBeDefined();
    expect(theme.components?.MuiCheckbox?.styleOverrides?.root?.color).toBe('#66462C');
  });

  it('configures MuiCheckbox checked state', () => {
    const checkedState = theme.components?.MuiCheckbox?.styleOverrides?.root?.['&.Mui-checked'];
    expect(checkedState?.color).toBe('#5B3000');
  });

  it('configures MuiCssBaseline with gradient background', () => {
    const bodyStyles = theme.components?.MuiCssBaseline?.styleOverrides?.body;
    expect(bodyStyles?.backgroundImage).toBeDefined();
    expect(bodyStyles?.backgroundImage).toContain('linear-gradient');
    expect(bodyStyles?.backgroundAttachment).toBe('fixed');
    expect(bodyStyles?.backgroundRepeat).toBe('no-repeat');
  });
});

describe('themeTokens', () => {
  it('exports primary token', () => {
    expect(themeTokens.primary).toBe('#5B3000');
  });

  it('exports secondary token', () => {
    expect(themeTokens.secondary).toBe('#66462C');
  });

  it('exports neutral token', () => {
    expect(themeTokens.neutral).toBe('#726953');
  });

  it('exports slate token', () => {
    expect(themeTokens.slate).toBe('#76877D');
  });

  it('exports mist token', () => {
    expect(themeTokens.mist).toBe('#82A6B1');
  });

  it('all token values are valid hex colors', () => {
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    expect(themeTokens.primary).toMatch(hexColorRegex);
    expect(themeTokens.secondary).toMatch(hexColorRegex);
    expect(themeTokens.neutral).toMatch(hexColorRegex);
    expect(themeTokens.slate).toMatch(hexColorRegex);
    expect(themeTokens.mist).toMatch(hexColorRegex);
  });

  it('has all required tokens', () => {
    expect(Object.keys(themeTokens)).toEqual(
      expect.arrayContaining(['primary', 'secondary', 'neutral', 'slate', 'mist'])
    );
  });
});

describe('theme creation', () => {
  it('creates a theme without errors', () => {
    expect(() => {
      createTheme({
        palette: {
          primary: { main: '#5B3000' },
        },
      });
    }).not.toThrow();
  });

  it('uses lighten function correctly', () => {
    const lightened = lighten('#726953', 0.82);
    expect(lightened).toBeDefined();
    expect(typeof lightened).toBe('string');
  });

  it('uses darken function correctly', () => {
    const darkened = darken('#82A6B1', 0.2);
    expect(darkened).toBeDefined();
    expect(typeof darkened).toBe('string');
  });
});

describe('theme consistency', () => {
  it('has consistent primary color across palette and typography', () => {
    expect(theme.palette.primary.main).toBe(theme.typography.h1.color);
  });

  it('has consistent color scheme', () => {
    expect(theme.palette.primary.main).toBe(themeTokens.primary);
    expect(theme.palette.secondary.main).toBe(themeTokens.secondary);
  });

  it('has text primary matching theme primary color', () => {
    expect(theme.palette.text.primary).toBe(themeTokens.primary);
  });

  it('has text secondary matching slate token', () => {
    expect(theme.palette.text.secondary).toBe(themeTokens.slate);
  });
});