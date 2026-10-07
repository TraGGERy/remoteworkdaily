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
      {
        source: "/10-best-virtual-secret-santa-ideas-for-remote-teams",
        destination: "/10-best-virtual-secret-santa-ideas-for",
      },
    ];
  },
};

export default nextConfig;
