"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiSearch, HiCalendar, HiClock, HiArrowRight, HiTag, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { FaPaw } from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

interface Blog {
  _id: string; title: string; slug: string; excerpt: string;
  featuredImage: string; author: string; category: string;
  tags: string[]; views: number; publishedAt: string;
}

const BLOG_CATEGORIES = [
  "All", "Dog Care", "Cat Care", "Pet Health", "Breeds Guide",
  "Training Tips", "Nutrition", "Adoption Stories", "Pet News",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Dog Care": "bg-amber-500", "Cat Care": "bg-pink-500",
  "Pet Health": "bg-blue-500", "Breeds Guide": "bg-brand-green",
  "Training Tips": "bg-purple-500", "Nutrition": "bg-green-500",
  "Adoption Stories": "bg-rose-500", "Pet News": "bg-indigo-500",
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchBlogs(); }, [selectedCategory, page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: "9" });
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      const r = await fetch(`${API_BASE_URL}/blogs?${params}`);
      if (!r.ok) throw new Error();
      const data = await r.json();
      if (data.success) { setBlogs(data.blogs); setTotalPages(data.totalPages || 1); }
      else setBlogs([]);
    } catch { setBlogs([]); }
    finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchBlogs(); };

  return (
    <div className="min-h-screen bg-brand-green-soft">
      {/* Hero */}
      <div className="bg-brand-green py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none overflow-hidden">
          <div className="absolute -top-4 -left-4 text-[120px] -rotate-12">🐾</div>
          <div className="absolute -bottom-2 right-4 text-[80px] rotate-6">🐾</div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">OotyDogs Blog</h1>
          <p className="text-brand-green-light text-sm mb-5">Expert pet care tips, breed guides, training advice and adoption stories</p>
          <form onSubmit={handleSearch}
            className="flex h-12 max-w-2xl rounded-xl overflow-hidden shadow-lg border border-white/20">
            <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles, tips and guides…"
              className="flex-1 bg-white/10 text-white placeholder-white/50 text-sm px-4 outline-none" />
            <button type="submit"
              className="bg-brand-red hover:bg-brand-red-light px-5 text-white flex items-center gap-2 text-sm font-bold transition-colors shrink-0">
              <HiSearch size={16} /> Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {BLOG_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${selectedCategory === cat ? "bg-brand-green text-white border-brand-green shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-brand-green hover:text-brand-green"}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-green-100" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-28 bg-white rounded-2xl border border-green-100 shadow-sm">
            <FaPaw className="w-14 h-14 text-brand-green/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No articles found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map(blog => (
                <Link key={blog._id} href={`/blogs/${blog.slug}`}
                  className="group bg-white rounded-2xl border border-green-100 hover:border-brand-green/30 hover:shadow-md transition-all overflow-hidden flex flex-col">
                  <div className="relative h-48 bg-brand-green-soft overflow-hidden">
                    {blog.featuredImage ? (
                      <img src={blog.featuredImage} alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiTag className="w-14 h-14 text-brand-green/10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 ${CATEGORY_COLORS[blog.category] || "bg-slate-500"} text-white text-[10px] font-bold rounded-lg`}>
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                      <span className="flex items-center gap-1"><HiCalendar size={11} />{new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</span>
                      <span className="flex items-center gap-1"><HiClock size={11} />5 min read</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-brand-green transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1 mb-4">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-green-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                          {blog.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-slate-600 truncate max-w-[80px]">{blog.author}</span>
                      </div>
                      <div className="flex items-center gap-1 text-brand-green text-xs font-semibold group-hover:gap-2 transition-all">
                        <span>Read</span>
                        <HiArrowRight size={11} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2.5 rounded-xl border border-green-100 bg-white text-slate-600 hover:border-brand-green disabled:opacity-40 transition-all">
                  <HiChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${page === p ? "bg-brand-green text-white shadow-sm" : "bg-white border border-green-100 text-slate-600 hover:border-brand-green"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2.5 rounded-xl border border-green-100 bg-white text-slate-600 hover:border-brand-green disabled:opacity-40 transition-all">
                  <HiChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
