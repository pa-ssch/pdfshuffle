import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  webpack: (config) => {
    // Prevent pdfjs-dist from trying to load the optional canvas package in Node
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
