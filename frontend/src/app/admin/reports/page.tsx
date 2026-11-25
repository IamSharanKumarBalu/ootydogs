"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiSearch, HiFlag, HiChevronLeft, HiChevronRight, HiEye, HiCheck, HiX,
} from "react-icons/hi";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const STATUS_COLOR: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  investigating: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  dismissed: "bg-slate-100 text-slate-500",
};

const REASON_LABEL: Record<string, string> = {
  spam: "Spam", scam: "Scam/Fraud", inappropriate: "Inappropriate", misleading: "Misleading",
  abuse: "Abuse", other: "Other",
};

interface Report {
  _id: string; reason: string; description?: string; status: string; createdAt: string;
  reporter?: { name: string; email: string };
  listing?: { _id: string; title: string; slug: string };
  resolvedNote?: string;
}

function AdminReportsInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<Report | null>(null);
  const [resolveModal, setResolveModal] = useState<Report | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [resolveStatus, setResolveStatus] = useState<"resolved" | "dismissed" | "investigating">("resolved");

  const status = sp.get("status") || "";
  const q      = sp.get("q") || "";
  const page   = Number(sp.get("page") || "1");

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/admin/reports?${p.toString()}`);
  };

  const fetchReports = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q)      params.set("q", q);
    params.set("page", String(page));
    params.set("limit", "20");

    fetch(`${API}/admin/reports?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => { if (d.success) { setReports(d.reports || []); setTotal(d.total || 0); setPages(d.pages || 1); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, q, page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const updateReport = async (id: string, newStatus: string, note?: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API}/admin/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ status: newStatus, resolvedNote: note }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Report marked as ${newStatus}`);
        fetchReports();
      } else {
        toast.error(d.message || "Action failed");
      }
    } catch { toast.error("Network error"); }
    finally { setActionLoading(null); }
  };

  const handleResolve = async () => {
    if (!resolveModal) return;
    await updateReport(resolveModal._id, resolveStatus, resolveNote);
    setResolveModal(null);
    setResolveNote("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">{total} total reports</p>
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
            placeholder="Search listing, reporter…"
            className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><HiFlag className="w-10 h-10 text-slate-200 mx-auto animate-bounce" /></div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center"><HiFlag className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-500 text-sm">No reports found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Listing", "Reason", "Reporter", "Date", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-[180px] truncate">{r.listing?.title || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">{REASON_LABEL[r.reason] || r.reason}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{r.reporter?.name || "Anonymous"}</td>
                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status] || "bg-slate-100 text-slate-600"}`}>{r.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setDetailModal(r)} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100" title="View details"><HiEye size={14} /></button>
                        {(r.status === "open" || r.status === "investigating") && (
                          <>
                            <button onClick={() => { setResolveModal(r); setResolveStatus("investigating"); setResolveNote(""); }} disabled={!!actionLoading}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 disabled:opacity-50">
                              Investigate
                            </button>
                            <button onClick={() => { setResolveModal(r); setResolveStatus("resolved"); setResolveNote(""); }} disabled={!!actionLoading}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-50">
                              <HiCheck size={13} /> Resolve
                            </button>
                            <button onClick={() => updateReport(r._id, "dismissed")} disabled={!!actionLoading}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-xs font-medium hover:bg-slate-100 disabled:opacity-50">
                              <HiX size={13} /> Dismiss
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

      {/* Detail modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">Report Details</h2>
              <button onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-slate-600"><HiX size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-xs font-semibold text-slate-500 uppercase">Listing</span><p className="text-slate-800 mt-0.5">{detailModal.listing?.title || "—"}</p></div>
              <div><span className="text-xs font-semibold text-slate-500 uppercase">Reason</span><p className="text-slate-800 mt-0.5">{REASON_LABEL[detailModal.reason] || detailModal.reason}</p></div>
              {detailModal.description && <div><span className="text-xs font-semibold text-slate-500 uppercase">Description</span><p className="text-slate-700 mt-0.5">{detailModal.description}</p></div>}
              <div><span className="text-xs font-semibold text-slate-500 uppercase">Reporter</span><p className="text-slate-800 mt-0.5">{detailModal.reporter?.name || "Anonymous"}{detailModal.reporter?.email ? ` · ${detailModal.reporter.email}` : ""}</p></div>
              <div><span className="text-xs font-semibold text-slate-500 uppercase">Status</span><p className="mt-0.5"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[detailModal.status] || ""}`}>{detailModal.status}</span></p></div>
              {detailModal.resolvedNote && <div><span className="text-xs font-semibold text-slate-500 uppercase">Resolution Note</span><p className="text-slate-700 mt-0.5">{detailModal.resolvedNote}</p></div>}
            </div>
            <button onClick={() => setDetailModal(null)} className="mt-5 w-full px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid">Close</button>
          </div>
        </div>
      )}

      {/* Resolve modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="font-bold text-slate-800 mb-1">Update Report</h2>
            <p className="text-sm text-slate-500 mb-4 truncate">{resolveModal.listing?.title || "Report"}</p>
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Set Status</p>
              <div className="flex gap-2">
                {(["investigating", "resolved", "dismissed"] as const).map(s => (
                  <button key={s} onClick={() => setResolveStatus(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border capitalize transition-all ${resolveStatus === s ? "bg-brand-green text-white border-brand-green" : "bg-white border-slate-200 text-slate-600 hover:border-brand-green"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={resolveNote} onChange={e => setResolveNote(e.target.value)} rows={2} placeholder="Resolution note (optional)" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setResolveModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleResolve} disabled={!!actionLoading} className="flex-1 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  return <Suspense><AdminReportsInner /></Suspense>;
}
