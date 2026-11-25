"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiSearch } from "react-icons/hi";
import { FaDog, FaCat, FaFeather, FaFish } from "react-icons/fa";
import { MdPets } from "react-icons/md";
import { FaPaw } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Dogs: <FaDog />, Cats: <FaCat />, Birds: <FaFeather />, Fish: <FaFish />,
};

interface Breed { _id: string; name: string; slug: string; petType: { _id: string; name: string; slug: string }; description?: string; }
interface PetType { _id: string; name: string; slug: string; }

export default function BreedsPage() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/breeds`).then(r => r.json()),
      fetch(`${API}/pet-types`).then(r => r.json()),
    ]).then(([bData, tData]) => {
      if (bData.success) setBreeds(bData.breeds || []);
      if (tData.success) setPetTypes(tData.petTypes || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = breeds.filter(b => {
    const matchType = !activeType || b.petType?.name === activeType;
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // Group by petType
  const grouped: Record<string, Breed[]> = {};
  filtered.forEach(b => {
    const typeName = b.petType?.name || "Other";
    if (!grouped[typeName]) grouped[typeName] = [];
    grouped[typeName].push(b);
  });

  return (
    <div className="min-h-screen bg-brand-green-soft">
      {/* Hero */}
      <div className="bg-brand-green py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none overflow-hidden">
          <div className="absolute -top-4 -left-4 text-[120px] -rotate-12">🐾</div>
          <div className="absolute -bottom-2 right-4 text-[80px] rotate-6">🐾</div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Breeds Directory</h1>
          <p className="text-brand-green-light text-sm mb-5">Explore breeds and find pets available near you</p>
          <form onSubmit={e => e.preventDefault()}
            className="flex h-12 max-w-md mx-auto rounded-xl overflow-hidden shadow-lg border border-white/20">
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search for a breed…"
              className="flex-1 bg-white/10 text-white placeholder-white/50 text-sm px-4 outline-none" />
            <button type="submit" className="bg-brand-red hover:bg-brand-red-light px-5 flex items-center text-white shrink-0 transition-colors">
              <HiSearch size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Type filter chips */}
        {petTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setActiveType("")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${!activeType ? "bg-brand-green text-white border-brand-green" : "bg-white text-slate-600 border-slate-200 hover:border-brand-green"}`}>
              <MdPets size={15} /> All Types
            </button>
            {petTypes.map(t => (
              <button key={t._id} onClick={() => setActiveType(t.name === activeType ? "" : t.name)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeType === t.name ? "bg-brand-green text-white border-brand-green" : "bg-white text-slate-600 border-slate-200 hover:border-brand-green"}`}>
                {TYPE_ICONS[t.name] || <MdPets size={14} />} {t.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-green-100" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-green-100">
            <FaPaw className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No breeds found{search ? ` for "${search}"` : ""}.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([typeName, typeBreeds]) => (
              <div key={typeName}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-brand-green text-xl">{TYPE_ICONS[typeName] || <MdPets />}</span>
                  <h2 className="text-lg font-bold text-slate-800">{typeName}</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{typeBreeds.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {typeBreeds.map(breed => (
                    <Link key={breed._id}
                      href={`/listings?petType=${typeName}&breed=${encodeURIComponent(breed.name)}`}
                      className="group bg-white rounded-2xl border border-green-100 p-4 text-center hover:border-brand-green hover:shadow-sm transition-all">
                      <div className="text-brand-green text-2xl mb-2 flex justify-center group-hover:scale-110 transition-transform">
                        {TYPE_ICONS[typeName] || <MdPets />}
                      </div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-green transition-colors leading-tight">{breed.name}</p>
                      {breed.description && (
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{breed.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
