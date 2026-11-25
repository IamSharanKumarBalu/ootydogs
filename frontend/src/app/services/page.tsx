"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  HiSearch, HiLocationMarker, HiX, HiChevronLeft, HiChevronRight, HiArrowRight,
} from "react-icons/hi";
import { FaPaw, FaStore } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const SERVICE_CATEGORIES = [
  { value: "", label: "All Services" },
  { value: "Veterinary", label: "Veterinary" },
  { value: "Grooming", label: "Grooming" },
  { value: "Boarding", label: "Boarding" },
  { value: "Training", label: "Training" },
  { value: "Transportation", label: "Transportation" },
  { value: "Photography", label: "Photography" },
  { value: "Pet Shop", label: "Pet Shop" },
  { value: "Day Care", label: "Day Care" },
  { value: "Adoption", label: "Adoption" },
  { value: "Breeding", label: "Breeding" },
  { value: "Nutrition & Diet", label: "Nutrition & Diet" },
  { value: "Other", label: "Other" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Veterinary: "bg-blue-50 text-blue-700", Grooming: "bg-pink-50 text-pink-700",
  Boarding: "bg-purple-50 text-purple-700", Training: "bg-orange-50 text-orange-700",
  Transportation: "bg-cyan-50 text-cyan-700", Photography: "bg-rose-50 text-rose-700",
  "Pet Shop": "bg-amber-50 text-amber-700", "Day Care": "bg-green-50 text-green-700",
  Adoption: "bg-teal-50 text-teal-700", Breeding: "bg-indigo-50 text-indigo-700",
  "Nutrition & Diet": "bg-lime-50 text-lime-700", Other: "bg-slate-100 text-slate-600",
};

interface Service {
  _id: string; slug: string; businessName: string; category: string;
  description?: string; state?: string; city?: string; phone?: string;
  whatsapp?: string; timings?: string; featuredService: boolean;
}

function ServiceCard({ s }: { s: Service }) {
  const catColor = CATEGORY_COLORS[s.category] || "bg-slate-100 text-slate-600";
  return (
    <Link href={`/services/${s.slug}`}
      className="group bg-white rounded-2xl border border-green-100 p-5 shadow-sm hover:shadow-md hover:border-brand-green/30 transition-all flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-brand-green-soft flex items-center justify-center shrink-0">
          <FaStore className="text-brand-green" size={16} />
        </div>
        {s.featuredService && (
          <span className="shrink-0 text-[10px] bg-brand-red text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Featured</span>
        )}
      </div>
      <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2 group-hover:text-brand-green transition-colors line-clamp-2">
        {s.businessName}
      </h3>
      <span className={`inline-block self-start text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-3 ${catColor}`}>
        {s.category || "Service"}
      </span>
      {s.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed flex-1">{s.description}</p>
      )}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
        <HiLocationMarker className="shrink-0" size={11} />
        <span className="truncate">{[s.city, s.state].filter(Boolean).join(", ") || "India"}</span>
      </div>
      <div className="flex items-center justify-between w-full bg-brand-green-soft text-brand-green text-xs font-semibold px-3 py-2 rounded-xl group-hover:bg-brand-green group-hover:text-white transition-colors mt-auto">
        <span>View Details</span>
        <HiArrowRight size={11} />
      </div>
    </Link>
  );
}

function ServicesPageInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const q        = sp.get("q") || "";
  const category = sp.get("category") || "";
  const city     = sp.get("city") || "";
  const page     = Number(sp.get("page") || "1");

  const setParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/services?${p.toString()}`);
  }, [router, sp]);

  const setPageNum = (n: number) => {
    const p = new URLSearchParams(sp.toString());
    p.set("page", String(n));
    router.push(`/services?${p.toString()}`);
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q)        params.set("q", q);
    if (category) params.set("category", category);
    if (city)     params.set("city", city);
    params.set("page", String(page));
    params.set("limit", "12");
    fetch(`${API}/services?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setServices(d.services || []);
          setTotal(d.total || 0);
          setPages(d.pages || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, category, city, page]);

  const hasFilters = !!(q || category || city);

  return (
    <div className="min-h-screen bg-brand-green-soft">
      {/* Hero */}
      <div className="bg-brand-green py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none overflow-hidden">
          <div className="absolute -top-4 -left-4 text-[120px] -rotate-12">🐾</div>
          <div className="absolute -bottom-2 right-4 text-[80px] rotate-6">🐾</div>
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Pet Services</h1>
              <p className="text-brand-green-light text-sm">Find vets, groomers, trainers and more near you</p>
            </div>
            <Link href="/services/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-brand-red-light text-white rounded-xl text-sm font-bold transition-colors shadow-lg shrink-0">
              + List Your Service
            </Link>
          </div>
          <form onSubmit={e => e.preventDefault()}
            className="flex h-12 max-w-2xl rounded-xl overflow-hidden shadow-lg border border-white/20">
            <input type="search" value={q} onChange={e => setParam("q", e.target.value)}
              placeholder="Search business name or service type…"
              className="flex-1 bg-white/10 text-white placeholder-white/50 text-sm px-4 outline-none" />
            <button type="submit"
              className="bg-brand-red hover:bg-brand-red-light px-5 text-white flex items-center gap-2 text-sm font-bold transition-colors shrink-0">
              <HiSearch size={16} /> Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {SERVICE_CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setParam("category", c.value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${category === c.value ? "bg-brand-green text-white border-brand-green shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-brand-green hover:text-brand-green"}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* City filter + meta row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input type="text" value={city} onChange={e => setParam("city", e.target.value)}
            placeholder="Filter by city…"
            className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-brand-green w-48 text-slate-700 placeholder:text-slate-400" />
          {hasFilters && (
            <button onClick={() => router.push("/services")}
              className="flex items-center gap-1 text-xs text-brand-red hover:underline font-medium">
              <HiX size={12} /> Clear filters
            </button>
          )}
          <p className="text-sm text-slate-500 ml-auto">
            {loading ? "Loading…" : <><span className="font-semibold text-slate-700">{total}</span> service{total !== 1 ? "s" : ""} found</>}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse border border-green-100" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-green-100 shadow-sm">
            <FaPaw className="w-14 h-14 text-brand-green/10 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No services found</h3>
            <p className="text-slate-400 text-sm mb-5">Try a different category or search term.</p>
            {hasFilters && (
              <button onClick={() => router.push("/services")}
                className="px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid transition-colors">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(s => <ServiceCard key={s._id} s={s} />)}
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
  );
}

export default function ServicesPage() {
  return <Suspense><ServicesPageInner /></Suspense>;
}
