"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiArrowLeft, HiArrowRight, HiCheck, HiInformationCircle, HiX,
} from "react-icons/hi";
import { FaPaw, FaCamera } from "react-icons/fa";
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

const STEPS = ["Pet Details", "Location & Contact", "Review & Post"];

function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

const inp = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-sm transition-all";
const sel = `${inp} bg-white cursor-pointer`;
const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

export default function NewListingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState(0);
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<{ base64: string; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", petName: "", petType: "", breed: "", listingCategory: "",
    age: "", gender: "", colour: "", vaccinationStatus: "",
    description: "", healthInfo: "",
    state: "", city: "", price: "",
    contactPhone: "", whatsappNumber: "", showContactInfo: true,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/pet-types`).then(r => r.json()),
      fetch(`${API}/breeds?limit=200`).then(r => r.json()),
      fetch(`${API}/listing-categories`).then(r => r.json()),
    ]).then(([pt, br, cat]) => {
      if (pt.success) setPetTypes(pt.petTypes || []);
      if (br.success) setBreeds(br.breeds || []);
      if (cat.success) setCategories(cat.categories || []);
    }).catch(() => {});
  }, []);

  const filteredBreeds = form.petType
    ? breeds.filter(b => {
        const ptId = typeof b.petType === "string" ? b.petType : b.petType._id;
        return ptId === form.petType;
      })
    : breeds;

  const set = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Basic validation per step
  const canNext = () => {
    if (step === 0) return form.title.trim() && form.petType && form.gender;
    if (step === 1) return form.state.trim() && form.city.trim();
    return true;
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) { toast.error("Maximum 5 photos allowed"); return; }
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach(file => {
      if (file.size > 4 * 1024 * 1024) { toast.error(`${file.name} is too large (max 4 MB)`); return; }
      const reader = new FileReader();
      reader.onload = e => {
        const base64 = e.target?.result as string;
        setImages(prev => prev.length < 5 ? [...prev, { base64, preview: base64 }] : prev);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        images: images.map(img => ({ base64: img.base64 })),
      };
      const res = await fetch(`${API}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Listing posted! It will go live once approved.");
        router.push("/profile?tab=listings");
      } else if (d.message === "NO_PLAN") {
        toast.error("You need an active plan to post a listing.");
        router.push("/pricing");
      } else if (d.message === "LIMIT_REACHED") {
        toast.error("You've used all your listings. Upgrade your plan.");
        router.push("/pricing");
      } else {
        toast.error(d.message || "Failed to post listing");
      }
    } catch { toast.error("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  if (!mounted) return null;

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-brand-green-soft flex flex-col items-center justify-center gap-4 px-4">
        <FaPaw className="w-12 h-12 text-brand-green/30" />
        <h2 className="text-xl font-bold text-slate-700">Sign in to post a listing</h2>
        <Link href="/login" className="px-6 py-3 bg-brand-green text-white rounded-xl font-medium hover:bg-brand-green-mid transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-green-soft py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <Link href="/profile" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-green transition-colors">
            <HiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Post a Pet Listing</h1>
            <p className="text-slate-500 text-sm mt-0.5">Fill in the details — your listing is reviewed before going live</p>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i < step ? "bg-brand-green border-brand-green text-white" : i === step ? "border-brand-green text-brand-green bg-white" : "border-slate-200 text-slate-400 bg-white"}`}>
                  {i < step ? <HiCheck size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium mt-1 whitespace-nowrap ${i === step ? "text-brand-green" : "text-slate-400"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${i < step ? "bg-brand-green" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 md:p-8">
          {/* Step 0: Pet Details */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-800 mb-5">Pet Information</h2>

              <div>
                <label className={lbl}>Listing Title <span className="text-brand-red">*</span></label>
                <input value={form.title} onChange={e => set("title", e.target.value)} className={inp}
                  placeholder="e.g. Golden Retriever Puppy for Adoption" maxLength={100} />
                <p className="text-[11px] text-slate-400 mt-1">{form.title.length}/100 characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Pet Type <span className="text-brand-red">*</span></label>
                  <select value={form.petType} onChange={e => { set("petType", e.target.value); set("breed", ""); }} className={sel}>
                    <option value="">Select pet type</option>
                    {petTypes.map(pt => <option key={pt._id} value={pt._id}>{pt.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Breed</label>
                  <select value={form.breed} onChange={e => set("breed", e.target.value)} className={sel} disabled={!form.petType}>
                    <option value="">Select breed</option>
                    {filteredBreeds.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Gender <span className="text-brand-red">*</span></label>
                  <select value={form.gender} onChange={e => set("gender", e.target.value)} className={sel}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Category</label>
                  <select value={form.listingCategory} onChange={e => set("listingCategory", e.target.value)} className={sel}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
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
                  <label className={lbl}>Colour / Markings</label>
                  <input value={form.colour} onChange={e => set("colour", e.target.value)} className={inp} placeholder="e.g. Golden, White & Brown" />
                </div>
                <div>
                  <label className={lbl}>Vaccination Status</label>
                  <select value={form.vaccinationStatus} onChange={e => set("vaccinationStatus", e.target.value)} className={sel}>
                    <option value="">Select status</option>
                    <option value="yes">Fully Vaccinated</option>
                    <option value="partial">Partially Vaccinated</option>
                    <option value="no">Not Vaccinated</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4}
                  className={`${inp} resize-none`}
                  placeholder="Tell potential adopters about this pet — personality, habits, what they love…" />
              </div>

              <div>
                <label className={lbl}>Health Information</label>
                <textarea value={form.healthInfo} onChange={e => set("healthInfo", e.target.value)} rows={3}
                  className={`${inp} resize-none`}
                  placeholder="Dewormed, vet records, any medical history…" />
              </div>

              {/* Photo Upload */}
              <div>
                <label className={lbl}>Photos <span className="text-slate-400 normal-case font-normal">(up to 5, first is cover)</span></label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => handleImageFiles(e.target.files)}
                />
                <div className="flex flex-wrap gap-3 mt-1">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-green-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-brand-green text-white py-0.5">COVER</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <HiX size={10} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-brand-green hover:text-brand-green transition-colors">
                      <FaCamera size={18} />
                      <span className="text-[10px] font-medium">Add Photo</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">JPG, PNG or WEBP · Max 4 MB each</p>
              </div>
            </div>
          )}

          {/* Step 1: Location & Contact */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-800 mb-5">Location & Contact Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>State <span className="text-brand-red">*</span></label>
                  <select value={form.state} onChange={e => set("state", e.target.value)} className={sel}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>City <span className="text-brand-red">*</span></label>
                  <input value={form.city} onChange={e => set("city", e.target.value)} className={inp} placeholder="e.g. Ooty" />
                </div>
              </div>

              <div>
                <label className={lbl}>Price (₹) — leave blank if free/negotiable</label>
                <input type="number" min={0} value={form.price} onChange={e => set("price", e.target.value)}
                  className={inp} placeholder="e.g. 5000" />
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Contact Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Phone Number</label>
                    <input type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)}
                      className={inp} placeholder="+91 70945 08737" />
                  </div>
                  <div>
                    <label className={lbl}>WhatsApp Number</label>
                    <input type="tel" value={form.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)}
                      className={inp} placeholder="+91 70945 08737" />
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => set("showContactInfo", !form.showContactInfo)}
                    className={`relative w-10 h-6 rounded-full flex items-center transition-all shrink-0 mt-0.5 ${form.showContactInfo ? "bg-brand-green" : "bg-slate-300"}`}>
                    <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all ${form.showContactInfo ? "left-5" : "left-1"}`} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Show contact info publicly</p>
                    <p className="text-xs text-slate-500 mt-0.5">If off, buyers can only reach you via the enquiry form.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-800 mb-2">Review Your Listing</h2>
              <p className="text-sm text-slate-500 mb-5">Check everything before submitting. Your listing will be reviewed by our team before going live.</p>

              <div className="bg-brand-green-soft rounded-xl p-4 space-y-3 text-sm">
                <Row label="Title" value={form.title} />
                <Row label="Pet Type" value={petTypes.find(p => p._id === form.petType)?.name} />
                <Row label="Breed" value={breeds.find(b => b._id === form.breed)?.name || "Not specified"} />
                <Row label="Gender" value={form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : "Not specified"} />
                <Row label="Age" value={form.age || "Not specified"} />
                <Row label="Vaccination" value={form.vaccinationStatus || "Not specified"} />
                <Row label="Location" value={[form.city, form.state].filter(Boolean).join(", ") || "Not specified"} />
                <Row label="Price" value={form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "Free / Negotiable"} />
                <Row label="Contact visible" value={form.showContactInfo ? "Yes" : "Via enquiry form only"} />
                <Row label="Photos" value={images.length > 0 ? `${images.length} photo${images.length > 1 ? "s" : ""} selected` : "None (you can add later)"} />
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <HiInformationCircle className="shrink-0 mt-0.5 text-amber-500" size={16} />
                <p>Listings are reviewed within 24 hours. You&apos;ll be notified once your listing is approved or if any changes are needed.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition-all">
              <HiArrowLeft size={16} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid disabled:opacity-40 transition-all shadow-sm">
                Continue <HiArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !form.title || !form.petType}
                className="flex items-center gap-2 px-7 py-2.5 bg-brand-red text-white rounded-xl text-sm font-bold hover:bg-brand-red-light disabled:opacity-50 transition-all shadow-sm">
                <FaPaw size={14} /> {submitting ? "Posting…" : "Post Listing"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-800 font-medium text-right">{value || "—"}</span>
    </div>
  );
}
