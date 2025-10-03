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
