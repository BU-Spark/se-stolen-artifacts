import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';

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
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <Providers>
            <div className="main-content-container">{children}</div>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
