"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { HiArrowLeft, HiLocationMarker } from "react-icons/hi";
import { FaPhone, FaWhatsapp, FaBoxOpen, FaTag } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const CATEGORIES: Record<string, string> = {
  "pet-food": "Pet Food", "accessories": "Accessories", "cages-kennels": "Cages & Kennels",
  "grooming-tools": "Grooming Tools", "toys": "Toys & Play", "clothing": "Clothing",
  "health-medicine": "Health & Medicine", "aquarium": "Aquarium", "other": "Other",
};
const CONDITIONS: Record<string, string> = {
  "new": "New", "like-new": "Like New", "good": "Good Condition", "fair": "Fair Condition",
};
const COND_BADGE: Record<string, string> = {
  "new": "bg-green-100 text-green-700", "like-new": "bg-teal-100 text-teal-700",
  "good": "bg-amber-100 text-amber-700", "fair": "bg-slate-100 text-slate-600",
};

interface Product {
  _id: string; slug: string; title: string;
  category: string; condition: string;
  askingPrice?: number; negotiable?: boolean;
  description?: string;
  city?: string; state?: string;
  contactPhone?: string; whatsappNumber?: string; showContactInfo?: boolean;
  images: { url: string; publicId?: string }[];
  featuredProduct: boolean; status: string;
  owner?: { name: string; city?: string; state?: string; createdAt?: string };
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/products/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProduct(d.product); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-brand-green-soft flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-brand-green-soft flex flex-col items-center justify-center gap-4">
      <FaBoxOpen size={48} className="text-slate-200" />
      <p className="text-slate-500 font-medium">Product not found</p>
      <Link href="/products" className="px-6 py-2 bg-brand-green text-white rounded-xl text-sm">Back to Products</Link>
    </div>
  );

  const imgs = product.images || [];
  const loc = [product.city, product.state].filter(Boolean).join(", ") || "India";

  return (
    <div className="min-h-screen bg-brand-green-soft py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/products" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-green transition-colors">
            <HiArrowLeft size={18} />
          </Link>
          <nav className="text-sm text-slate-400">
            <Link href="/products" className="hover:text-brand-green">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700 font-medium truncate">{product.title}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Images */}
          <div className="lg:col-span-3 space-y-3">
            <div className="relative aspect-square bg-white rounded-2xl border border-green-100 overflow-hidden">
              {imgs.length > 0 ? (
                <Image src={imgs[activeImg].url} alt={product.title} fill className="object-contain p-2" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-200">
                  <FaBoxOpen size={48} />
                  <span className="text-sm">No photos</span>
                </div>
              )}
              {product.featuredProduct && (
                <span className="absolute top-3 left-3 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full">Featured</span>
              )}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? "border-brand-green" : "border-slate-200"}`}>
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-green-100 p-5">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-brand-green/10 text-brand-green text-xs font-semibold px-2.5 py-1 rounded-full">
                  {CATEGORIES[product.category] || product.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COND_BADGE[product.condition] || "bg-slate-100 text-slate-600"}`}>
                  {CONDITIONS[product.condition] || product.condition}
                </span>
              </div>

              <h1 className="text-xl font-bold text-slate-900 mb-2">{product.title}</h1>

              <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-4">
                <HiLocationMarker size={14} />
                <span>{loc}</span>
              </div>

              {product.askingPrice ? (
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-extrabold text-brand-green">₹{product.askingPrice.toLocaleString("en-IN")}</span>
                  {product.negotiable && <span className="text-sm text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Negotiable</span>}
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-4 text-slate-500">
                  <FaTag size={14} />
                  <span className="text-sm">Price on request</span>
                </div>
              )}

              {product.description && (
                <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">{product.description}</p>
              )}
            </div>

            {/* Contact */}
            {product.showContactInfo && (product.contactPhone || product.whatsappNumber) ? (
              <div className="bg-white rounded-2xl border border-green-100 p-5 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Seller</p>
                {product.owner && (
                  <p className="text-sm font-semibold text-slate-800">{product.owner.name}</p>
                )}
                {product.contactPhone && (
                  <a href={`tel:${product.contactPhone}`}
                    className="flex items-center gap-3 p-3 bg-brand-green-soft rounded-xl hover:bg-brand-green/10 transition-colors">
                    <FaPhone className="text-brand-green" size={16} />
                    <span className="text-sm font-medium text-slate-700">{product.contactPhone}</span>
                  </a>
                )}
                {product.whatsappNumber && (
                  <a href={`https://wa.me/${product.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <FaWhatsapp className="text-green-600" size={18} />
                    <span className="text-sm font-medium text-slate-700">WhatsApp</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-green-100 p-5 text-center">
                <p className="text-sm text-slate-400">Contact info hidden by seller</p>
              </div>
            )}

            {/* Seller info */}
            {product.owner && (
              <div className="bg-white rounded-2xl border border-green-100 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Listed by</p>
                <p className="text-sm font-semibold text-slate-700">{product.owner.name}</p>
                {product.owner.city && (
                  <p className="text-xs text-slate-400 mt-0.5">{[product.owner.city, product.owner.state].filter(Boolean).join(", ")}</p>
                )}
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">
              Listed {new Date(product.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
