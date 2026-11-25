import { MetadataRoute } from "next";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://ootydogs.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/listings`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/breeds`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/blogs`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  let listingRoutes: MetadataRoute.Sitemap = [];
  let serviceRoutes: MetadataRoute.Sitemap = [];

  try {
    const [listingsRes, servicesRes] = await Promise.all([
      fetch(`${API}/listings?limit=200&status=approved`, { next: { revalidate: 3600 } }),
      fetch(`${API}/services?limit=200&status=approved`, { next: { revalidate: 3600 } }),
    ]);

    if (listingsRes.ok) {
      const data = await listingsRes.json();
      listingRoutes = (data.listings || []).map((l: { slug: string; updatedAt?: string }) => ({
        url: `${BASE}/listings/${l.slug}`,
        lastModified: l.updatedAt ? new Date(l.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }

    if (servicesRes.ok) {
      const data = await servicesRes.json();
      serviceRoutes = (data.services || []).map((s: { slug: string; updatedAt?: string }) => ({
        url: `${BASE}/services/${s.slug}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // fail silently — sitemap still returns static routes
  }

  return [...staticRoutes, ...listingRoutes, ...serviceRoutes];
}
