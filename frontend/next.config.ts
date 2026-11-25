import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  reactStrictMode: true,
};

export default nextConfig;
