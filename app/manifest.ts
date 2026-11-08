import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexa MP",
    short_name: "Nexa MP",
    description: "Estratégia digital para negócios em crescimento.",
    start_url: "/",
    display: "standalone",
    background_color: "#040404",
    theme_color: "#F36304",
    lang: "pt-BR",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}