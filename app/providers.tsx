'use client';

import { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { MuiThemeProvider } from './theme-provider';
import { ErrorBoundary } from './components/ErrorBoundary';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <MuiThemeProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default AppThemeProvider;
