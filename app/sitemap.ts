import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: agora, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/sobre`, lastModified: agora, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/politica-de-privacidade`, lastModified: agora, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/termos`, lastModified: agora, changeFrequency: "yearly", priority: 0.3 },
  ];
}