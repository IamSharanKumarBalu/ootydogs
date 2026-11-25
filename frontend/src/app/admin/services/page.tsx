"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  HiSearch, HiCheck, HiX, HiEye,
  HiChevronLeft, HiChevronRight,
} from "react-icons/hi";
import { MdPets } from "react-icons/md";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  draft: "bg-slate-100 text-slate-600",
};

const CAT_LABEL: Record<string, string> = {
  veterinary: "Vet", grooming: "Grooming", boarding: "Boarding",
  training: "Training", transportation: "Transport", photography: "Photography",
  care: "Pet Care", supplies: "Supplies", other: "Other",
};

interface Service {
  _id: string; slug: string; businessName: string; category: string;
  status: string; featuredService: boolean; city?: string; state?: string;
  owner?: { name: string }; createdAt: string;
}

function AdminServicesInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const status = sp.get("status") || "";
  const q      = sp.get("q") || "";
  const page   = Number(sp.get("page") || "1");

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/admin/services?${p.toString()}`);
  };

  const fetchServices = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q)      params.set("q", q);
    params.set("page", String(page));
    params.set("limit", "20");

    fetch(`${API}/admin/services?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => { if (d.success) { setServices(d.services || []); setTotal(d.total || 0); setPages(d.pages || 1); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, q, page]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const action = async (id: string, endpoint: string, body?: object) => {
    setActionLoading(id + endpoint);
    try {
      const res = await fetch(`${API}/admin/services/${id}/${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Service ${endpoint}d`);
        fetchServices();
      } else {
        toast.error(d.message || "Action failed");
      }
    } catch { toast.error("Network error"); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    await action(rejectModal.id, "reject", { reason: rejectReason });
    setRejectModal(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pet Services</h1>
        <p className="text-slate-500 text-sm mt-0.5">{total} total services</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => setParam("status", s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${status === s.value ? "bg-brand-green text-white border-brand-green" : "bg-white border-slate-200 text-slate-600 hover:border-brand-green"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[180px] flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
          <HiSearch className="text-slate-400 shrink-0" size={15} />
          <input type="search" value={q} onChange={e => setParam("q", e.target.value)}
            placeholder="Search business name…"
            className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><MdPets className="w-10 h-10 text-slate-200 mx-auto animate-bounce" /></div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center"><MdPets className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-500 text-sm">No services found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Business", "Category", "Owner", "Location", "Status", "Featured", "Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-[180px] truncate">{s.businessName}</td>
                    <td className="py-3 px-4 text-xs text-slate-500 capitalize">{CAT_LABEL[s.category] || s.category}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{s.owner?.name || "—"}</td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">{[s.city, s.state].filter(Boolean).join(", ") || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[s.status] || "bg-slate-100 text-slate-600"}`}>{s.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => action(s._id, "feature")} disabled={!!actionLoading}
                        className={`text-xs px-2 py-1 rounded-lg border ${s.featuredService ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-300"}`}>
                        {s.featuredService ? "★" : "☆"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/services/${s.slug}`} target="_blank"
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100"><HiEye size={14} /></Link>
                        {s.status === "pending" && (
                          <>
                            <button onClick={() => action(s._id, "approve")} disabled={!!actionLoading}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-50">
                              <HiCheck size={13} /> Approve
                            </button>
                            <button onClick={() => setRejectModal({ id: s._id, name: s.businessName })} disabled={!!actionLoading}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50">
                              <HiX size={13} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setParam("page", String(page - 1))} disabled={page <= 1} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-brand-green disabled:opacity-40"><HiChevronLeft size={18} /></button>
          {Array.from({ length: Math.min(pages, 7) }).map((_, i) => { const n = i + 1; return <button key={n} onClick={() => setParam("page", String(n))} className={`w-9 h-9 rounded-lg text-sm font-medium ${page === n ? "bg-brand-green text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-green"}`}>{n}</button>; })}
          <button onClick={() => setParam("page", String(page + 1))} disabled={page >= pages} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-brand-green disabled:opacity-40"><HiChevronRight size={18} /></button>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="font-bold text-slate-800 mb-1">Reject Service</h2>
            <p className="text-sm text-slate-500 mb-4">{rejectModal.name}</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Reason (optional)" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleReject} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminServicesPage() {
  return <Suspense><AdminServicesInner /></Suspense>;
}
