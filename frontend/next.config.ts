import type { NextConfig } from "next";

const API_ORIGIN = process.env.ADAPT_API_ORIGIN || "http://127.0.0.1:8765";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
