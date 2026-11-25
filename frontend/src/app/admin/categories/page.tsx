"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HiPlus, HiPencil, HiTrash, HiX, HiCheck } from "react-icons/hi";
import { FaTag } from "react-icons/fa";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

interface ListingCategory { _id: string; name: string; description?: string; }
interface ServiceCategory  { _id: string; name: string; description?: string; }

const inp = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-sm transition-all";

function Modal({ title, onClose, onSave, saving, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <HiX size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {saving ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</> : <><HiCheck size={14} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingCategoriesTab() {
  const [items, setItems] = useState<ListingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: ListingCategory } | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/listing-categories`);
      const d = await res.json();
      if (d.success) setItems(d.categories || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setForm({ name: "", description: "" }); setModal({ mode: "add" }); };
  const openEdit = (item: ListingCategory) => { setForm({ name: item.name, description: item.description || "" }); setModal({ mode: "edit", item }); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const isEdit = modal?.mode === "edit";
      const url = isEdit ? `${API}/admin/listing-categories/${modal!.item!._id}` : `${API}/admin/listing-categories`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) { toast.success(isEdit ? "Category updated" : "Category created"); setModal(null); fetchItems(); }
      else toast.error(d.message || "Failed to save");
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/admin/listing-categories/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) { toast.success("Deleted"); fetchItems(); }
      else toast.error(d.message || "Failed to delete");
    } catch { toast.error("Network error"); }
    finally { setDeletingId(null); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Listing Categories</h2>
          <p className="text-slate-500 text-sm mt-0.5">e.g. For Sale, For Adoption, Free to Good Home, Stud Service</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid shadow-sm transition-all">
          <HiPlus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16"><FaTag className="w-10 h-10 text-brand-green/20 mx-auto animate-pulse" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-brand-green-soft rounded-2xl">
          <FaTag className="w-12 h-12 text-brand-green/20 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No listing categories yet.</p>
          <button onClick={openAdd} className="px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid">
            Add First Category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{item.description || "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-brand-green-soft hover:text-brand-green transition-colors">
                        <HiPencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}
                        className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40">
                        <HiTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Listing Category" : "Edit Listing Category"}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="e.g. For Adoption" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp} placeholder="Optional short description" />
          </div>
        </Modal>
      )}
    </>
  );
}

function ServiceCategoriesTab() {
  const [items, setItems] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: ServiceCategory } | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/service-categories`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" });
      const d = await res.json();
      if (d.success) setItems(d.categories || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setForm({ name: "", description: "" }); setModal({ mode: "add" }); };
  const openEdit = (item: ServiceCategory) => { setForm({ name: item.name, description: item.description || "" }); setModal({ mode: "edit", item }); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const isEdit = modal?.mode === "edit";
      const url = isEdit ? `${API}/admin/service-categories/${modal!.item!._id}` : `${API}/admin/service-categories`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) { toast.success(isEdit ? "Category updated" : "Category created"); setModal(null); fetchItems(); }
      else toast.error(d.message || "Failed to save");
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/admin/service-categories/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) { toast.success("Deleted"); fetchItems(); }
      else toast.error(d.message || "Failed to delete");
    } catch { toast.error("Network error"); }
    finally { setDeletingId(null); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Service Categories</h2>
          <p className="text-slate-500 text-sm mt-0.5">e.g. Veterinary, Grooming, Training, Boarding</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid shadow-sm transition-all">
          <HiPlus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16"><FaTag className="w-10 h-10 text-brand-green/20 mx-auto animate-pulse" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-brand-green-soft rounded-2xl">
          <FaTag className="w-12 h-12 text-brand-green/20 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No service categories yet.</p>
          <button onClick={openAdd} className="px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid">
            Add First Category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{item.description || "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-brand-green-soft hover:text-brand-green transition-colors">
                        <HiPencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}
                        className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40">
                        <HiTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Service Category" : "Edit Service Category"}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="e.g. Veterinary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp} placeholder="Optional short description" />
          </div>
        </Modal>
      )}
    </>
  );
}

function CategoriesInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"listings" | "services">((searchParams.get("tab") as "listings" | "services") || "listings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-500 mt-1">Manage listing and service categories shown to users</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-200">
          {(["listings", "services"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3.5 text-sm font-medium capitalize transition-colors ${tab === t ? "text-brand-green border-b-2 border-brand-green" : "text-slate-500 hover:text-slate-800"}`}>
              {t === "listings" ? "Listing Categories" : "Service Categories"}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === "listings" && <ListingCategoriesTab />}
          {tab === "services" && <ServiceCategoriesTab />}
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense>
      <CategoriesInner />
    </Suspense>
  );
}
