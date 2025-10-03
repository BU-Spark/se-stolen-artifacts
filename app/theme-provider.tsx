'use client';

import { CssBaseline, PaletteMode, ThemeProvider } from '@mui/material';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { createAppTheme } from './theme';
import { useLocalStorage } from './hooks';

const STORAGE_KEY = 'mui-color-mode';

const resolveInitialMode = (): PaletteMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  if (storedValue) {
    try {
      const parsed = JSON.parse(storedValue) as PaletteMode;
      if (parsed === 'light' || parsed === 'dark') {
        return parsed;
      }
    } catch (error) {
      console.warn('Unable to parse stored color mode:', error);
    }
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

type ColorModeContextValue = {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggleMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setStoredMode] = useLocalStorage<PaletteMode>(STORAGE_KEY, resolveInitialMode());

  const setMode = useCallback(
    (nextMode: PaletteMode) => {
      setStoredMode(nextMode);
    },
    [setStoredMode]
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode: () => {
        setStoredMode((prev) => (prev === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode, setMode, setStoredMode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within MuiThemeProvider');
  }
  return context;
};
