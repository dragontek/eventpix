import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@ionic/react',
    '@ionic/core',
    '@stencil/core',
    'ionicons',
  ],
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
  webpack: (config, { isServer, webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/.*\.entry\.js$/,
        contextRegExp: /@stencil\/core\/internal\/client/,
      })
    );
    return config;
  },
};

export default nextConfig;
