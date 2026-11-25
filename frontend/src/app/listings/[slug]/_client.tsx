"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HiArrowLeft, HiLocationMarker, HiPhone, HiCheckCircle, HiHeart,
  HiShare, HiMail,
} from "react-icons/hi";
import { FaWhatsapp, FaPaw } from "react-icons/fa";
import { MdPets } from "react-icons/md";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

interface Listing {
  _id: string; slug: string; title: string; petName?: string;
  petType?: { name: string }; breed?: { name: string };
  listingCategory?: { name: string }; age?: string; gender?: string;
  colour?: string; state?: string; city?: string;
  description?: string; healthInfo?: string;
  vaccinationStatus?: string; contactPhone?: string; whatsappNumber?: string;
  showContactInfo?: boolean; featuredListing: boolean; owner?: { name: string; city?: string; state?: string };
  createdAt: string;
}

const VACC_LABEL: Record<string, string> = {
  yes: "Vaccinated", partial: "Partially Vaccinated", no: "Not Vaccinated", unknown: "Unknown",
};

export default function ListingDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingFav, setSavingFav] = useState(false);

  const [enquiryName, setEnquiryName] = useState(session?.user?.name || "");
  const [enquiryEmail, setEnquiryEmail] = useState(session?.user?.email || "");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryMsg, setEnquiryMsg] = useState("");
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/listings/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) { setListing(d.listing); setImages(d.images || []); }
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!listing?._id || !session?.session?.token) return;
    fetch(`${API}/favourites/${listing._id}/check`, {
      headers: { Authorization: `Bearer ${session.session.token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setSaved(d.saved); })
      .catch(() => {});
  }, [listing?._id, session]);

  const toggleSave = async () => {
    if (!session?.user) { router.push("/login"); return; }
    if (!listing) return;
    setSavingFav(true);
    try {
      const res = await fetch(`${API}/favourites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.session?.token}` },
        credentials: "include",
        body: JSON.stringify({ listingId: listing._id }),
      });
      const d = await res.json();
      if (d.success) {
        setSaved(d.saved);
        toast.success(d.saved ? "Saved to favourites" : "Removed from favourites");
      }
    } catch { toast.error("Could not update favourites"); }
    finally { setSavingFav(false); }
  };

  const sendEnquiry = async (e: FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    setSendingEnquiry(true);
    try {
      const res = await fetch(`${API}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          listingId: listing._id, name: enquiryName, email: enquiryEmail,
          phone: enquiryPhone, message: enquiryMsg,
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Enquiry sent! The owner will get back to you.");
        setEnquiryMsg(""); setEnquiryPhone("");
      } else {
        toast.error(d.message || "Could not send enquiry.");
      }
    } catch { toast.error("Network error. Please try again."); }
    finally { setSendingEnquiry(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-green-soft">
        <FaPaw className="w-10 h-10 text-brand-green/30 animate-bounce" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-brand-green-soft">
        <MdPets className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Listing not found</h2>
        <p className="text-slate-500 text-sm">It may have been removed or is no longer available.</p>
        <Link href="/listings" className="px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid transition-colors">
          Browse all listings
        </Link>
      </div>
    );
  }

  const inp = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-sm transition-all";

  return (
    <div className="min-h-screen bg-brand-green-soft">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/listings" className="hover:text-brand-green flex items-center gap-1 transition-colors">
            <HiArrowLeft size={14} /> All Listings
          </Link>
          {listing.petType && (
            <>
              <span>/</span>
              <Link href={`/listings?petType=${listing.petType.name}`} className="hover:text-brand-green transition-colors">
                {listing.petType.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-700 truncate max-w-[200px]">{listing.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm">
              <div className="relative h-72 md:h-96 bg-brand-green-soft flex items-center justify-center">
                {images.length > 0 && images[activeImg]?.url ? (
                  <Image src={images[activeImg].url} alt={listing.title} fill className="object-cover" />
                ) : (
                  <FaPaw className="text-brand-green/20 w-24 h-24" />
                )}
                {listing.featuredListing && (
                  <span className="absolute top-3 left-3 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full">Featured</span>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={toggleSave} disabled={savingFav}
                    className={`w-9 h-9 rounded-full shadow flex items-center justify-center transition-all ${saved ? "bg-brand-red text-white" : "bg-white text-slate-400 hover:text-brand-red"}`}>
                    <HiHeart size={18} />
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                    className="w-9 h-9 bg-white rounded-full shadow flex items-center justify-center text-slate-400 hover:text-brand-green transition-colors">
                    <HiShare size={16} />
                  </button>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto border-t border-slate-100">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeImg === i ? "border-brand-green" : "border-transparent hover:border-slate-300"}`}>
                      <Image src={img.url} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">{listing.title}</h1>
                  {listing.petName && <p className="text-slate-500 text-sm mt-0.5">Pet name: <strong>{listing.petName}</strong></p>}
                </div>
                <div className="flex flex-wrap gap-1 justify-end shrink-0">
                  {listing.petType && <span className="text-xs bg-brand-green-soft text-brand-green font-medium px-2 py-1 rounded-full">{listing.petType.name}</span>}
                  {listing.listingCategory && <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2 py-1 rounded-full">{listing.listingCategory.name}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-5">
                <HiLocationMarker className="text-brand-green shrink-0" />
                <span>{[listing.city, listing.state].filter(Boolean).join(", ") || "India"}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Breed",       value: listing.breed?.name || "—" },
                  { label: "Age",         value: listing.age || "—" },
                  { label: "Gender",      value: listing.gender ? listing.gender.charAt(0).toUpperCase() + listing.gender.slice(1) : "—" },
                  { label: "Vaccination", value: VACC_LABEL[listing.vaccinationStatus || "unknown"] || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-brand-green-soft rounded-xl p-3 text-center">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{value}</p>
                  </div>
                ))}
              </div>

              {listing.colour && <p className="text-sm text-slate-600 mb-4"><span className="font-medium text-slate-700">Colour:</span> {listing.colour}</p>}

              {listing.description && (
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">About this pet</h2>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
                </div>
              )}

              {listing.healthInfo && (
                <div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Health Information</h2>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{listing.healthInfo}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">Contact the Owner</h2>
              {listing.owner && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-green-soft rounded-full flex items-center justify-center shrink-0">
                    <span className="text-brand-green font-bold text-sm">{listing.owner.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{listing.owner.name}</p>
                    <p className="text-slate-500 text-xs">{[listing.owner.city, listing.owner.state].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              )}
              {listing.showContactInfo ? (
                <div className="space-y-2">
                  {listing.contactPhone && (
                    <a href={`tel:${listing.contactPhone}`}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-brand-green-soft text-brand-green rounded-xl text-sm font-medium hover:bg-brand-green-muted transition-colors">
                      <HiPhone size={16} /> {listing.contactPhone}
                    </a>
                  )}
                  {listing.whatsappNumber && (
                    <a href={`https://wa.me/${listing.whatsappNumber.replace(/[^\d]/g, "")}?text=Hi! I'm interested in your listing: ${listing.title}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-4 py-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
                      <FaWhatsapp size={16} /> WhatsApp
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-2">Contact details shared via enquiry form below.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                <HiMail className="text-brand-green" /> Send Enquiry
              </h2>
              <p className="text-xs text-slate-500 mb-4">The owner will reply to your email directly.</p>
              <form onSubmit={sendEnquiry} className="space-y-3">
                <input type="text" value={enquiryName} onChange={e => setEnquiryName(e.target.value)} required placeholder="Your name" className={inp} />
                <input type="email" value={enquiryEmail} onChange={e => setEnquiryEmail(e.target.value)} required placeholder="Your email" className={inp} />
                <input type="tel" value={enquiryPhone} onChange={e => setEnquiryPhone(e.target.value)} placeholder="Phone (optional)" className={inp} />
                <textarea value={enquiryMsg} onChange={e => setEnquiryMsg(e.target.value)} required rows={4}
                  placeholder={`Hi, I'm interested in ${listing.petName || "this pet"}. Is it still available?`}
                  className={`${inp} resize-none`} />
                <button type="submit" disabled={sendingEnquiry}
                  className="w-full bg-brand-green hover:bg-brand-green-mid text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
                  {sendingEnquiry ? "Sending…" : "Send Enquiry"}
                </button>
              </form>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Safety Tips</h3>
              <ul className="space-y-1.5 text-xs text-amber-700">
                {["Never pay before seeing the pet in person","Meet in a safe, public place","Ask for vaccination records","Verify the owner's identity","Do not transfer money online"].map(tip => (
                  <li key={tip} className="flex items-start gap-1.5">
                    <HiCheckCircle className="shrink-0 mt-0.5 text-amber-500" size={13} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
