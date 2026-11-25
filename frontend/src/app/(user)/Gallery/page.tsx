import Image from 'next/image';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

async function getAllListings() {
  try {
    const response = await fetch(`${API_BASE_URL}/listings?limit=48&status=active`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.success ? (data.listings ?? []) : [];
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const listings = await getAllListings();

  return (
    <div className="min-h-screen bg-brand-green-soft py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
            Pet Gallery
          </h1>
          <p className="text-lg text-slate-600">
            Browse pets looking for their forever homes
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-green-100 shadow-sm">
            <p className="text-slate-600 text-lg">No pets listed yet — check back soon.</p>
            <Link href="/listings" className="mt-4 inline-block px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid transition-colors">
              Browse All Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing: any) => {
              const imageUrl = listing.images?.[0]?.url || '/placeholder.jpg';
              return (
                <Link
                  key={listing._id}
                  href={`/listings/${listing.slug || listing._id}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-green-50 border border-green-100 hover:shadow-xl hover:border-brand-green/30 transition-all duration-300"
                >
                  <Image
                    src={imageUrl}
                    alt={listing.title || 'Pet'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-semibold text-sm line-clamp-1">{listing.title}</p>
                    {listing.state && (
                      <p className="text-white/70 text-xs mt-0.5">{listing.city ? `${listing.city}, ` : ''}{listing.state}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/listings" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid transition-colors">
            View All Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
