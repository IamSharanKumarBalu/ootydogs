"use client";

import { useState, useEffect } from "react";
import { HiCog, HiCheck } from "react-icons/hi";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

interface Settings {
  siteName: string; siteDescription: string; contactEmail: string; contactPhone: string;
  whatsappNumber: string; instagramHandle: string; facebookHandle: string;
  listingExpiryDays: number; maxImagesPerListing: number; maintenanceMode: boolean;
  requireVerificationToPost: boolean;
}

const DEFAULT: Settings = {
  siteName: "OotyDogs", siteDescription: "Find dogs & pets in Ooty and Nilgiris",
  contactEmail: "", contactPhone: "", whatsappNumber: "",
  instagramHandle: "", facebookHandle: "",
  listingExpiryDays: 30, maxImagesPerListing: 6,
  maintenanceMode: false, requireVerificationToPost: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success && d.settings) setSettings({ ...DEFAULT, ...d.settings }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings, value: string | number | boolean) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      const d = await res.json();
      if (d.success) toast.success("Settings saved");
      else toast.error(d.message || "Failed to save settings");
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <HiCog className="w-8 h-8 text-slate-200 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Platform configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid disabled:opacity-50 shadow-sm transition-all">
          <HiCheck size={16} /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Site Info */}
      <Section title="Site Information">
        <Field label="Site Name">
          <input value={settings.siteName} onChange={e => set("siteName", e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" placeholder="OotyDogs" />
        </Field>
        <Field label="Site Description">
          <textarea value={settings.siteDescription} onChange={e => set("siteDescription", e.target.value)}
            rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green resize-none" placeholder="Brief description for SEO" />
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Contact Details">
        <Field label="Contact Email">
          <input type="email" value={settings.contactEmail} onChange={e => set("contactEmail", e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" placeholder="admin@ootydogs.com" />
        </Field>
        <Field label="Contact Phone">
          <input value={settings.contactPhone} onChange={e => set("contactPhone", e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" placeholder="+91 XXXXX XXXXX" />
        </Field>
        <Field label="WhatsApp Number">
          <input value={settings.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" placeholder="+91 XXXXX XXXXX (with country code)" />
        </Field>
      </Section>

      {/* Social */}
      <Section title="Social Media">
        <Field label="Instagram Handle">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">@</span>
            <input value={settings.instagramHandle} onChange={e => set("instagramHandle", e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" placeholder="ootydogs" />
          </div>
        </Field>
        <Field label="Facebook Page">
          <input value={settings.facebookHandle} onChange={e => set("facebookHandle", e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" placeholder="OotyDogs" />
        </Field>
      </Section>

      {/* Listings */}
      <Section title="Listing Settings">
        <Field label="Listing Expiry (days)">
          <input type="number" min={7} max={180} value={settings.listingExpiryDays}
            onChange={e => set("listingExpiryDays", Number(e.target.value))}
            className="w-28 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" />
        </Field>
        <Field label="Max Images per Listing">
          <input type="number" min={1} max={20} value={settings.maxImagesPerListing}
            onChange={e => set("maxImagesPerListing", Number(e.target.value))}
            className="w-28 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" />
        </Field>
      </Section>

      {/* Platform */}
      <Section title="Platform Controls">
        <Toggle
          label="Require Verification to Post"
          description="Users must be verified before they can create listings"
          checked={settings.requireVerificationToPost}
          onChange={v => set("requireVerificationToPost", v)}
        />
        <Toggle
          label="Maintenance Mode"
          description="Show maintenance page to public visitors (admin can still access)"
          checked={settings.maintenanceMode}
          onChange={v => set("maintenanceMode", v)}
          danger
        />
      </Section>

      <div className="pt-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid disabled:opacity-50 shadow-sm transition-all">
          <HiCheck size={16} /> {saving ? "Saving…" : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange, danger }: {
  label: string; description: string; checked: boolean;
  onChange: (v: boolean) => void; danger?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <button onClick={() => onChange(!checked)}
        className={`relative mt-0.5 w-10 h-6 rounded-full flex items-center transition-all shrink-0 ${checked ? (danger ? "bg-red-500" : "bg-brand-green") : "bg-slate-200"}`}>
        <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-1"}`} />
      </button>
      <div>
        <p className={`text-sm font-medium ${danger && checked ? "text-red-700" : "text-slate-800"}`}>{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
