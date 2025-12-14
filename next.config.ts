import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'custom-cms-v1.vercel.app',
        pathname: '/api/files/**',
      },
    ],
  },
};

export default nextConfig;
