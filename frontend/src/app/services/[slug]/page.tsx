import { Metadata } from "next";
import ServiceDetailClient from "./_client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://ootydogs.com";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API}/services/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: "Service Not Found" };
    const data = await res.json();
    if (!data.success) return { title: "Service Not Found" };

    const s = data.service;
    const location = [s.city, s.state].filter(Boolean).join(", ") || "Ooty";
    const catLabel: Record<string, string> = {
      veterinary: "Veterinary", grooming: "Grooming", boarding: "Boarding",
      training: "Training", transportation: "Transportation", photography: "Photography",
      care: "Pet Care", supplies: "Pet Supplies", other: "Pet Service",
    };
    const cat = catLabel[s.category] || "Pet Service";
    const title = `${s.businessName} – ${cat} in ${location}`;
    const description = s.description
      ? s.description.slice(0, 155)
      : `${cat} in ${location}. Find contact details, timings and more on OotyDogs.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE}/services/${slug}`,
        type: "article",
      },
      twitter: { card: "summary", title, description },
    };
  } catch {
    return { title: "Pet Service | OotyDogs" };
  }
}

export default async function ServiceDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return <ServiceDetailClient slug={slug} />;
}
