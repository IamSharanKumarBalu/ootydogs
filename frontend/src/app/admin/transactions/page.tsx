"use client";

import { useState, useEffect, useCallback } from "react";
import { HiRefresh, HiCreditCard } from "react-icons/hi";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

interface Sub {
  _id: string;
  user: { name: string; email: string; phone?: string };
  plan: "basic" | "standard" | "premium";
  price: number;
  status: "pending" | "active" | "expired" | "refunded";
  listingsAllowed: number;
  listingsUsed: number;
  validFrom?: string;
  validUntil?: string;
  razorpayPaymentId?: string;
  refundId?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-slate-100 text-slate-600",
  active:   "bg-green-50 text-green-700",
  expired:  "bg-amber-50 text-amber-700",
  refunded: "bg-red-50 text-red-600",
};

const PLAN_STYLES: Record<string, string> = {
  basic:    "bg-slate-100 text-slate-700",
  standard: "bg-brand-green/10 text-brand-green",
  premium:  "bg-amber-50 text-amber-700",
};

export default function AdminTransactionsPage() {
  const [subs, setSubs]       = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState({ total: 0, count: 0 });
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterPlan, setFilterPlan]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filterPlan)   params.set("plan", filterPlan);
    if (filterStatus) params.set("status", filterStatus);

    fetch(`${API}/admin/transactions?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    }).then(r => r.json()).then(d => {
      if (d.success) {
        setSubs(d.subscriptions || []);
        setTotalPages(d.pages || 1);
        if (d.revenue) setRevenue(d.revenue);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, filterPlan, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const fmtMoney = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 text-sm mt-0.5">All subscription payments and refunds</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">
          <HiRefresh size={15} /> Refresh
        </button>
      </div>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: fmtMoney(revenue.total), sub: `${revenue.count} paid plans` },
          { label: "Active Plans",  value: String(subs.filter(s => s.status === "active").length),   sub: "currently active" },
          { label: "Refunds",       value: String(subs.filter(s => s.status === "refunded").length), sub: "total refunded" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:border-brand-green">
          <option value="">All Plans</option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:border-brand-green">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <HiCreditCard className="w-10 h-10 text-slate-200 animate-pulse" />
          </div>
        ) : subs.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["User", "Plan", "Amount", "Status", "Used", "Valid Until", "Payment ID", "Date"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subs.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{s.user?.name || "—"}</p>
                      <p className="text-xs text-slate-400">{s.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PLAN_STYLES[s.plan]}`}>
                        {s.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{fmtMoney(s.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[s.status]}`}>
                        {s.status}
                      </span>
                      {s.refundId && (
                        <p className="text-xs text-red-400 mt-0.5 font-mono truncate max-w-[100px]">{s.refundId}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.listingsAllowed === -1 ? `${s.listingsUsed} / ∞` : `${s.listingsUsed} / ${s.listingsAllowed}`}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {s.validUntil ? fmt(s.validUntil) : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[120px] truncate">
                      {s.razorpayPaymentId || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmt(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40">
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
