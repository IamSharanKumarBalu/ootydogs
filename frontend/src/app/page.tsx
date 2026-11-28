import Image from "next/image";
import Link from "next/link";
import {
  FaSearch, FaArrowRight, FaCheckCircle, FaHeart,
  FaPhoneAlt, FaShieldAlt, FaStar,
} from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const STEPS = [
  { num: "01", title: "Browse Listings",  desc: "Search verified pet listings by breed, age, location and more.", image: "/16_how_it_works_browse.jpg"     },
  { num: "02", title: "Connect Directly", desc: "Contact breeders and owners directly — no middlemen, no hidden fees.", image: "/17_how_it_works_connect.jpg" },
  { num: "03", title: "Bring Home Love",  desc: "Meet your new companion and give them a forever home.", image: "/18_how_it_works_bring_home.jpg" },
];

const SERVICE_META: Record<string, { title: string; desc: string; emoji: string; gradient: string }> = {
  veterinary:     { title: "Veterinary",     desc: "Find trusted vets near you",         emoji: "🩺", gradient: "from-blue-500 to-blue-700"      },
  grooming:       { title: "Grooming",       desc: "Professional grooming services",      emoji: "✂️", gradient: "from-pink-400 to-pink-600"      },
  training:       { title: "Training",       desc: "Certified pet trainers",              emoji: "🎯", gradient: "from-amber-400 to-orange-500"   },
  boarding:       { title: "Boarding",       desc: "Safe & pet-friendly stays",           emoji: "🏡", gradient: "from-teal-500 to-teal-700"      },
  photography:    { title: "Photography",    desc: "Capture memorable moments",           emoji: "📸", gradient: "from-purple-500 to-purple-700"  },
  transportation: { title: "Transportation", desc: "Safe and reliable pet relocation",    emoji: "🚐", gradient: "from-brand-green to-brand-green-dark" },
  care:           { title: "Care",           desc: "Day care & wellness services",        emoji: "💚", gradient: "from-green-500 to-green-700"    },
  supplies:       { title: "Supplies",       desc: "Food, toys & accessories",            emoji: "🛒", gradient: "from-indigo-400 to-indigo-600"  },
  other:          { title: "Other",          desc: "More pet services near you",          emoji: "🐾", gradient: "from-slate-500 to-slate-700"    },
};

const WHY = [
  { icon: FaShieldAlt, title: "Verified Listings",  desc: "Every listing is manually reviewed before going live."         },
  { icon: FaStar,      title: "Trusted Breeders",   desc: "Connect with responsible, ethical breeders and owners."        },
  { icon: FaHeart,     title: "Ethical Adoption",   desc: "We promote responsible adoption and animal welfare."           },
  { icon: FaPhoneAlt,  title: "Direct Contact",     desc: "Talk to the owner directly — no agents in between."           },
];

interface PetType {
  _id: string; name: string; slug: string;
  image?: { url: string }; icon?: string;
}

interface ServiceItem {
  _id: string; category: string;
}

