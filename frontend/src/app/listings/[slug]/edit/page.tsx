"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiCheck } from "react-icons/hi";
import { FaPaw } from "react-icons/fa";
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

interface PetType { _id: string; name: string; }
interface Breed { _id: string; name: string; petType: string | { _id: string }; }
interface ListingCategory { _id: string; name: string; }

function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }
const inp = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-sm transition-all";
const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

export default function EditListingPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [listingId, setListingId] = useState("");
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title: "", petName: "", petType: "", breed: "", listingCategory: "",
    age: "", gender: "", colour: "", vaccinationStatus: "",
    description: "", healthInfo: "",
    state: "", city: "", price: "",
    contactPhone: "", whatsappNumber: "", showContactInfo: true,
  });

  const set = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    // Load dropdowns and listing in parallel
    Promise.all([
      fetch(`${API}/pet-types`).then(r => r.json()),
      fetch(`${API}/breeds?limit=200`).then(r => r.json()),
      fetch(`${API}/listing-categories`).then(r => r.json()),
      fetch(`${API}/listings/${slug}`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" }).then(r => r.json()),
    ]).then(([pt, br, cat, ld]) => {
      if (pt.success) setPetTypes(pt.petTypes || []);
      if (br.success) setBreeds(br.breeds || []);
      if (cat.success) setCategories(cat.categories || []);
      if (ld.success && ld.listing) {
        const l = ld.listing;
        setListingId(l._id);
        setForm({
          title: l.title || "",
          petName: l.petName || "",
          petType: typeof l.petType === "object" ? l.petType._id : (l.petType || ""),
          breed: typeof l.breed === "object" ? l.breed._id : (l.breed || ""),
          listingCategory: typeof l.listingCategory === "object" ? l.listingCategory._id : (l.listingCategory || ""),
          age: l.age || "",
          gender: l.gender || "",
          colour: l.colour || "",
          vaccinationStatus: l.vaccinationStatus || "",
          description: l.description || "",
          healthInfo: l.healthInfo || "",
          state: l.state || "",
          city: l.city || "",
          price: l.price != null ? String(l.price) : "",
          contactPhone: l.contactPhone || "",
          whatsappNumber: l.whatsappNumber || "",
          showContactInfo: l.showContactInfo ?? true,
        });
      } else {
        setNotFound(true);
      }
    }).catch(() => setNotFound(true))
    .finally(() => setLoading(false));
  }, [slug]);

  const filteredBreeds = form.petType
    ? breeds.filter(b => {
        const ptId = typeof b.petType === "string" ? b.petType : b.petType._id;
        return ptId === form.petType;
      })
    : breeds;

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: form.price ? Number(form.price) : undefined };
      const res = await fetch(`${API}/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Listing updated");
        router.push("/profile?tab=listings");
      } else {
        toast.error(d.message || "Failed to update listing");
      }
    } catch { toast.error("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-green-soft flex items-center justify-center">
        <FaPaw className="w-10 h-10 text-brand-green/30 animate-bounce" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-brand-green-soft flex flex-col items-center justify-center gap-4">
        <FaPaw className="w-12 h-12 text-slate-200" />
        <h2 className="text-xl font-bold text-slate-700">Listing not found</h2>
        <Link href="/profile?tab=listings" className="px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid">
          Back to My Listings
        </Link>
      </div>
    );
  }

  if (session?.user === undefined) return null;

  return (
    <div className="min-h-screen bg-brand-green-soft py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-7 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/profile?tab=listings" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-green transition-colors">
              <HiArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Listing</h1>
              <p className="text-slate-500 text-sm mt-0.5">Changes will be reviewed before going live</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid disabled:opacity-50 shadow-sm transition-all">
            <HiCheck size={16} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 md:p-8 space-y-6">
          {/* Pet Info */}
          <section>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Pet Information</h2>
            <div className="space-y-4">
              <div>
                <label className={lbl}>Title *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} className={inp} maxLength={100} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Pet Type</label>
                  <select value={form.petType} onChange={e => { set("petType", e.target.value); set("breed", ""); }} className={`${inp} cursor-pointer`}>
                    <option value="">Select pet type</option>
                    {petTypes.map(pt => <option key={pt._id} value={pt._id}>{pt.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Breed</label>
                  <select value={form.breed} onChange={e => set("breed", e.target.value)} className={`${inp} cursor-pointer`} disabled={!form.petType}>
                    <option value="">Select breed</option>
                    {filteredBreeds.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Pet Name</label>
                  <input value={form.petName} onChange={e => set("petName", e.target.value)} className={inp} placeholder="e.g. Bruno" />
                </div>
                <div>
                  <label className={lbl}>Age</label>
                  <input value={form.age} onChange={e => set("age", e.target.value)} className={inp} placeholder="e.g. 3 months" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Gender</label>
                  <select value={form.gender} onChange={e => set("gender", e.target.value)} className={`${inp} cursor-pointer`}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Vaccination</label>
                  <select value={form.vaccinationStatus} onChange={e => set("vaccinationStatus", e.target.value)} className={`${inp} cursor-pointer`}>
                    <option value="">Select status</option>
                    <option value="yes">Fully Vaccinated</option>
                    <option value="partial">Partially Vaccinated</option>
                    <option value="no">Not Vaccinated</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Colour / Markings</label>
                  <input value={form.colour} onChange={e => set("colour", e.target.value)} className={inp} placeholder="e.g. Golden" />
                </div>
                <div>
                  <label className={lbl}>Category</label>
                  <select value={form.listingCategory} onChange={e => set("listingCategory", e.target.value)} className={`${inp} cursor-pointer`}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} className={`${inp} resize-none`} />
              </div>

              <div>
                <label className={lbl}>Health Information</label>
                <textarea value={form.healthInfo} onChange={e => set("healthInfo", e.target.value)} rows={3} className={`${inp} resize-none`} />
              </div>
            </div>
          </section>

          {/* Location & Contact */}
          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Location & Contact</h2>
            <div className="space-y-4">
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

              <div>
                <label className={lbl}>Price (₹) — blank for free/negotiable</label>
                <input type="number" min={0} value={form.price} onChange={e => set("price", e.target.value)} className={inp} placeholder="e.g. 5000" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Phone</label>
                  <input type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>WhatsApp</label>
                  <input type="tel" value={form.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)} className={inp} />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <button type="button" onClick={() => set("showContactInfo", !form.showContactInfo)}
                  className={`relative w-10 h-6 rounded-full flex items-center transition-all shrink-0 mt-0.5 ${form.showContactInfo ? "bg-brand-green" : "bg-slate-300"}`}>
                  <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all ${form.showContactInfo ? "left-5" : "left-1"}`} />
                </button>
                <div>
                  <p className="text-sm font-medium text-slate-800">Show contact info publicly</p>
                  <p className="text-xs text-slate-500 mt-0.5">If off, buyers can only reach you via the enquiry form.</p>
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
