import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MuiThemeProvider } from './theme-provider';
import { ClerkProvider } from '@clerk/nextjs';
import { AppThemeProvider } from './providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Spark! Next.js Template',
  description: 'Spark! Next.js Template',
  keywords: ['Next.js', 'React', 'TypeScript', 'Template'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body>
        <MuiThemeProvider>
          <ErrorBoundary>
            <div className="main-content-container">{children}</div>
          </ErrorBoundary>
        </MuiThemeProvider>
        <AppThemeProvider>
          <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <ErrorBoundary>
              <div className="main-content-container">{children}</div>
            </ErrorBoundary>
          </ClerkProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