async function getPetTypes(): Promise<PetType[]> {
  try {
    const res = await fetch(`${API}/pet-types`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.petTypes || [];
  } catch { return []; }
}

async function getServiceCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${API}/services?limit=200`, { next: { revalidate: 1800 } });
    if (!res.ok) return {};
    const data = await res.json();
    const counts: Record<string, number> = {};
    (data.services || []).forEach((s: ServiceItem) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  } catch { return {}; }
}

interface LiveListing {
  _id: string; slug: string; title: string;
  petType?: { name: string }; breed?: { name: string };
  age?: string; gender?: string; city?: string; state?: string;
  primaryImage?: string;
  featuredListing: boolean;
}

interface SiteStats {
  listings: number; breeds: number; cities: number; services: number;
}

async function getFeaturedListings(): Promise<LiveListing[]> {
  try {
    const res = await fetch(`${API}/listings?status=approved&featured=true&limit=8`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.listings || [];
  } catch { return []; }
}

async function getSiteStats(): Promise<SiteStats> {
  try {
    const res = await fetch(`${API}/stats/public`, { next: { revalidate: 3600 } });
    if (!res.ok) return { listings: 500, breeds: 50, cities: 20, services: 30 };
    const data = await res.json();
    return data.stats || { listings: 500, breeds: 50, cities: 20, services: 30 };
  } catch { return { listings: 500, breeds: 50, cities: 20, services: 30 }; }
}

function ListingCard({ listing }: { listing: LiveListing }) {
  const primaryImg = listing.primaryImage;
  const location = [listing.city, listing.state].filter(Boolean).join(", ") || "India";

  return (
    <Link href={`/listings/${listing.slug}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100 hover:shadow-md hover:border-brand-green/30 transition-all group">
      <div className="relative h-48 overflow-hidden bg-brand-green-soft">
        {primaryImg ? (
          <Image src={primaryImg} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center gap-1.5">
            <span className="text-3xl">🐾</span>
            <span className="text-xs text-slate-400 font-medium">No photo yet</span>
          </div>
        )}
        {listing.petType && (
          <span className="absolute top-3 left-3 bg-brand-green text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {listing.petType.name}
          </span>
        )}
        {listing.featuredListing && (
          <span className="absolute top-3 right-3 bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 truncate">{listing.title}</h3>
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <HiLocationMarker size={11} className="shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[listing.breed?.name, listing.age, listing.gender].filter(Boolean).map(tag => (
            <span key={tag} className="bg-brand-green-soft text-brand-green-mid text-[11px] px-2 py-0.5 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between w-full bg-brand-green text-white text-xs font-semibold px-3 py-2 rounded-xl group-hover:bg-brand-green-mid transition-colors">
          <span>View Details</span>
          <FaArrowRight size={10} />
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const [featuredListings, stats, petTypes, serviceCounts] = await Promise.all([
    getFeaturedListings(),
    getSiteStats(),
    getPetTypes(),
    getServiceCounts(),
  ]);

  const statItems = [
    { label: "Listings",  value: stats.listings  >= 1000 ? `${(stats.listings/1000).toFixed(1)}k+` : `${stats.listings}+` },
    { label: "Breeds",    value: `${stats.breeds}+`   },
    { label: "Cities",    value: `${stats.cities}+`   },
    { label: "Free",      value: "100%"                },
  ];

  return (
    <main className="bg-brand-green-soft min-h-screen">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-brand-green overflow-hidden">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 lg:h-[420px]">
          <div className="relative z-10 flex flex-col justify-center px-6 md:px-10 xl:pl-14 xl:pr-6 py-10 lg:py-0">
            <div className="absolute inset-0 opacity-[0.055] select-none pointer-events-none overflow-hidden">
              <div className="absolute -top-6 -left-6 text-[150px] -rotate-12">🐾</div>
              <div className="absolute bottom-2 right-4 text-[100px] rotate-6">🐾</div>
            </div>
            <div className="relative">
              <span className="inline-block bg-brand-red/25 text-red-200 text-[11px] font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase border border-brand-red/30">
                India&apos;s Pet Discovery Platform
              </span>
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-3">
                Find Your Perfect<br />
                <span className="text-brand-green-light">Pet Companion</span>
              </h1>
              <p className="text-white/60 text-sm md:text-base mb-6 max-w-sm">
                Browse verified pet listings from breeders and owners across India. Connect directly — no middlemen.
              </p>
              <form action="/listings" method="get"
                className="flex w-full max-w-md bg-white rounded-lg overflow-hidden shadow-xl">
                <select name="petType"
                  className="bg-brand-green-soft text-brand-green text-xs font-semibold px-2.5 border-r border-green-100 outline-none shrink-0 cursor-pointer">
                  <option value="">All</option>
                  <option>Dogs</option><option>Cats</option><option>Birds</option>
                  <option>Fish</option><option>Rabbits</option><option>Hamsters</option><option>Reptiles</option>
                </select>
                <input name="q" type="search" placeholder="Search breeds, cities, listings…"
                  className="flex-1 text-slate-800 text-sm px-3 py-3 outline-none min-w-0" />
                <button type="submit"
                  className="bg-brand-red hover:bg-brand-red-light text-white font-bold px-4 py-3 flex items-center gap-1.5 transition-colors whitespace-nowrap text-sm">
                  <FaSearch size={12} /> Search
                </button>
              </form>
              <div className="flex flex-wrap gap-4 mt-5 text-xs text-white/50">
                {statItems.map(s => (
                  <span key={s.label} className="flex items-center gap-1.5">
                    <FaCheckCircle className="text-brand-green-light shrink-0" size={11} />
                    {s.value} {s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative h-[260px] lg:h-auto">
            <Image src="/01_hero_banner.jpg" alt="Happy pets" fill sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover" style={{ objectPosition: "80% center" }} priority />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-green via-brand-green/25 to-transparent lg:block hidden" />
          </div>
        </div>
      </section>

      {/* ══ BROWSE BY PET TYPE ═══════════════════════════════════════════════ */}
      {petTypes.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-brand-green mb-2">Browse by Pet Type</h2>
            <p className="text-slate-500">Find the perfect companion that matches your lifestyle</p>
          </div>
          <div className={`grid gap-4 ${petTypes.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"}`}>
            {petTypes.map((pt) => (
              <Link key={pt._id} href={`/listings?petType=${encodeURIComponent(pt.name)}`}
                className="flex flex-col items-center gap-2.5 bg-white rounded-2xl border border-green-100 hover:border-brand-green hover:shadow-md transition-all group overflow-hidden text-center">
                <div className="relative w-full h-20 overflow-hidden bg-brand-green-soft">
                  {pt.image?.url ? (
                    <Image src={pt.image.url} alt={pt.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {pt.icon || "🐾"}
                    </div>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-green transition-colors pb-3">{pt.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══ FEATURED LISTINGS ════════════════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-green mb-1">Featured Listings</h2>
              <p className="text-slate-500">Hand-picked pets looking for a loving home</p>
            </div>
            <Link href="/listings" className="hidden sm:flex items-center gap-2 text-brand-green hover:text-brand-green-mid font-semibold text-sm transition-colors">
              View All <FaArrowRight size={12} />
            </Link>
          </div>

          {featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-green-soft rounded-2xl">
              <span className="text-5xl block mb-3">🐾</span>
              <p className="text-slate-500 mb-4">No featured listings yet — be the first!</p>
              <Link href="/listings/new" className="inline-block px-6 py-3 bg-brand-green text-white rounded-xl font-semibold text-sm hover:bg-brand-green-mid transition-colors">
                Post Your Pet
              </Link>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link href="/listings" className="inline-flex items-center gap-2 text-brand-green font-semibold text-sm">
              View All Listings <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-brand-green mb-2">How It Works</h2>
          <p className="text-slate-500">Finding your pet is as easy as 1–2–3</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute top-24 left-[calc(100%-1rem)] z-10 items-center justify-center w-8">
                  <FaArrowRight className="text-brand-green/30" size={20} />
                </div>
              )}
              <div className="bg-white rounded-2xl overflow-hidden border border-green-100 hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <Image src={step.image} alt={step.title} fill className="object-cover" />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-brand-green-light font-extrabold text-sm">{step.num}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PET SERVICES ═════════════════════════════════════════════════════ */}
      {(() => {
        const activeCategories = Object.keys(SERVICE_META).filter(
          cat => (serviceCounts[cat] || 0) > 0
        );
        const displayCategories = activeCategories.length >= 3
          ? activeCategories
          : Object.keys(SERVICE_META).slice(0, 6);
        return (
          <section className="bg-gradient-to-br from-brand-green via-brand-green-mid to-brand-green-dark py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-white mb-2">Pet Services Near You</h2>
                <p className="text-brand-green-muted">Everything your pet needs, all in one place</p>
              </div>
              <div className={`grid gap-4 ${displayCategories.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"}`}>
                {displayCategories.map(cat => {
                  const meta = SERVICE_META[cat];
                  const count = serviceCounts[cat] || 0;
                  return (
                    <Link key={cat} href={`/services?category=${cat}`}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden transition-all group">
                      <div className={`relative h-32 flex flex-col items-center justify-center bg-gradient-to-br ${meta.gradient} group-hover:brightness-110 transition-all`}>
                        <span className="text-4xl mb-1 drop-shadow">{meta.emoji}</span>
                        <p className="text-white font-bold text-sm drop-shadow">{meta.title}</p>
                        {count > 0 && (
                          <span className="mt-1 text-[10px] font-semibold text-white/70 bg-black/20 px-2 py-0.5 rounded-full">
                            {count} listing{count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-white/60 text-xs text-center">{meta.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="text-center mt-10">
                <Link href="/services"
                  className="inline-flex items-center gap-2 bg-white text-brand-green font-bold px-8 py-3.5 rounded-xl hover:bg-brand-green-soft transition-colors">
                  Browse All Services <FaArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ══ WHY OOTYDOGS ═════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-brand-green mb-2">Why OotyDogs?</h2>
          <p className="text-slate-500">India&apos;s most trusted pet discovery platform</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-green-100 hover:border-brand-green/30 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-brand-green-soft rounded-xl flex items-center justify-center mb-4">
                <Icon className="text-brand-green" size={22} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PRICING ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Simple, Transparent Pricing</h2>
          <p className="text-slate-500">Choose a plan and start listing your pets today</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Basic", price: "₹100", listings: "1 listing", validity: "30 days", highlight: false,
              features: ["1 pet listing", "Visible for 30 days", "Photo upload", "Contact form"] },
            { label: "Standard", price: "₹1,000", listings: "15 listings", validity: "1 year", highlight: true,
              features: ["15 total listings", "Valid for 1 year", "Photo upload", "Priority listing"] },
            { label: "Premium", price: "₹5,000", listings: "Unlimited", validity: "1 year", highlight: false,
              features: ["Unlimited listings", "Valid for 1 year", "Photo upload", "Featured listings"] },
          ].map(plan => (
            <div key={plan.label}
              className={`relative bg-white rounded-3xl border-2 p-7 flex flex-col shadow-sm ${plan.highlight ? "border-brand-green shadow-brand-green/10 shadow-lg" : "border-slate-200"}`}>
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-green text-white text-xs font-bold rounded-full whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.label}</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
              </div>
              <p className="text-slate-400 text-sm mb-5">{plan.listings} · {plan.validity}</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing"
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlight ? "bg-brand-green text-white hover:bg-brand-green-mid" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                Get {plan.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══ POST A PET CTA ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-3xl overflow-hidden shadow-xl shadow-green-900/20 grid grid-cols-1 lg:grid-cols-2 min-h-[280px]">
          <div className="bg-brand-green flex flex-col justify-center px-10 md:px-14 py-12 md:py-14">
            <span className="text-4xl mb-4 block">🐾</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">Have a Pet to Rehome?</h2>
            <p className="text-white/75 text-base mb-8 max-w-sm">
              Post your listing for free. Connect directly with thousands of pet lovers across India.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/listings/new"
                className="bg-brand-red hover:bg-brand-red-light text-white font-extrabold px-7 py-3.5 rounded-xl transition-colors text-sm shadow-lg shadow-red-900/30">
                Post Your Pet — Free
              </Link>
              <Link href="/listings"
                className="bg-white/15 hover:bg-white/25 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm border border-white/25">
                Browse Listings
              </Link>
            </div>
          </div>
          <div className="relative min-h-[260px] lg:min-h-0">
            <Image src="/19_rehome_banner.jpg" alt="Rehome your pet" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-green/60 via-brand-green/10 to-transparent" />
          </div>
        </div>
      </section>

    </main>
  );
}
