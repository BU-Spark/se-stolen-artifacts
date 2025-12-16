import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Khmer Statuary Project | Landing',
  description:
    'Explore the Khmer Statuary Project database to investigate provenance, track restitution efforts, and collaborate across teams.',
};

export default function LandingPageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
