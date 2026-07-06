import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/signup", "/login", "/pricing", "/support", "/privacy", "/terms"],
      disallow: [
        "/api/",
        "/dashboard/",
        "/settings/",
        "/adminpanel/",
        "/f/",
        "/p/",
        "/onboarding/",
        "/ai-builder/",
        "/templates/",
        "/file-manager/",
        "/forms/",
        "/analytics/"
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
