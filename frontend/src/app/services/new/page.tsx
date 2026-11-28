"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiArrowRight, HiCheck } from "react-icons/hi";
import { FaStore } from "react-icons/fa";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Puducherry",
];

const SERVICE_CATEGORIES = [
  "Veterinary","Grooming","Training","Boarding","Photography","Transportation",
  "Pet Shop","Day Care","Adoption","Breeding","Nutrition & Diet","Other",
];

const STEPS = ["Business Info", "Location & Contact", "Review & Submit"];

function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

const inp = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-sm transition-all";
const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

export default function NewServicePage() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    category: "",
    description: "",
    address: "",
    state: "",
    city: "",
    phone: "",
    whatsapp: "",
    website: "",
    timings: "",
    instagram: "",
    facebook: "",
  });

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  // Redirect to login if not signed in
  useEffect(() => {
    if (!isPending && !sessionData?.user) router.replace("/login?redirect=/services/new");
  }, [isPending, sessionData, router]);

  const canNext = () => {
    if (step === 0) return form.businessName.trim().length > 0 && form.category.length > 0;
    if (step === 1) return form.state.length > 0 && form.city.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        businessName: form.businessName,
        category: form.category,
        description: form.description,
        address: form.address,
        state: form.state,
        city: form.city,
        phone: form.phone,
        whatsapp: form.whatsapp,
        website: form.website,
        timings: form.timings,
        socialLinks: {
          instagram: form.instagram,
          facebook: form.facebook,
        },
      };
      const res = await fetch(`${API}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Service submitted for review!");
        router.push("/profile?tab=services");
      } else {
        toast.error(d.message || "Failed to submit service");
      }
    } catch { toast.error("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  if (isPending || (!isPending && !sessionData?.user)) {
    return (
      <div className="min-h-screen bg-brand-green-soft flex items-center justify-center">
        <FaStore className="w-10 h-10 text-brand-green/30 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-green-soft py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <Link href="/profile?tab=services" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-green transition-colors">
            <HiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">List Your Service</h1>
            <p className="text-slate-500 text-sm mt-0.5">Reach thousands of pet owners in your area</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-0 mb-8 bg-white rounded-2xl p-4 border border-green-100 shadow-sm">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? "bg-brand-green text-white" : i === step ? "bg-brand-green text-white ring-4 ring-brand-green/20" : "bg-slate-100 text-slate-400"}`}>
                  {i < step ? <HiCheck size={14} /> : i + 1}
                </div>
                <span className={`text-[11px] mt-1.5 font-medium hidden sm:block ${i === step ? "text-brand-green" : "text-slate-400"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded-full ${i < step ? "bg-brand-green" : "bg-slate-100"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 md:p-8">

          {/* ── STEP 0: Business Info ── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-800 mb-5">Business Information</h2>

              <div>
                <label className={lbl}>Business / Service Name *</label>
                <input value={form.businessName} onChange={e => set("businessName", e.target.value)}
                  className={inp} placeholder="e.g. Ooty Pet Clinic" maxLength={100} />
              </div>

              <div>
                <label className={lbl}>Service Category *</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} className={`${inp} cursor-pointer`}>
                  <option value="">Select a category</option>
                  {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className={lbl}>Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)}
                  rows={4} className={`${inp} resize-none`}
                  placeholder="Describe your services, experience, specialisations…" maxLength={1000} />
                <p className="text-[11px] text-slate-400 mt-1 text-right">{form.description.length}/1000</p>
              </div>

              <div>
                <label className={lbl}>Working Hours / Timings</label>
                <input value={form.timings} onChange={e => set("timings", e.target.value)}
                  className={inp} placeholder="e.g. Mon–Sat 9 AM – 7 PM" maxLength={100} />
              </div>
            </div>
          )}

          {/* ── STEP 1: Location & Contact ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-800 mb-5">Location & Contact</h2>

              <div>
                <label className={lbl}>Street Address</label>
                <input value={form.address} onChange={e => set("address", e.target.value)}
                  className={inp} placeholder="e.g. 12, Main Road, Ooty" maxLength={200} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>State *</label>
                  <select value={form.state} onChange={e => set("state", e.target.value)} className={`${inp} cursor-pointer`}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>City *</label>
                  <input value={form.city} onChange={e => set("city", e.target.value)} className={inp} placeholder="e.g. Ooty" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className={inp} placeholder="+91 70945 08737" />
                </div>
                <div>
                  <label className={lbl}>WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} className={inp} placeholder="+91 70945 08737" />
                </div>
              </div>

              <div>
                <label className={lbl}>Website (optional)</label>
                <input type="url" value={form.website} onChange={e => set("website", e.target.value)} className={inp} placeholder="https://yourwebsite.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Instagram</label>
                  <input value={form.instagram} onChange={e => set("instagram", e.target.value)} className={inp} placeholder="@handle or URL" />
                </div>
                <div>
                  <label className={lbl}>Facebook</label>
                  <input value={form.facebook} onChange={e => set("facebook", e.target.value)} className={inp} placeholder="page URL" />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Review ── */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-5">Review & Submit</h2>
              <div className="rounded-xl bg-brand-green-soft border border-green-100 divide-y divide-green-100">
                {[
                  ["Business Name", form.businessName],
                  ["Category",      form.category],
                  ["Description",   form.description || "—"],
                  ["Timings",       form.timings || "—"],
                  ["Address",       [form.address, form.city, form.state].filter(Boolean).join(", ") || "—"],
                  ["Phone",         form.phone || "—"],
                  ["WhatsApp",      form.whatsapp || "—"],
                  ["Website",       form.website || "—"],
                  ["Instagram",     form.instagram || "—"],
                  ["Facebook",      form.facebook || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-4 px-4 py-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-28 shrink-0 mt-0.5">{label}</span>
                    <span className="text-sm text-slate-800 break-words min-w-0">{val}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                Your listing will be reviewed by our team before it goes live. This usually takes 24–48 hours.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-5">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              <HiArrowLeft size={15} /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all">
              Next <HiArrowRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-brand-red text-white rounded-xl text-sm font-semibold hover:bg-brand-red-light disabled:opacity-50 shadow-sm transition-all">
              <HiCheck size={16} /> {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
