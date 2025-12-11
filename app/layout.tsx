import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ClerkProvider } from '@clerk/nextjs';
import { AppThemeProvider } from './providers';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Khmer Statuary Project',
  description: 'Cambodian Artifact Database & Search Engine',
  keywords: ['Next.js', 'React', 'TypeScript', 'Template'],
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <AppThemeProvider>
            <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
              <ErrorBoundary>
                <Navbar />
                <div className="main-content-container" style={{ paddingTop: 56 }}>
                  {children}
                </div>
              </ErrorBoundary>
            </ClerkProvider>
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
