import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['iron-session'],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
