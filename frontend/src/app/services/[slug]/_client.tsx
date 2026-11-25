"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiArrowLeft, HiLocationMarker, HiPhone, HiGlobe, HiClock } from "react-icons/hi";
import { FaWhatsapp, FaInstagram, FaFacebook, FaPaw } from "react-icons/fa";
import { MdPets } from "react-icons/md";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";


interface Service {
  _id: string; slug: string; businessName: string; category: string;
  description?: string; address?: string; state?: string; city?: string;
  phone?: string; whatsapp?: string; website?: string; timings?: string;
  socialLinks?: { instagram?: string; facebook?: string };
  featuredService: boolean;
  owner?: { name: string; city?: string; state?: string; verificationStatus?: string };
  createdAt: string;
}

export default function ServiceDetailClient({ slug }: { slug: string }) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/services/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setService(d.service); else setNotFound(true); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-green-soft">
      <FaPaw className="w-10 h-10 text-brand-green/30 animate-bounce" />
    </div>
  );

  if (notFound || !service) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-brand-green-soft">
      <MdPets className="w-16 h-16 text-slate-300" />
      <h2 className="text-xl font-bold text-slate-700">Service not found</h2>
      <Link href="/services" className="px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid transition-colors">
        Browse all services
      </Link>
    </div>
  );

  const catLabel = service.category || "Service";

  return (
    <div className="min-h-screen bg-brand-green-soft">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/services" className="hover:text-brand-green flex items-center gap-1 transition-colors">
            <HiArrowLeft size={14} /> All Services
          </Link>
          <span>/</span>
          <span className="text-slate-700">{service.businessName}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">{service.businessName}</h1>
                  <span className="inline-block text-xs font-semibold capitalize px-3 py-1 rounded-full bg-brand-green-soft text-brand-green">{catLabel}</span>
                </div>
                {service.featuredService && (
                  <span className="shrink-0 text-xs bg-brand-red text-white font-bold px-3 py-1 rounded-full">Featured</span>
                )}
              </div>

              {service.description && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About</h2>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{service.description}</p>
                </div>
              )}

              <div className="space-y-3">
                {(service.city || service.state || service.address) && (
                  <div className="flex items-start gap-3">
                    <HiLocationMarker className="text-brand-green mt-0.5 shrink-0" size={16} />
                    <div>
                      {service.address && <p className="text-sm text-slate-700">{service.address}</p>}
                      <p className="text-sm text-slate-500">{[service.city, service.state].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>
                )}
                {service.timings && (
                  <div className="flex items-center gap-3">
                    <HiClock className="text-brand-green shrink-0" size={16} />
                    <p className="text-sm text-slate-700">{service.timings}</p>
                  </div>
                )}
                {service.website && (
                  <div className="flex items-center gap-3">
                    <HiGlobe className="text-brand-green shrink-0" size={16} />
                    <a href={service.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-brand-green hover:underline truncate">{service.website}</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">Contact</h2>
              {service.phone && (
                <a href={`tel:${service.phone}`}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-brand-green-soft text-brand-green rounded-xl text-sm font-medium hover:bg-brand-green-muted transition-colors mb-2">
                  <HiPhone size={16} /> {service.phone}
                </a>
              )}
              {service.whatsapp && (
                <a href={`https://wa.me/${service.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors mb-2">
                  <FaWhatsapp size={16} /> WhatsApp
                </a>
              )}
              {(service.socialLinks?.instagram || service.socialLinks?.facebook) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  {service.socialLinks.instagram && (
                    <a href={service.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-pink-50 text-pink-700 rounded-xl text-xs font-medium hover:bg-pink-100 transition-colors">
                      <FaInstagram size={14} /> Instagram
                    </a>
                  )}
                  {service.socialLinks.facebook && (
                    <a href={service.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors">
                      <FaFacebook size={14} /> Facebook
                    </a>
                  )}
                </div>
              )}
            </div>

            {service.owner && (
              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                <h2 className="font-bold text-slate-800 mb-3">Listed by</h2>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-green-soft rounded-full flex items-center justify-center">
                    <span className="text-brand-green font-bold text-sm">{service.owner.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{service.owner.name}</p>
                    <p className="text-xs text-slate-400">{[service.owner.city, service.owner.state].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
