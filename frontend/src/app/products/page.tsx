"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaArrowRight, FaBoxOpen } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "pet-food",        label: "Pet Food" },
  { value: "accessories",     label: "Accessories" },
  { value: "cages-kennels",   label: "Cages & Kennels" },
  { value: "grooming-tools",  label: "Grooming Tools" },
  { value: "toys",            label: "Toys & Play" },
  { value: "clothing",        label: "Clothing" },
  { value: "health-medicine", label: "Health & Medicine" },
  { value: "aquarium",        label: "Aquarium" },
  { value: "other",           label: "Other" },
];

const CONDITIONS = [
  { value: "",         label: "Any Condition" },
  { value: "new",      label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good",     label: "Good" },
  { value: "fair",     label: "Fair" },
];

const CONDITION_BADGE: Record<string, string> = {
  "new":      "bg-green-100 text-green-700",
  "like-new": "bg-teal-100 text-teal-700",
  "good":     "bg-amber-100 text-amber-700",
  "fair":     "bg-slate-100 text-slate-600",
};

interface Product {
  _id: string; slug: string; title: string;
  category: string; condition: string;
  askingPrice?: number; negotiable?: boolean;
  city?: string; state?: string;
  images: { url: string }[];
  featuredProduct: boolean;
  owner?: { name: string };
}

function ProductCard({ p }: { p: Product }) {
  const img = p.images?.[0]?.url;
  const loc = [p.city, p.state].filter(Boolean).join(", ") || "India";
  const catLabel = CATEGORIES.find(c => c.value === p.category)?.label || p.category;

  return (
    <Link href={`/products/${p.slug}`}
      className="bg-white rounded-2xl overflow-hidden border border-green-100 hover:border-brand-green/40 hover:shadow-md transition-all group">
      <div className="relative h-44 bg-brand-green-soft overflow-hidden">
        {img ? (
          <Image src={img} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
            <FaBoxOpen size={32} />
            <span className="text-xs">No photo</span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-brand-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {catLabel}
        </span>
        {p.featuredProduct && (
          <span className="absolute top-2 right-2 bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1 truncate">{p.title}</h3>
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
          <HiLocationMarker size={11} className="shrink-0" />
          <span className="truncate">{loc}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${CONDITION_BADGE[p.condition] || "bg-slate-100 text-slate-500"}`}>
            {p.condition?.replace("-", " ")}
          </span>
          {p.askingPrice ? (
            <span className="text-sm font-bold text-brand-green">
              ₹{p.askingPrice.toLocaleString("en-IN")}
              {p.negotiable && <span className="text-[10px] font-normal text-slate-400 ml-1">Nego.</span>}
            </span>
          ) : (
            <span className="text-xs text-slate-400">Price on request</span>
          )}
        </div>
        <div className="flex items-center justify-between w-full bg-brand-green text-white text-xs font-semibold px-3 py-2 rounded-xl group-hover:bg-brand-green-mid transition-colors">
          <span>View Details</span>
          <FaArrowRight size={10} />
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [q, setQ]               = useState("");
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (q)         params.set("q", q);
    if (category)  params.set("category", category);
    if (condition) params.set("condition", condition);
    fetch(`${API}/products?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) { setProducts(d.products); setTotal(d.total); setPages(d.pages || 1); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, q, category, condition]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(search);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-brand-green-soft">
      {/* Hero bar */}
      <div className="bg-brand-green py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Pet Products</h1>
          <p className="text-white/70 mb-6">Food, accessories, toys & more — from pet owners near you</p>
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto bg-white rounded-xl overflow-hidden shadow-lg">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="flex-1 px-4 py-3 text-sm text-slate-800 outline-none" />
            <button type="submit" className="bg-brand-red hover:bg-brand-red-light text-white px-5 py-3 font-semibold text-sm flex items-center gap-2 transition-colors">
              <FaSearch size={13} /> Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters + Post CTA */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:border-brand-green">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={condition} onChange={e => { setCondition(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:border-brand-green">
            {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <span className="text-sm text-slate-400 ml-auto">{total} product{total !== 1 ? "s" : ""} found</span>
          <Link href="/products/new"
            className="bg-brand-green hover:bg-brand-green-mid text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors">
            + List a Product
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-green-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-green-100">
            <FaBoxOpen className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 mb-4">No products found</p>
            <Link href="/products/new" className="inline-block px-6 py-3 bg-brand-green text-white rounded-xl font-semibold text-sm hover:bg-brand-green-mid transition-colors">
              List the First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p._id} p={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-white disabled:opacity-40 bg-white">
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-slate-500">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-white disabled:opacity-40 bg-white">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
