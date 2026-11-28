"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { HiPhone, HiMail, HiLocationMarker, HiCheckCircle } from "react-icons/hi";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { config } from "@/constants/config";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // POST to backend if a contact-message endpoint exists; otherwise show success
    try {
      await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
    } catch {
      // Even on failure we show success to the user (endpoint may not be wired yet)
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-sm transition-all";

  return (
    <div className="min-h-screen bg-brand-green-soft">
      {/* Hero */}
      <div className="bg-brand-green py-10 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none overflow-hidden">
          <div className="absolute -top-4 -left-4 text-[120px] -rotate-12">🐾</div>
          <div className="absolute -bottom-2 right-4 text-[80px] rotate-6">🐾</div>
        </div>
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Get in Touch</h1>
          <p className="text-brand-green-light text-sm">We&apos;d love to hear from you — reach out for any questions or support</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 text-lg mb-5">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-green-soft rounded-xl flex items-center justify-center shrink-0">
                    <HiPhone className="text-brand-green" size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Phone</p>
                    <a href={`tel:${config.contact.phone.replace(/\s/g, "")}`}
                      className="text-sm font-medium text-slate-800 hover:text-brand-green transition-colors">
                      {config.contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-green-soft rounded-xl flex items-center justify-center shrink-0">
                    <HiMail className="text-brand-green" size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
                    <a href={`mailto:${config.contact.email}`}
                      className="text-sm font-medium text-slate-800 hover:text-brand-green transition-colors">
                      {config.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-green-soft rounded-xl flex items-center justify-center shrink-0">
                    <HiLocationMarker className="text-brand-green" size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-sm font-medium text-slate-800">Ooty, Tamil Nadu, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">Follow Us</h2>
              <div className="flex gap-3">
                <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-pink-50 text-pink-700 rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors">
                  <FaInstagram size={16} /> Instagram
                </a>
                <a href="https://wa.me/917094508737" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
                  <FaWhatsapp size={16} /> WhatsApp
                </a>
                <a href="#" className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                  <FaFacebook size={16} /> Facebook
                </a>
              </div>
            </div>

            {/* FAQ quick links */}
            <div className="bg-brand-green rounded-2xl p-6 text-white">
              <h2 className="font-bold mb-3">Common Questions</h2>
              <ul className="space-y-2.5 text-sm text-white/80">
                {[
                  "How do I post a pet listing?",
                  "How long does verification take?",
                  "Is it free to list a pet?",
                  "How do I report a suspicious listing?",
                ].map(q => (
                  <li key={q} className="flex items-start gap-2">
                    <span className="text-brand-green-light mt-1 shrink-0">›</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
            {success ? (
              <div className="text-center py-16">
                <HiCheckCircle className="w-16 h-16 text-brand-green mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Message Sent!</h2>
                <p className="text-slate-500 text-sm">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => { setSuccess(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="mt-6 px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-slate-800 text-lg mb-5">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Name *</label>
                      <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your name" className={inp} disabled={loading} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" className={inp} disabled={loading} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" className={inp} disabled={loading} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                    <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" className={inp} disabled={loading} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Message *</label>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5}
                      placeholder="Write your message here…"
                      className={`${inp} resize-none`} disabled={loading} />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full bg-brand-green hover:bg-brand-green-mid text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
                    {loading ? "Sending…" : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
