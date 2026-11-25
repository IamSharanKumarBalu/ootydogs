"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HiSearch, HiFilter, HiX, HiLocationMarker, HiHeart,
  HiChevronLeft, HiChevronRight, HiArrowRight,
} from "react-icons/hi";
import { FaPaw, FaDog, FaCat, FaFeather, FaFish } from "react-icons/fa";
import { MdPets } from "react-icons/md";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const PET_TYPE_ICONS: Record<string, React.ReactNode> = {
  Dogs: <FaDog />, Cats: <FaCat />, Birds: <FaFeather />, Fish: <FaFish />,
};

const PET_TYPES = ["All", "Dogs", "Cats", "Birds", "Fish", "Rabbits", "Hamsters", "Reptiles"];
const GENDERS = [{ value: "", label: "Any" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }];
const VACC = [
  { value: "", label: "Any" }, { value: "yes", label: "Vaccinated" },
  { value: "partial", label: "Partial" }, { value: "no", label: "Unvaccinated" },
];
const SORT_OPTIONS = [
  { value: "", label: "Recommended" }, { value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" },
];
const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim",
  "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Jammu and Kashmir","Puducherry",
];

interface Listing {
  _id: string; slug: string; title: string; petName?: string;
  petType?: { name: string }; breed?: { name: string };
  listingCategory?: { name: string }; age?: string; gender?: string;
  state?: string; city?: string; featuredListing: boolean;
  primaryImage?: string; vaccinationStatus?: string; createdAt: string;
}

