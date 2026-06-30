import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/yuhonas/free-exercise-db/**",
      },
      {
        protocol: "https",
        hostname: "wger.de",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
