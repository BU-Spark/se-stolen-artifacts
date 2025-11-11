import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage domain for signed URLs
      {
        protocol: 'https',
        hostname: 'kgvcbjohlfsbzrysausq.supabase.co',
      },
      // Add other Supabase domains if needed
      // You can add more patterns here for different Supabase projects
    ],
  },
};

export default nextConfig;
