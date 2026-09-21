import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/remote-:tag-jobs",
        destination: "/tag/:tag",
      },
      {
        source: "/remote-jobs-in-:location",
        destination: "/location/:location",
      },
      {
        source: "/api",
        destination: "/remote-jobs.json",
      },
    ];
  },
};

export default nextConfig;
