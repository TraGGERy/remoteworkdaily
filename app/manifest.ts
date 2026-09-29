import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Remote Work Daily — Verified Remote Jobs",
    short_name: "Remote Work Daily",
    description: "Verified remote careers with 100% transparent pay updated daily.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#FF4742",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
