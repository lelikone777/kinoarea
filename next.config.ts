import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "variety.com",
      },
      {
        protocol: "https",
        hostname: "www.hollywoodreporter.com",
      },
      {
        protocol: "https",
        hostname: "deadline.com",
      },
      {
        protocol: "https",
        hostname: "www.deadline.com",
      },
    ],
  },
};

export default nextConfig;
