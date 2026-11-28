"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { HiRefresh, HiCheck, HiX, HiStar, HiTrash } from "react-icons/hi";
import { FaBoxOpen } from "react-icons/fa";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

const CATEGORIES: Record<string, string> = {
  "pet-food": "Pet Food", "accessories": "Accessories", "cages-kennels": "Cages & Kennels",
  "grooming-tools": "Grooming Tools", "toys": "Toys", "clothing": "Clothing",
  "health-medicine": "Health & Medicine", "aquarium": "Aquarium", "other": "Other",
};
const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  draft:    "bg-slate-100 text-slate-500",
};

interface Product {
  _id: string; title: string; slug: string; category: string; condition: string;
  askingPrice?: number; city?: string; state?: string;
  images: { url: string }[];
  status: string; featuredProduct: boolean;
  owner?: { name: string; email: string };
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [page, setPage]               = useState(1);
  const [pages, setPages]             = useState(1);
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filterStatus) params.set("status", filterStatus);
    fetch(`${API}/admin/products?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
    }).then(r => r.json())
      .then(d => { if (d.success) { setProducts(d.products); setPages(d.pages || 1); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filterStatus]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const approve = async (id: string) => {
    await fetch(`${API}/admin/products/${id}/approve`, {
      method: "PUT", headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
    });
    toast.success("Product approved");
    fetchProducts();
  };

  const reject = async () => {
    if (!rejectModal) return;
    await fetch(`${API}/admin/products/${rejectModal.id}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      credentials: "include",
      body: JSON.stringify({ reason: rejectReason || "Did not meet our guidelines" }),
    });
    toast.success("Product rejected");
    setRejectModal(null);
    setRejectReason("");
    fetchProducts();
  };

  const toggleFeature = async (id: string) => {
    await fetch(`${API}/admin/products/${id}/feature`, {
      method: "PUT", headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
    });
    toast.success("Updated");
    fetchProducts();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`${API}/admin/products/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
    });
    toast.success("Deleted");
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review and manage product listings</p>
        </div>
        <button onClick={fetchProducts} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">
          <HiRefresh size={15} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {["", "pending", "approved", "rejected"].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${filterStatus === s ? "bg-brand-green text-white border-brand-green" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FaBoxOpen className="mx-auto mb-3 text-slate-200" size={40} />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Product", "Category", "Price", "Status", "Owner", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {p.images?.[0]?.url ? (
                            <Image src={p.images[0].url} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><FaBoxOpen className="text-slate-300" size={16} /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 truncate max-w-[180px]">{p.title}</p>
                          <p className="text-xs text-slate-400">{[p.city, p.state].filter(Boolean).join(", ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{CATEGORIES[p.category] || p.category}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {p.askingPrice ? `₹${p.askingPrice.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                      {p.featuredProduct && <span className="ml-1 text-amber-500 text-xs">★</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700 font-medium">{p.owner?.name || "—"}</p>
                      <p className="text-xs text-slate-400">{p.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.status === "pending" && (
                          <>
                            <button onClick={() => approve(p._id)} title="Approve"
                              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                              <HiCheck size={15} />
                            </button>
                            <button onClick={() => setRejectModal({ id: p._id, title: p.title })} title="Reject"
                              className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                              <HiX size={15} />
                            </button>
                          </>
                        )}
                        <button onClick={() => toggleFeature(p._id)} title="Toggle feature"
                          className={`p-1.5 rounded-lg transition-colors ${p.featuredProduct ? "bg-amber-50 text-amber-500 hover:bg-amber-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>
                          <HiStar size={15} />
                        </button>
                        <button onClick={() => remove(p._id)} title="Delete"
                          className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors">
                          <HiTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40">Previous</button>
          <span className="px-4 py-2 text-sm text-slate-500">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reject Product</h3>
            <p className="text-sm text-slate-500 mb-4 truncate">"{rejectModal.title}"</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-green"
              rows={3} placeholder="Reason for rejection (optional)" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={reject}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
