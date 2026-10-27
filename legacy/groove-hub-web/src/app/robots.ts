import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/team-portal", "/api/"],
    },
    sitemap: "https://syncra-qui2.onrender.com/sitemap.xml",
  };
}
