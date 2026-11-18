import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 85],
    localPatterns: [
      { pathname: "/api/apps/media/**" },
      { pathname: "/api/web-projects/media/**" },
      { pathname: "/assets/**" },
    ],
  },
  experimental: {
    proxyClientMaxBodySize: "500mb",
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
