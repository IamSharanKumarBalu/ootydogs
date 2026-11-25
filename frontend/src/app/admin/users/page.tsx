"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiSearch, HiCheck, HiUsers, HiChevronLeft, HiChevronRight,
  HiMail, HiPhone, HiLocationMarker,
} from "react-icons/hi";
import { FaPaw } from "react-icons/fa";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

function getToken() {
  try { return localStorage.getItem("auth_token") || ""; } catch { return ""; }
}

const VERIFICATION_STATUS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "blocked", label: "Blocked" },
];

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-orange-100 text-orange-700",
  blocked: "bg-red-200 text-red-800",
};

interface User {
  _id: string; name: string; email: string; phone?: string;
  city?: string; state?: string; role: string;
  verificationStatus: string; canPostListings: boolean; createdAt: string;
}

function AdminUsersInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [verifyModal, setVerifyModal] = useState<User | null>(null);
  const [verifyNote, setVerifyNote] = useState("");
  const [verifyAction, setVerifyAction] = useState<"verified" | "rejected" | "suspended">("verified");

  const verificationStatus = sp.get("verificationStatus") || "";
  const q    = sp.get("q") || "";
  const page = Number(sp.get("page") || "1");

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/admin/users?${p.toString()}`);
  };

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (verificationStatus) params.set("verificationStatus", verificationStatus);
    if (q)                   params.set("q", q);
    params.set("page", String(page));
    params.set("limit", "20");

    fetch(`${API}/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => { if (d.success) { setUsers(d.users || []); setTotal(d.total || 0); setPages(d.pages || 1); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [verificationStatus, q, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleVerify = async () => {
    if (!verifyModal) return;
    setActionLoading(verifyModal._id);
    try {
      const res = await fetch(`${API}/admin/users/${verifyModal._id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ status: verifyAction, note: verifyNote }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`User ${verifyAction}`);
        setVerifyModal(null);
        setVerifyNote("");
        fetchUsers();
      } else {
        toast.error(d.message || "Action failed");
      }
    } catch { toast.error("Network error"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 text-sm mt-0.5">{total} registered users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex gap-1.5 flex-wrap">
          {VERIFICATION_STATUS.map(s => (
            <button key={s.value}
              onClick={() => setParam("verificationStatus", s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${verificationStatus === s.value ? "bg-brand-green text-white border-brand-green" : "bg-white border-slate-200 text-slate-600 hover:border-brand-green"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[180px] flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
          <HiSearch className="text-slate-400 shrink-0" size={15} />
          <input type="search" value={q} onChange={e => setParam("q", e.target.value)}
            placeholder="Search name or email…"
            className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <FaPaw className="w-10 h-10 text-slate-200 mx-auto animate-bounce" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <HiUsers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["User", "Contact", "Location", "Verification", "Can Post", "Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-green-soft rounded-full flex items-center justify-center shrink-0">
                          <span className="text-brand-green font-bold text-xs">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1"><HiMail size={11} className="shrink-0" /><span className="truncate max-w-[140px]">{u.email}</span></div>
                        {u.phone && <div className="flex items-center gap-1"><HiPhone size={11} className="shrink-0" />{u.phone}</div>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {[u.city, u.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[u.verificationStatus] || "bg-slate-100 text-slate-600"}`}>
                        {u.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.canPostListings ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {u.canPostListings ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => { setVerifyModal(u); setVerifyAction(u.verificationStatus === "verified" ? "suspended" : "verified"); setVerifyNote(""); }}
                        disabled={actionLoading === u._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green-soft text-brand-green rounded-lg text-xs font-medium hover:bg-brand-green-muted transition-colors disabled:opacity-50">
                        <HiCheck size={12} /> Manage
                      </button>
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
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setParam("page", String(page - 1))} disabled={page <= 1}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-brand-green disabled:opacity-40">
            <HiChevronLeft size={18} />
          </button>
          {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
            const n = i + 1;
            return (
              <button key={n} onClick={() => setParam("page", String(n))}
                className={`w-9 h-9 rounded-lg text-sm font-medium ${page === n ? "bg-brand-green text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-green"}`}>
                {n}
              </button>
            );
          })}
          <button onClick={() => setParam("page", String(page + 1))} disabled={page >= pages}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-brand-green disabled:opacity-40">
            <HiChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Verify modal */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="font-bold text-slate-800 mb-1">Manage User</h2>
            <p className="text-sm text-slate-600 mb-4">{verifyModal.name} · {verifyModal.email}</p>

            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Set Status</p>
              <div className="flex gap-2">
                {(["verified", "rejected", "suspended"] as const).map(s => (
                  <button key={s}
                    onClick={() => setVerifyAction(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border capitalize transition-all ${verifyAction === s ? "bg-brand-green text-white border-brand-green" : "bg-white border-slate-200 text-slate-600 hover:border-brand-green"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={verifyNote} onChange={e => setVerifyNote(e.target.value)}
              rows={2} placeholder="Note to user (optional)"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setVerifyModal(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleVerify} disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid disabled:opacity-50">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return <Suspense><AdminUsersInner /></Suspense>;
}
