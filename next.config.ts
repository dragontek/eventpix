import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {},
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dragontek.io',
        pathname: '/v1/storage/**',
      },
    ],
  },
};

export default nextConfig;
