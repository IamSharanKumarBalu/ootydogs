"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiCheck, HiClock, HiExclamation } from "react-icons/hi";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

interface Sub {
  _id: string;
  plan: "basic" | "standard" | "premium";
  price: number;
  listingsAllowed: number;
  listingsUsed: number;
  status: string;
  validFrom: string;
  validUntil: string;
  razorpayPaymentId?: string;
}

const PLAN_COLORS: Record<string, string> = {
  basic: "bg-slate-100 text-slate-700",
  standard: "bg-brand-green/10 text-brand-green",
  premium: "bg-amber-50 text-amber-700",
};

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

export default function MySubscriptionPage() {
  const router = useRouter();
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    fetch(`${API}/subscription/my-plan`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    }).then(r => r.json()).then(d => {
      if (d.success) setSub(d.subscription);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin" />
    </div>
  );

  const daysLeft = sub ? Math.max(0, Math.ceil((new Date(sub.validUntil).getTime() - Date.now()) / 86400000)) : 0;
  const usedPercent = sub && sub.listingsAllowed !== -1 ? Math.round((sub.listingsUsed / sub.listingsAllowed) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Subscription</h1>
          <p className="text-slate-500 text-sm mt-1">Your current plan and listing usage</p>
        </div>

        {!sub ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiExclamation size={28} className="text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">No active plan</h2>
            <p className="text-slate-500 text-sm mb-6">Purchase a plan to start listing your pets on OotyDogs.</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl font-semibold text-sm hover:bg-brand-green-mid">
              View Plans
            </Link>
          </div>
        ) : (
          <>
            {/* Plan card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${PLAN_COLORS[sub.plan]}`}>
                    {PLAN_LABELS[sub.plan]}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">₹{sub.price.toLocaleString("en-IN")}</h2>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${daysLeft <= 7 ? "text-red-500" : "text-slate-600"}`}>
                    <HiClock size={15} />
                    {daysLeft} days remaining
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Expires {new Date(sub.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Listing usage */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600 font-medium">Listings used</span>
                  <span className="font-bold text-slate-800">
                    {sub.listingsAllowed === -1 ? `${sub.listingsUsed} / Unlimited` : `${sub.listingsUsed} / ${sub.listingsAllowed}`}
                  </span>
                </div>
                {sub.listingsAllowed !== -1 && (
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${usedPercent >= 90 ? "bg-red-500" : "bg-brand-green"}`}
                      style={{ width: `${Math.min(usedPercent, 100)}%` }}
                    />
                  </div>
                )}
                {sub.listingsAllowed === -1 && (
                  <div className="flex items-center gap-1.5 text-brand-green text-sm">
                    <HiCheck size={15} /> Unlimited listings included
                  </div>
                )}
              </div>

              {/* Plan features */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
                <div className="text-sm">
                  <p className="text-slate-400 text-xs">Valid from</p>
                  <p className="font-medium text-slate-700">{new Date(sub.validFrom).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="text-sm">
                  <p className="text-slate-400 text-xs">Payment ID</p>
                  <p className="font-mono text-xs text-slate-500 truncate">{sub.razorpayPaymentId || "—"}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/listings/new" className="flex-1 py-3 bg-brand-green text-white rounded-xl font-semibold text-sm text-center hover:bg-brand-green-mid">
                Create a Listing
              </Link>
              <Link href="/pricing" className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm text-center hover:bg-slate-50">
                Upgrade Plan
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
