import Image from "next/image";
import Link from "next/link";
import {
  FaSearch, FaArrowRight, FaCheckCircle, FaHeart,
  FaPhoneAlt, FaShieldAlt, FaStar, FaPaw,
} from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const PET_TYPES = [
  { label: "Dogs",     image: "/02_category_dogs.jpg",     href: "/listings?petType=Dogs"     },
  { label: "Cats",     image: "/03_category_cats.jpg",     href: "/listings?petType=Cats"     },
  { label: "Birds",    image: "/04_category_birds.jpg",    href: "/listings?petType=Birds"    },
  { label: "Fish",     image: "/05_category_fish.jpg",     href: "/listings?petType=Fish"     },
  { label: "Rabbits",  image: "/06_category_rabbits.jpg",  href: "/listings?petType=Rabbits"  },
  { label: "Hamsters", image: "/07_category_hamsters.jpg", href: "/listings?petType=Hamsters" },
  { label: "Reptiles", image: "/08_category_reptiles.jpg", href: "/listings?petType=Reptiles" },
  { label: "Others",   image: "/09_category_others.jpg",   href: "/listings"                  },
];

const STEPS = [
  { num: "01", title: "Browse Listings",  desc: "Search verified pet listings by breed, age, location and more.", image: "/16_how_it_works_browse.jpg"     },
  { num: "02", title: "Connect Directly", desc: "Contact breeders and owners directly — no middlemen, no hidden fees.", image: "/17_how_it_works_connect.jpg" },
  { num: "03", title: "Bring Home Love",  desc: "Meet your new companion and give them a forever home.", image: "/18_how_it_works_bring_home.jpg" },
];

const SERVICES = [
  { title: "Veterinary",     desc: "Find trusted vets near you",              image: "/10_service_veterinary.jpg",     slug: "veterinary"     },
  { title: "Grooming",       desc: "Professional grooming services",          image: "/11_service_grooming.jpg",       slug: "grooming"       },
  { title: "Training",       desc: "Certified pet trainers",                  image: "/12_service_training.jpg",       slug: "training"       },
  { title: "Boarding",       desc: "Safe & pet-friendly stays",               image: "/13_service_boarding.jpg",       slug: "boarding"       },
  { title: "Photography",    desc: "Capture memorable moments",               image: "/14_service_photography.jpg",    slug: "photography"    },
  { title: "Transportation", desc: "Safe and reliable pet relocation",        image: "/15_service_transportation.jpg", slug: "transportation" },
];

const WHY = [
  { icon: FaShieldAlt, title: "Verified Listings",  desc: "Every listing is manually reviewed before going live."         },
  { icon: FaStar,      title: "Trusted Breeders",   desc: "Connect with responsible, ethical breeders and owners."        },
  { icon: FaHeart,     title: "Ethical Adoption",   desc: "We promote responsible adoption and animal welfare."           },
  { icon: FaPhoneAlt,  title: "Direct Contact",     desc: "Talk to the owner directly — no agents in between."           },
];

interface LiveListing {
  _id: string; slug: string; title: string;
  petType?: { name: string }; breed?: { name: string };
  age?: string; gender?: string; city?: string; state?: string;
  images?: { url: string; isPrimary: boolean }[];
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
  const primaryImg = listing.images?.find(i => i.isPrimary)?.url || listing.images?.[0]?.url;
  const location = [listing.city, listing.state].filter(Boolean).join(", ") || "India";

  return (
    <Link href={`/listings/${listing.slug}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100 hover:shadow-md hover:border-brand-green/30 transition-all group">
      <div className="relative h-48 overflow-hidden bg-brand-green-soft">
        {primaryImg ? (
          <Image src={primaryImg} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaPaw className="text-brand-green/20 w-16 h-16" />
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
  const [featuredListings, stats] = await Promise.all([
    getFeaturedListings(),
    getSiteStats(),
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
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-brand-green mb-2">Browse by Pet Type</h2>
          <p className="text-slate-500">Find the perfect companion that matches your lifestyle</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {PET_TYPES.map(({ label, image, href }) => (
            <Link key={label} href={href}
              className="flex flex-col items-center gap-2.5 bg-white rounded-2xl border border-green-100 hover:border-brand-green hover:shadow-md transition-all group overflow-hidden text-center">
              <div className="relative w-full h-20 overflow-hidden">
                <Image src={image} alt={label} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-green transition-colors pb-3">{label}</span>
            </Link>
          ))}
        </div>
      </section>

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
              <FaPaw className="w-12 h-12 text-brand-green/20 mx-auto mb-3" />
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
      <section className="bg-gradient-to-br from-brand-green via-brand-green-mid to-brand-green-dark py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-2">Pet Services Near You</h2>
            <p className="text-brand-green-muted">Everything your pet needs, all in one place</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICES.map(s => (
              <Link key={s.title} href={`/services?category=${s.slug}`}
                className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden transition-all group">
                <div className="relative h-32 overflow-hidden">
                  <Image src={s.image} alt={s.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500 brightness-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-2 left-0 right-0 text-center text-white font-bold text-sm">{s.title}</p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-white/60 text-xs text-center">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services"
              className="inline-flex items-center gap-2 bg-white text-brand-green font-bold px-8 py-3.5 rounded-xl hover:bg-brand-green-soft transition-colors">
              Browse All Services <FaArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

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
