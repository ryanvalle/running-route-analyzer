import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable experimental features for better caching
  experimental: {
    // Enable proper ISR behavior
  },
};

export default nextConfig;
