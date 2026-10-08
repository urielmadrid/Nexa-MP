import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexa MP",
    short_name: "Nexa MP",
    description: "Estratégia digital para negócios em crescimento.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#F36304",
    lang: "pt-BR",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