function ListingCard({ l }: { l: Listing }) {
  const icon = l.petType?.name ? PET_TYPE_ICONS[l.petType.name] || <MdPets /> : <FaPaw />;
  return (
    <Link href={`/listings/${l.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-green-100 shadow-sm hover:shadow-md hover:border-brand-green/30 transition-all">
      <div className="relative h-44 bg-brand-green-soft flex items-center justify-center overflow-hidden">
        {l.primaryImage ? (
          <Image src={l.primaryImage} alt={l.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-brand-green/20 text-6xl">{icon}</span>
        )}
        {l.featuredListing && (
          <span className="absolute top-2.5 left-2.5 bg-brand-red text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">Featured</span>
        )}
        {l.petType && (
          <span className="absolute top-2.5 right-2.5 bg-brand-green text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{l.petType.name}</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-green transition-colors">
          {l.title}
        </h3>
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <HiLocationMarker size={11} className="shrink-0" />
          <span className="truncate">{[l.city, l.state].filter(Boolean).join(", ") || "India"}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[l.breed?.name, l.age, l.gender && l.gender.charAt(0).toUpperCase() + l.gender.slice(1)].filter(Boolean).map(tag => (
            <span key={tag} className="bg-brand-green-soft text-brand-green-mid text-[10px] px-2 py-0.5 rounded-full font-medium">{tag}</span>
          ))}
          {l.listingCategory && (
            <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-medium">{l.listingCategory.name}</span>
          )}
        </div>
        <div className="flex items-center justify-between w-full bg-brand-green-soft text-brand-green text-xs font-semibold px-3 py-2 rounded-xl group-hover:bg-brand-green group-hover:text-white transition-colors">
          <span>View Details</span>
          <HiArrowRight size={11} />
        </div>
      </div>
    </Link>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 bg-brand-green-muted text-brand-green text-xs font-medium px-3 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-brand-red ml-0.5"><HiX size={12} /></button>
    </span>
  );
}

function ListingsPageInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [breeds, setBreeds] = useState<{ _id: string; name: string; petType?: { name: string } }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const q         = sp.get("q") || "";
  const petType   = sp.get("petType") || "";
  const breed     = sp.get("breed") || "";
  const category  = sp.get("category") || "";
  const gender    = sp.get("gender") || "";
  const state     = sp.get("state") || "";
  const city      = sp.get("city") || "";
  const vacc      = sp.get("vaccination") || "";
  const sort      = sp.get("sort") || "";
  const page      = Number(sp.get("page") || "1");

  const setParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/listings?${p.toString()}`);
  }, [router, sp]);

  const setPageNum = (n: number) => {
    const p = new URLSearchParams(sp.toString());
    p.set("page", String(n));
    router.push(`/listings?${p.toString()}`);
  };

  const clearAll = () => router.push("/listings");

  useEffect(() => {
    fetch(`${API}/breeds`)
      .then(r => r.json())
      .then(d => { if (d.success) setBreeds(d.breeds || []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q)        params.set("q", q);
    if (petType)  params.set("petType", petType);
    if (breed)    params.set("breed", breed);
    if (category) params.set("category", category);
    if (gender)   params.set("gender", gender);
    if (state)    params.set("state", state);
    if (city)     params.set("city", city);
    if (vacc)     params.set("vaccination", vacc);
    if (sort)     params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");
    fetch(`${API}/listings?${params.toString()}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setListings(d.listings || []); setTotal(d.total || 0); setPages(d.pages || 1); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, petType, breed, category, gender, state, city, vacc, sort, page]);

  const filteredBreeds = petType ? breeds.filter(b => b.petType?.name === petType) : breeds;
  const activeFilters = [petType, breed, gender, state, city, vacc, q].filter(Boolean).length;

  const sel = "w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-green bg-white text-slate-700 cursor-pointer";

  const FilterPanel = () => (
    <aside className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-sm">Filters</h2>
        {activeFilters > 0 && (
          <button onClick={clearAll} className="text-xs text-brand-red hover:underline font-medium">Clear all</button>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Pet Type</p>
        <div className="flex flex-wrap gap-1.5">
          {PET_TYPES.map(t => (
            <button key={t} onClick={() => setParam("petType", t === "All" ? "" : t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${(t === "All" && !petType) || petType === t ? "bg-brand-green text-white border-brand-green" : "bg-white text-slate-600 border-slate-200 hover:border-brand-green hover:text-brand-green"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {filteredBreeds.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Breed</p>
          <select value={breed} onChange={e => setParam("breed", e.target.value)} className={sel}>
            <option value="">All breeds</option>
            {filteredBreeds.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Gender</p>
        <div className="flex gap-2">
          {GENDERS.map(g => (
            <button key={g.value} onClick={() => setParam("gender", g.value)}
              className={`flex-1 text-xs py-2 rounded-xl border transition-all font-medium ${gender === g.value ? "bg-brand-green text-white border-brand-green" : "bg-white text-slate-600 border-slate-200 hover:border-brand-green hover:text-brand-green"}`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Vaccination</p>
        <div className="flex flex-wrap gap-1.5">
          {VACC.map(v => (
            <button key={v.value} onClick={() => setParam("vaccination", v.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${vacc === v.value ? "bg-brand-green text-white border-brand-green" : "bg-white text-slate-600 border-slate-200 hover:border-brand-green hover:text-brand-green"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">State</p>
        <select value={state} onChange={e => setParam("state", e.target.value)} className={sel}>
          <option value="">All states</option>
          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">City</p>
        <input type="text" value={city} onChange={e => setParam("city", e.target.value)}
          placeholder="e.g. Ooty, Chennai…"
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-green bg-white text-slate-700 placeholder:text-slate-400" />
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-brand-green-soft">
      {/* Hero */}
      <div className="bg-brand-green py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none overflow-hidden">
          <div className="absolute -top-4 -left-4 text-[120px] -rotate-12">🐾</div>
          <div className="absolute -bottom-2 right-4 text-[80px] rotate-6">🐾</div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Browse Pet Listings</h1>
          <p className="text-brand-green-light text-sm mb-5">Find your perfect companion across India</p>
          <form onSubmit={e => e.preventDefault()}
            className="flex h-12 max-w-2xl rounded-xl overflow-hidden shadow-lg border border-white/20">
            <select value={petType} onChange={e => setParam("petType", e.target.value === "All" ? "" : e.target.value)}
              className="bg-white/10 text-white text-xs font-semibold px-3 outline-none shrink-0 border-r border-white/20 cursor-pointer">
              {PET_TYPES.map(t => <option key={t} value={t === "All" ? "" : t} className="text-slate-800">{t}</option>)}
            </select>
            <input type="search" value={q} onChange={e => setParam("q", e.target.value)}
              placeholder="Search breed, name, location…"
              className="flex-1 bg-white/10 text-white placeholder-white/50 text-sm px-4 outline-none" />
            <button type="submit" className="bg-brand-red hover:bg-brand-red-light px-5 text-white flex items-center gap-2 text-sm font-bold transition-colors shrink-0">
              <HiSearch size={16} /> Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <p className="text-sm text-slate-500">{loading ? "Loading…" : `${total} listing${total !== 1 ? "s" : ""} found`}</p>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-green-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:border-brand-green transition-colors">
            <HiFilter size={15} />
            Filters {activeFilters > 0 && <span className="bg-brand-red text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{activeFilters}</span>}
          </button>
        </div>
        {showFilters && <div className="lg:hidden mb-5"><FilterPanel /></div>}

        <div className="flex gap-6">
          <div className="hidden lg:block w-64 shrink-0"><FilterPanel /></div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-sm text-slate-500">
                {loading ? "Loading…" : <><span className="font-semibold text-slate-700">{total}</span> listing{total !== 1 ? "s" : ""} found</>}
              </p>
              <select value={sort} onChange={e => setParam("sort", e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-green text-slate-700 cursor-pointer">
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {activeFilters > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {petType && <Chip label={petType} onRemove={() => setParam("petType", "")} />}
                {breed && <Chip label={breed} onRemove={() => setParam("breed", "")} />}
                {gender && <Chip label={gender} onRemove={() => setParam("gender", "")} />}
                {state && <Chip label={state} onRemove={() => setParam("state", "")} />}
                {city && <Chip label={city} onRemove={() => setParam("city", "")} />}
                {vacc && <Chip label={vacc} onRemove={() => setParam("vaccination", "")} />}
                {q && <Chip label={`"${q}"`} onRemove={() => setParam("q", "")} />}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-56 animate-pulse border border-green-100" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-green-100 shadow-sm">
                <FaPaw className="w-14 h-14 text-brand-green/10 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">No listings found</h3>
                <p className="text-slate-400 text-sm mb-5">Try adjusting your filters or search term.</p>
                <button onClick={clearAll} className="px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid transition-colors">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {listings.map(l => <ListingCard key={l._id} l={l} />)}
              </div>
            )}

            {pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button onClick={() => setPageNum(page - 1)} disabled={page <= 1}
                  className="p-2.5 rounded-xl border border-green-100 bg-white text-slate-600 hover:border-brand-green disabled:opacity-40 transition-all">
                  <HiChevronLeft size={18} />
                </button>
                {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button key={n} onClick={() => setPageNum(n)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${page === n ? "bg-brand-green text-white shadow-sm" : "bg-white border border-green-100 text-slate-600 hover:border-brand-green"}`}>
                      {n}
                    </button>
                  );
                })}
                <button onClick={() => setPageNum(page + 1)} disabled={page >= pages}
                  className="p-2.5 rounded-xl border border-green-100 bg-white text-slate-600 hover:border-brand-green disabled:opacity-40 transition-all">
                  <HiChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return <Suspense><ListingsPageInner /></Suspense>;
}
