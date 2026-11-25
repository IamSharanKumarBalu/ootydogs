"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiCheck } from "react-icons/hi";
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

function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

const inp = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-sm transition-all";
const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

export default function EditServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();

  const [serviceId, setServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

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

  useEffect(() => {
    if (!isPending && !sessionData?.user) { router.replace("/login"); return; }
    if (isPending) return;
    fetch(`${API}/services/${slug}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.service) {
          const s = d.service;
          setServiceId(s._id);
          setForm({
            businessName: s.businessName || "",
            category:     s.category     || "",
            description:  s.description  || "",
            address:      s.address      || "",
            state:        s.state        || "",
            city:         s.city         || "",
            phone:        s.phone        || "",
            whatsapp:     s.whatsapp     || "",
            website:      s.website      || "",
            timings:      s.timings      || "",
            instagram:    s.socialLinks?.instagram || "",
            facebook:     s.socialLinks?.facebook  || "",
          });
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, isPending, sessionData, router]);

  const handleSave = async () => {
    if (!form.businessName.trim()) { toast.error("Business name is required"); return; }
    if (!form.category) { toast.error("Please select a category"); return; }
    setSaving(true);
    try {
      const payload = {
        businessName: form.businessName,
        category:     form.category,
        description:  form.description,
        address:      form.address,
        state:        form.state,
        city:         form.city,
        phone:        form.phone,
        whatsapp:     form.whatsapp,
        website:      form.website,
        timings:      form.timings,
        socialLinks:  { instagram: form.instagram, facebook: form.facebook },
      };
      const res = await fetch(`${API}/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Service updated — changes will be reviewed.");
        router.push("/profile?tab=services");
      } else {
        toast.error(d.message || "Failed to update service");
      }
    } catch { toast.error("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  if (loading || isPending) {
    return (
      <div className="min-h-screen bg-brand-green-soft flex items-center justify-center">
        <FaStore className="w-10 h-10 text-brand-green/30 animate-pulse" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-brand-green-soft flex flex-col items-center justify-center gap-4">
        <FaStore className="w-12 h-12 text-slate-200" />
        <h2 className="text-xl font-bold text-slate-700">Service not found</h2>
        <Link href="/profile?tab=services" className="px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid">
          Back to My Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-green-soft py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-7 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/profile?tab=services" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-green transition-colors">
              <HiArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Service</h1>
              <p className="text-slate-500 text-sm mt-0.5">Changes will be reviewed before going live</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid disabled:opacity-50 shadow-sm transition-all">
            <HiCheck size={16} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 md:p-8 space-y-7">

          {/* Business Info */}
          <section>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Business Information</h2>
            <div className="space-y-4">
              <div>
                <label className={lbl}>Business / Service Name *</label>
                <input value={form.businessName} onChange={e => set("businessName", e.target.value)} className={inp} maxLength={100} />
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
                  rows={4} className={`${inp} resize-none`} maxLength={1000} />
              </div>
              <div>
                <label className={lbl}>Working Hours / Timings</label>
                <input value={form.timings} onChange={e => set("timings", e.target.value)} className={inp} placeholder="e.g. Mon–Sat 9 AM – 7 PM" />
              </div>
            </div>
          </section>

          {/* Location & Contact */}
          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Location & Contact</h2>
            <div className="space-y-4">
              <div>
                <label className={lbl}>Street Address</label>
                <input value={form.address} onChange={e => set("address", e.target.value)} className={inp} maxLength={200} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>State</label>
                  <select value={form.state} onChange={e => set("state", e.target.value)} className={`${inp} cursor-pointer`}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>City</label>
                  <input value={form.city} onChange={e => set("city", e.target.value)} className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Website</label>
                <input type="url" value={form.website} onChange={e => set("website", e.target.value)} className={inp} placeholder="https://" />
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
          </section>
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-brand-green-mid disabled:opacity-50 shadow-sm transition-all">
            <HiCheck size={16} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
