import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "레시피북",
    short_name: "레시피북",
    description: "나만의 레시피 기록장",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF6F0",
    theme_color: "#FFF6F0",
    icons: [
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
