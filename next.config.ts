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
      {
        source: "/careerhound-review",
        destination: "/vs/careerhound",
      },
      {
        source: "/careerhound-reviews",
        destination: "/vs/careerhound",
      },
      {
        source: "/is-careerhound-legit",
        destination: "/vs/careerhound",
      },
      {
        source: "/careerhound-alternatives",
        destination: "/vs/careerhound",
      },
      {
        source: "/worldwide",
        destination: "/worldwide-remote-jobs",
      },
      {
        source: "/remote/jobs-for-introverts",
        destination: "/remote-jobs-for-introverts",
      },
      {
        source: "/remote/project-manager/titles",
        destination: "/project-manager-titles",
      },
    ];
  },
};

export default nextConfig;
