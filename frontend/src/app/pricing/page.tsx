"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiCheck, HiLightningBolt } from "react-icons/hi";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

const PLANS = [
  {
    id: "basic",
    label: "Basic",
    price: 100,
    listings: "1 listing",
    validity: "30 days",
    description: "Perfect for a one-time listing",
    features: ["1 pet listing", "Visible for 30 days", "Photo upload", "Contact form"],
    highlight: false,
  },
  {
    id: "standard",
    label: "Standard",
    price: 1000,
    listings: "15 listings",
    validity: "1 year",
    description: "Great for regular sellers & breeders",
    features: ["15 total listings", "Valid for 1 year", "Photo upload", "Priority listing", "Contact form"],
    highlight: true,
  },
  {
    id: "premium",
    label: "Premium",
    price: 5000,
    listings: "Unlimited",
    validity: "1 year",
    description: "For professional breeders & kennels",
    features: ["Unlimited listings", "Valid for 1 year", "Photo upload", "Featured listings", "Priority support"],
    highlight: false,
  },
];

declare global { interface Window { Razorpay: new (opts: object) => { open: () => void }; } }

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<{ plan: string; validUntil: string; listingsUsed: number; listingsAllowed: number } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/subscription/my-plan`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    }).then(r => r.json()).then(d => { if (d.success && d.subscription) setCurrentPlan(d.subscription); }).catch(() => {});
  }, []);

  const loadRazorpay = () => new Promise<boolean>(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handleBuy = async (planId: string) => {
    if (!getToken()) { router.push("/login?redirect=/pricing"); return; }
    setLoading(planId);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error("Payment gateway failed to load"); return; }

      const orderRes = await fetch(`${API}/subscription/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ plan: planId }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) { toast.error(orderData.message || "Failed to create order"); return; }

      const plan = PLANS.find(p => p.id === planId)!;
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: "INR",
        name: "OotyDogs",
        description: `${plan.label} Plan — ${plan.listings}`,
        order_id: orderData.order.id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch(`${API}/subscription/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success("Payment successful! Your plan is now active.");
              router.push("/my/subscription");
            } else {
              toast.error("Payment verification failed. Contact support.");
            }
          } catch { toast.error("Verification error. Contact support."); }
        },
        theme: { color: "#1a6b3c" },
      };
      new window.Razorpay(options).open();
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-green-soft to-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-semibold rounded-full mb-4">
            <HiLightningBolt size={12} /> Simple Pricing
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">List your pets on OotyDogs</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Choose a plan that fits your needs. All plans include photo uploads and a contact form for buyers.</p>
        </div>

        {/* Current plan banner */}
        {currentPlan && (
          <div className="mb-8 bg-brand-green text-white rounded-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold">Your active plan: {currentPlan.plan.charAt(0).toUpperCase() + currentPlan.plan.slice(1)}</p>
              <p className="text-white/80 text-sm">
                {currentPlan.listingsAllowed === -1 ? "Unlimited listings" : `${currentPlan.listingsUsed} / ${currentPlan.listingsAllowed} listings used`}
                {" · "}Valid until {new Date(currentPlan.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <button onClick={() => router.push("/my/subscription")} className="px-4 py-2 bg-white text-brand-green rounded-xl text-sm font-semibold hover:bg-brand-green-soft">
              View Details
            </button>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const isActive = currentPlan?.plan === plan.id;
            return (
              <div key={plan.id}
                className={`relative bg-white rounded-3xl border-2 p-7 flex flex-col shadow-sm transition-all ${plan.highlight ? "border-brand-green shadow-brand-green/10 shadow-lg" : "border-slate-200"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-green text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-3.5 right-5 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                    ACTIVE
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">{plan.label}</h2>
                  <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-slate-900">₹{plan.price.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{plan.listings} · {plan.validity}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <HiCheck className="text-brand-green shrink-0" size={16} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleBuy(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${plan.highlight ? "bg-brand-green text-white hover:bg-brand-green-mid" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                  {loading === plan.id ? "Processing…" : isActive ? "Buy Again" : `Get ${plan.label}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-slate-400 text-sm mt-10">
          Payments are secure and powered by Razorpay. All prices include GST.
        </p>
      </div>
    </div>
  );
}
