import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://ootydogs.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/listings", "/breeds", "/services", "/blogs", "/contact"],
        disallow: ["/admin/", "/my/", "/profile", "/api/", "/_next/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
