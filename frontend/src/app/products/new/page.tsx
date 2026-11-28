"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiArrowRight, HiCheck, HiX } from "react-icons/hi";
import { FaBoxOpen, FaCamera } from "react-icons/fa";
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

const CATEGORIES = [
  { value: "pet-food",        label: "Pet Food & Treats" },
  { value: "accessories",     label: "Accessories & Gear" },
  { value: "cages-kennels",   label: "Cages & Kennels" },
  { value: "grooming-tools",  label: "Grooming Tools" },
  { value: "toys",            label: "Toys & Play" },
  { value: "clothing",        label: "Clothing & Costumes" },
  { value: "health-medicine", label: "Health & Medicine" },
  { value: "aquarium",        label: "Aquarium & Fish" },
  { value: "other",           label: "Other" },
];

const CONDITIONS = [
  { value: "new",      label: "New (unused)" },
  { value: "like-new", label: "Like New" },
  { value: "good",     label: "Good Condition" },
  { value: "fair",     label: "Fair Condition" },
];

const STEPS = ["Product Details", "Location & Contact", "Review & Post"];
const inp = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-sm transition-all";
const sel = `${inp} cursor-pointer`;
const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

export default function NewProductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<{ base64: string; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", category: "", condition: "new",
    askingPrice: "", negotiable: false,
    description: "",
    state: "", city: "",
    contactPhone: "", whatsappNumber: "", showContactInfo: true,
  });

  useEffect(() => { setMounted(true); }, []);

  const set = (key: string, value: string | boolean) => setForm(prev => ({ ...prev, [key]: value }));

  const canNext = () => {
    if (step === 0) return form.title.trim() && form.category;
    if (step === 1) return form.state.trim() && form.city.trim();
    return true;
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) { toast.error("Maximum 5 photos"); return; }
    Array.from(files).slice(0, remaining).forEach(file => {
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
        askingPrice: form.askingPrice ? Number(form.askingPrice) : undefined,
        images: images.map(img => ({ base64: img.base64 })),
      };
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Product listed! It will go live once approved.");
        router.push("/profile?tab=products");
      } else if (d.message === "NO_PLAN") {
        toast.error("You need an active plan to list a product.");
        router.push("/pricing");
      } else if (d.message === "LIMIT_REACHED") {
        toast.error("You've used all your listing slots. Upgrade your plan.");
        router.push("/pricing");
      } else {
        toast.error(d.message || "Failed to post product");
      }
    } catch { toast.error("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  if (!mounted) return null;

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-brand-green-soft flex flex-col items-center justify-center gap-4 px-4">
        <FaBoxOpen className="w-12 h-12 text-brand-green/30" />
        <h2 className="text-xl font-bold text-slate-700">Sign in to list a product</h2>
        <Link href="/login" className="px-6 py-3 bg-brand-green text-white rounded-xl font-medium hover:bg-brand-green-mid transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-green-soft py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-7">
          <Link href="/products" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-green transition-colors">
            <HiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">List a Product</h1>
            <p className="text-slate-500 text-sm mt-0.5">Fill in the details — your product is reviewed before going live</p>
          </div>
        </div>

        {/* Steps */}
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
          {/* Step 0: Product Details */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-800 mb-5">Product Information</h2>

              <div>
                <label className={lbl}>Title <span className="text-brand-red">*</span></label>
                <input value={form.title} onChange={e => set("title", e.target.value)}
                  className={inp} placeholder="e.g. Dog Food – Royal Canin 10kg (Sealed)" maxLength={100} />
                <p className="text-[11px] text-slate-400 mt-1">{form.title.length}/100</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Category <span className="text-brand-red">*</span></label>
                  <select value={form.category} onChange={e => set("category", e.target.value)} className={sel}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Condition</label>
                  <select value={form.condition} onChange={e => set("condition", e.target.value)} className={sel}>
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Asking Price (₹)</label>
                  <input type="number" value={form.askingPrice} onChange={e => set("askingPrice", e.target.value)}
                    className={inp} placeholder="Leave blank if N/A" min={0} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.negotiable} onChange={e => set("negotiable", e.target.checked)}
                      className="w-4 h-4 accent-brand-green" />
                    <span className="text-sm text-slate-700 font-medium">Price is negotiable</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={lbl}>Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)}
                  className={`${inp} resize-none`} rows={4}
                  placeholder="Describe the product — brand, quantity, reason for selling, etc." maxLength={1000} />
              </div>

              {/* Photos */}
              <div>
                <label className={lbl}>Photos (up to 5)</label>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <HiX className="text-white" size={18} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-green flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-brand-green transition-colors">
                      <FaCamera size={18} />
                      <span className="text-[10px]">Add</span>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => handleImageFiles(e.target.files)} />
              </div>
            </div>
          )}

          {/* Step 1: Location & Contact */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-800 mb-5">Location & Contact</h2>

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
                  <input value={form.city} onChange={e => set("city", e.target.value)}
                    className={inp} placeholder="e.g. Chennai" />
                </div>
              </div>

              <div>
                <label className={lbl}>Phone Number</label>
                <input type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)}
                  className={inp} placeholder="+91 70945 08737" />
              </div>

              <div>
                <label className={lbl}>WhatsApp Number</label>
                <input type="tel" value={form.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)}
                  className={inp} placeholder="Same as phone or different" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-brand-green transition-colors">
                <input type="checkbox" checked={form.showContactInfo} onChange={e => set("showContactInfo", e.target.checked)}
                  className="w-4 h-4 accent-brand-green" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Show contact info publicly</p>
                  <p className="text-xs text-slate-400">Buyers can see your phone number on the listing</p>
                </div>
              </label>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-800 mb-5">Review Your Listing</h2>
              <div className="bg-brand-green-soft rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Title</span><span className="font-medium text-slate-800 text-right max-w-[55%] truncate">{form.title}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="font-medium text-slate-800">{CATEGORIES.find(c => c.value === form.category)?.label}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Condition</span><span className="font-medium text-slate-800">{CONDITIONS.find(c => c.value === form.condition)?.label}</span></div>
                {form.askingPrice && <div className="flex justify-between"><span className="text-slate-500">Price</span><span className="font-medium text-slate-800">₹{Number(form.askingPrice).toLocaleString("en-IN")}{form.negotiable ? " (Negotiable)" : ""}</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-medium text-slate-800">{form.city}, {form.state}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Photos</span><span className="font-medium text-slate-800">{images.length} photo{images.length !== 1 ? "s" : ""}</span></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                Your listing will be reviewed by our team before going live. This usually takes a few hours.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:border-slate-300 disabled:opacity-40 transition-colors">
              <HiArrowLeft size={15} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid disabled:opacity-40 transition-colors">
                Continue <HiArrowRight size={15} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid disabled:opacity-60 transition-colors">
                {submitting ? "Posting…" : "Post Product"} {!submitting && <HiCheck size={15} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
