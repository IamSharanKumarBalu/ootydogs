import { Metadata } from "next";
import ListingDetailClient from "./_client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://ootydogs.com";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API}/listings/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: "Listing Not Found" };
    const data = await res.json();
    if (!data.success) return { title: "Listing Not Found" };

    const l = data.listing;
    const location = [l.city, l.state].filter(Boolean).join(", ") || "Ooty";
    const breed = l.breed?.name || l.petType?.name || "Pet";
    const title = `${l.title} – ${breed} in ${location}`;
    const description = l.description
      ? l.description.slice(0, 155)
      : `${breed} ${l.gender || ""} available in ${location}. ${l.vaccinationStatus === "yes" ? "Vaccinated." : ""} Listed on OotyDogs.`;

    const image = data.images?.[0]?.url;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE}/listings/${slug}`,
        type: "article",
        ...(image && { images: [{ url: image, width: 800, height: 600, alt: l.title }] }),
      },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch {
    return { title: "Pet Listing | OotyDogs" };
  }
}

export default async function ListingDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return <ListingDetailClient slug={slug} />;
}
