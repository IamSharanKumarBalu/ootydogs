"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  HiUser, HiMail, HiPhone, HiPencil, HiCheckCircle, HiClock, HiExclamation,
  HiLocationMarker, HiTrash, HiEye, HiChat,
} from "react-icons/hi";
import { FaListAlt, FaHeart, FaPaw, FaStore, FaBoxOpen } from "react-icons/fa";
import { toast } from "sonner";
import LoadingButton from "@/components/ui/loadingButton";
import { clearSession, refreshSession } from "@/lib/auth/client";

interface User {
  _id: string; name: string; email: string; phone?: string; role: string;
  state?: string; city?: string; address?: string;
  verificationStatus: "pending" | "verified" | "rejected" | "suspended" | "blocked";
  verificationNote?: string; canPostListings: boolean;
}

interface Listing {
  _id: string; title: string; slug: string; status: string;
  petType?: { name: string }; breed?: { name: string };
  city?: string; state?: string; createdAt: string;
}

interface FavListing {
  _id: string; listing: { _id: string; title: string; slug: string; city?: string; state?: string; petType?: { name: string } };
}

interface MyService {
  _id: string; slug: string; businessName: string; category: string;
  status: string; city?: string; state?: string; createdAt: string;
}

interface MyProduct {
  _id: string; slug: string; title: string; category: string; condition: string;
  askingPrice?: number; status: string; city?: string; state?: string; createdAt: string;
  images: { url: string }[];
}

interface Enquiry {
  _id: string; name: string; message: string; phone?: string; email?: string;
  status: string; createdAt: string;
  listing?: { _id: string; title: string; slug: string };
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Puducherry",
];

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  draft: "bg-slate-100 text-slate-500",
  expired: "bg-orange-100 text-orange-600",
  unavailable: "bg-gray-100 text-gray-500",
};

const TABS = [
  { id: "profile",    label: "Profile",       icon: HiUser },
  { id: "listings",   label: "My Listings",   icon: FaListAlt },
  { id: "products",   label: "My Products",   icon: FaBoxOpen },
  { id: "services",   label: "My Services",   icon: FaStore },
  { id: "enquiries",  label: "Enquiries",     icon: HiChat },
  { id: "saved",      label: "Saved Pets",    icon: FaHeart },
] as const;
type Tab = typeof TABS[number]["id"];

function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

function ProfilePageInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "profile";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", state: "", city: "", address: "" });

  // Listings tab
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Products tab
  const [myProducts, setMyProducts] = useState<MyProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Services tab
  const [myServices, setMyServices] = useState<MyService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  // Enquiries tab
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

  // Saved tab
  const [savedPets, setSavedPets] = useState<FavListing[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    setLoading(true); setLoadError(null);
    try {
      const res = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
      });
      const data = await res.json();
      if (!data.success) { clearSession(); throw new Error(data.message || "Failed to load profile"); }
      const u = data.user as User;
      setUser(u);
      setFormData({ name: u.name, email: u.email, phone: u.phone || "", state: u.state || "", city: u.city || "", address: u.address || "" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load profile";
      setLoadError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const fetchMyListings = useCallback(() => {
    setListingsLoading(true);
    fetch(`${API}/my/listings`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setMyListings(d.listings || []); })
      .catch(() => {})
      .finally(() => setListingsLoading(false));
  }, []);

  const fetchMyProducts = useCallback(() => {
    setProductsLoading(true);
    fetch(`${API}/my/products`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setMyProducts(d.products || []); })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  const fetchMyServices = useCallback(() => {
    setServicesLoading(true);
    fetch(`${API}/my/services`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setMyServices(d.services || []); })
      .catch(() => {})
      .finally(() => setServicesLoading(false));
  }, []);

  const fetchEnquiries = useCallback(() => {
    setEnquiriesLoading(true);
    fetch(`${API}/my/enquiries`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setEnquiries(d.enquiries || []); })
      .catch(() => {})
      .finally(() => setEnquiriesLoading(false));
  }, []);

  const fetchSaved = useCallback(() => {
    setSavedLoading(true);
    fetch(`${API}/favourites`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setSavedPets(d.favourites || []); })
      .catch(() => {})
      .finally(() => setSavedLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "listings")  fetchMyListings();
    if (activeTab === "products")  fetchMyProducts();
    if (activeTab === "services")  fetchMyServices();
    if (activeTab === "enquiries") fetchEnquiries();
    if (activeTab === "saved")     fetchSaved();
  }, [activeTab, fetchMyListings, fetchMyProducts, fetchMyServices, fetchEnquiries, fetchSaved]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${API}/me/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated");
        setEditMode(false);
        fetchUserData();
        refreshSession();
      } else { toast.error(data.message || "Failed to update profile"); }
    } catch { toast.error("Failed to update profile"); }
    finally { setIsUpdating(false); }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/listings/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) { toast.success("Listing deleted"); fetchMyListings(); }
      else toast.error(d.message || "Failed to delete");
    } catch { toast.error("Network error"); }
    finally { setDeletingId(null); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeletingProductId(id);
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) { toast.success("Product deleted"); fetchMyProducts(); }
      else toast.error(d.message || "Failed to delete");
    } catch { toast.error("Network error"); }
    finally { setDeletingProductId(null); }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Delete this service listing? This cannot be undone.")) return;
    setDeletingServiceId(id);
    try {
      const res = await fetch(`${API}/services/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) { toast.success("Service deleted"); fetchMyServices(); }
      else toast.error(d.message || "Failed to delete");
    } catch { toast.error("Network error"); }
    finally { setDeletingServiceId(null); }
  };

  const handleUnsave = async (listingId: string) => {
    try {
      await fetch(`${API}/favourites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ listingId }),
      });
      setSavedPets(prev => prev.filter(f => f.listing._id !== listingId));
      toast.success("Removed from saved");
    } catch { toast.error("Could not unsave"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-green-soft">
        <div className="text-center">
          <FaPaw className="w-10 h-10 text-brand-green/40 mx-auto animate-bounce mb-4" />
          <p className="text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const isAuthError = /login|jwt|token|expired|unauthor/i.test(loadError || "");
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-brand-green-soft">
        <div className="text-center">
          <p className="text-red-600 mb-4">{isAuthError ? "Your session has expired. Please log in again." : loadError || "Failed to load profile"}</p>
          {isAuthError ? (
            <a href="/login" className="inline-block px-6 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green-mid transition-colors font-medium">Sign In</a>
          ) : (
            <button onClick={fetchUserData} className="px-6 py-3 border-2 border-brand-green text-brand-green rounded-xl hover:bg-brand-green-soft transition-colors font-medium">Retry</button>
          )}
        </div>
      </div>
    );
  }

  const VerificationBanner = () => {
    if (user.verificationStatus === "verified") return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
        <HiCheckCircle className="text-green-600 w-5 h-5 shrink-0" />
        <div><p className="text-sm font-semibold text-green-800">Account Verified</p><p className="text-xs text-green-600">You can post and manage pet listings.</p></div>
      </div>
    );
    if (user.verificationStatus === "rejected") return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
        <HiExclamation className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">Verification Rejected</p>
          {user.verificationNote && <p className="text-xs text-red-600 mt-0.5">{user.verificationNote}</p>}
          <p className="text-xs text-red-500 mt-1">Please contact support for assistance.</p>
        </div>
      </div>
    );
    if (user.verificationStatus === "suspended" || user.verificationStatus === "blocked") return (
      <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6">
        <HiExclamation className="text-orange-500 w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-orange-700 capitalize">Account {user.verificationStatus}</p>
          {user.verificationNote && <p className="text-xs text-orange-600 mt-0.5">{user.verificationNote}</p>}
        </div>
      </div>
    );
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <HiClock className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700">Verification Pending</p>
          <p className="text-xs text-amber-600 mt-0.5">Your account is awaiting admin verification. Once approved, you can post pet listings.</p>
        </div>
      </div>
    );
  };

  const inp = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green disabled:opacity-60 text-slate-800 text-sm transition-all";

  return (
    <div className="min-h-screen bg-brand-green-soft py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-900">My Account</h1>
          <p className="text-slate-500 mt-1">Manage your profile and pet listings</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 mb-6">
          <div className="flex border-b border-green-100 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === id ? "text-brand-green border-b-2 border-brand-green" : "text-slate-500 hover:text-slate-800"}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 md:p-8">
            <VerificationBanner />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
              <button onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-green-soft text-brand-green rounded-lg hover:bg-brand-green-muted transition-colors text-sm font-medium">
                <HiPencil className="w-4 h-4" /> {editMode ? "Cancel" : "Edit"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Full Name", icon: HiUser, key: "name", type: "text" },
                { label: "Email Address", icon: HiMail, key: "email", type: "email" },
                { label: "Mobile Number", icon: HiPhone, key: "phone", type: "tel", placeholder: "+91 70945 08737" },
                { label: "City", icon: HiLocationMarker, key: "city", type: "text", placeholder: "e.g. Ooty" },
              ].map(({ label, icon: Icon, key, type, placeholder }) => (
                <div key={key}>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </label>
                  <input type={type} value={formData[key as keyof typeof formData] as string}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    disabled={!editMode} className={inp} placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <HiLocationMarker className="w-3.5 h-3.5" /> State
                </label>
                <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} disabled={!editMode} className={inp}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Role</label>
                <input type="text" value={user.role} disabled className={`${inp} capitalize`} />
              </div>
            </div>
            {editMode && (
              <div className="mt-6 flex gap-3">
                <LoadingButton loading={isUpdating} onClick={handleUpdateProfile}
                  className="px-6 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green-mid transition-colors font-medium text-sm">
                  Save Changes
                </LoadingButton>
                <button onClick={() => setEditMode(false)} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm">Cancel</button>
              </div>
            )}
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-bold text-slate-900">My Listings</h2>
              {user.canPostListings ? (
                <Link href="/listings/new"
                  className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-xl text-sm font-semibold hover:bg-brand-red-light transition-colors shadow-sm">
                  <FaPaw size={12} /> + Post New Listing
                </Link>
              ) : null}
            </div>

            {!user.canPostListings ? (
              <div className="bg-white rounded-2xl border border-green-100 p-8 text-center shadow-sm">
                <HiClock className="w-14 h-14 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Verification Required</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">Your account needs admin verification before you can post listings. We&apos;ll notify you once approved.</p>
              </div>
            ) : listingsLoading ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <FaPaw className="w-8 h-8 text-brand-green/30 mx-auto animate-bounce" />
              </div>
            ) : myListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <FaListAlt className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No listings yet</h3>
                <p className="text-slate-500 text-sm mb-6">Start by posting your first pet listing.</p>
                <Link href="/listings/new" className="inline-block px-6 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green-mid transition-colors font-medium text-sm">
                  Post Your First Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map(l => (
                  <div key={l._id} className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm flex items-center gap-4 flex-wrap">
                    <div className="w-12 h-12 bg-brand-green-soft rounded-xl flex items-center justify-center shrink-0">
                      <FaPaw className="text-brand-green w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{l.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {l.petType && <span className="text-[11px] text-slate-500">{l.petType.name}</span>}
                        {l.city && <span className="text-[11px] text-slate-400">· {[l.city, l.state].filter(Boolean).join(", ")}</span>}
                        <span className="text-[11px] text-slate-400">· {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[l.status] || "bg-slate-100 text-slate-600"}`}>{l.status}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/listings/${l.slug}`} target="_blank"
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-brand-green-soft hover:text-brand-green transition-colors" title="View">
                        <HiEye size={16} />
                      </Link>
                      <Link href={`/listings/${l.slug}/edit`}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-brand-green-soft hover:text-brand-green transition-colors" title="Edit">
                        <HiPencil size={16} />
                      </Link>
                      <button onClick={() => handleDeleteListing(l._id)} disabled={deletingId === l._id}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-brand-red transition-colors disabled:opacity-50" title="Delete">
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-bold text-slate-900">My Products</h2>
              <Link href="/products/new"
                className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-xl text-sm font-semibold hover:bg-brand-red-light transition-colors shadow-sm">
                <FaBoxOpen size={12} /> + List a Product
              </Link>
            </div>

            {productsLoading ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <FaPaw className="w-8 h-8 text-brand-green/30 mx-auto animate-bounce" />
              </div>
            ) : myProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <FaBoxOpen className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No products listed yet</h3>
                <p className="text-slate-500 text-sm mb-6">List pet food, accessories, toys and more.</p>
                <Link href="/products/new" className="inline-block px-6 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green-mid transition-colors font-medium text-sm">
                  List Your First Product
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myProducts.map(p => (
                  <div key={p._id} className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm flex items-center gap-4 flex-wrap">
                    <div className="w-12 h-12 bg-brand-green-soft rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                      {p.images?.[0]?.url
                        ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover rounded-xl" />
                        : <FaBoxOpen className="text-brand-green w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{p.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-slate-500 capitalize">{p.category?.replace("-", " ")}</span>
                        <span className="text-[11px] text-slate-400 capitalize">· {p.condition?.replace("-", " ")}</span>
                        {p.askingPrice && <span className="text-[11px] font-semibold text-brand-green">· ₹{p.askingPrice.toLocaleString("en-IN")}</span>}
                        {p.city && <span className="text-[11px] text-slate-400">· {[p.city, p.state].filter(Boolean).join(", ")}</span>}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status] || "bg-slate-100 text-slate-600"}`}>{p.status}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/products/${p.slug}`} target="_blank"
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-brand-green-soft hover:text-brand-green transition-colors" title="View">
                        <HiEye size={16} />
                      </Link>
                      <button onClick={() => handleDeleteProduct(p._id)} disabled={deletingProductId === p._id}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-brand-red transition-colors disabled:opacity-50" title="Delete">
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-bold text-slate-900">My Services</h2>
              <Link href="/services/new"
                className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-xl text-sm font-semibold hover:bg-brand-red-light transition-colors shadow-sm">
                <FaStore size={12} /> + List a Service
              </Link>
            </div>

            {servicesLoading ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <FaPaw className="w-8 h-8 text-brand-green/30 mx-auto animate-bounce" />
              </div>
            ) : myServices.length === 0 ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <FaStore className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No services listed yet</h3>
                <p className="text-slate-500 text-sm mb-6">List your pet business to reach thousands of pet owners.</p>
                <Link href="/services/new" className="inline-block px-6 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green-mid transition-colors font-medium text-sm">
                  List Your First Service
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myServices.map(s => (
                  <div key={s._id} className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm flex items-center gap-4 flex-wrap">
                    <div className="w-12 h-12 bg-brand-green-soft rounded-xl flex items-center justify-center shrink-0">
                      <FaStore className="text-brand-green w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{s.businessName}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-slate-500">{s.category}</span>
                        {s.city && <span className="text-[11px] text-slate-400">· {[s.city, s.state].filter(Boolean).join(", ")}</span>}
                        <span className="text-[11px] text-slate-400">· {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[s.status] || "bg-slate-100 text-slate-600"}`}>{s.status}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/services/${s.slug}`} target="_blank"
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-brand-green-soft hover:text-brand-green transition-colors" title="View">
                        <HiEye size={16} />
                      </Link>
                      <Link href={`/services/${s.slug}/edit`}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-brand-green-soft hover:text-brand-green transition-colors" title="Edit">
                        <HiPencil size={16} />
                      </Link>
                      <button onClick={() => handleDeleteService(s._id)} disabled={deletingServiceId === s._id}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-brand-red transition-colors disabled:opacity-50" title="Delete">
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Enquiries Tab */}
        {activeTab === "enquiries" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Enquiries Received</h2>
            {enquiriesLoading ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <FaPaw className="w-8 h-8 text-brand-green/30 mx-auto animate-bounce" />
              </div>
            ) : enquiries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <HiChat className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No enquiries yet</h3>
                <p className="text-slate-500 text-sm">When buyers message you about your listings, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map(e => (
                  <div key={e._id} className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div>
                        <p className="font-semibold text-slate-800">{e.name}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                          {e.email && <span>{e.email}</span>}
                          {e.phone && <span>· {e.phone}</span>}
                          <span>· {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[e.status] || "bg-slate-100 text-slate-600"}`}>{e.status}</span>
                    </div>
                    {e.listing && (
                      <p className="text-xs text-brand-green font-medium mb-2">
                        Re: <Link href={`/listings/${e.listing.slug}`} target="_blank" className="underline underline-offset-2 hover:text-brand-green-mid">{e.listing.title}</Link>
                      </p>
                    )}
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2.5 leading-relaxed">{e.message}</p>
                    {e.phone && (
                      <div className="mt-3 flex items-center gap-2">
                        <a href={`tel:${e.phone}`}
                          className="text-xs font-medium px-3 py-1.5 bg-brand-green-soft text-brand-green rounded-lg hover:bg-brand-green-muted transition-colors">
                          Call {e.name.split(" ")[0]}
                        </a>
                        <a href={`https://wa.me/${e.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-medium px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Pets Tab */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Saved Pets</h2>
            {savedLoading ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <FaPaw className="w-8 h-8 text-brand-green/30 mx-auto animate-bounce" />
              </div>
            ) : savedPets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-green-100 p-10 text-center shadow-sm">
                <FaHeart className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No saved pets yet</h3>
                <p className="text-slate-500 text-sm mb-6">Heart a listing to save it here for later.</p>
                <Link href="/listings" className="inline-block px-6 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green-mid transition-colors font-medium text-sm">
                  Browse Listings
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPets.map(f => (
                  <div key={f._id} className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm flex items-center gap-4 flex-wrap">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                      <FaHeart className="text-brand-red w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{f.listing.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {f.listing.petType && <span className="text-[11px] text-slate-500">{f.listing.petType.name}</span>}
                        {f.listing.city && <span className="text-[11px] text-slate-400">· {[f.listing.city, f.listing.state].filter(Boolean).join(", ")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/listings/${f.listing.slug}`}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-brand-green-soft hover:text-brand-green transition-colors" title="View listing">
                        <HiEye size={16} />
                      </Link>
                      <button onClick={() => handleUnsave(f.listing._id)}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-brand-red transition-colors" title="Remove from saved">
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfilePageInner />
    </Suspense>
  );
}
