import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Market Morning - 출근길 시장 브리핑",
    short_name: "Market Morning",
    description: "국내 증시 개장 전 5분 시장 브리핑",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f0e8",
    theme_color: "#153f38",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
