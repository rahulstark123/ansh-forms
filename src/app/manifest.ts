import { MetadataRoute } from "next";
import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ANSH Forms — High-Performance Forms & AI Landing Page Builder",
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "/anshFavicon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
