"use client";

import { useState, useEffect, useCallback } from "react";
import { HiPlus, HiPencil, HiTrash, HiX, HiCheck } from "react-icons/hi";
import { FaDog } from "react-icons/fa";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
function getToken() { try { return localStorage.getItem("auth_token") || ""; } catch { return ""; } }

interface PetType { _id: string; name: string; slug: string; }
interface Breed { _id: string; name: string; slug: string; petType: { _id: string; name: string } | string; }

export default function AdminBreedsPage() {
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"breeds" | "petTypes">("breeds");

  // Breed form state
  const [breedModal, setBreedModal] = useState<{ mode: "add" | "edit"; breed?: Breed } | null>(null);
  const [breedName, setBreedName] = useState("");
  const [breedPetType, setBreedPetType] = useState("");
  const [breedSaving, setBreedSaving] = useState(false);

  // Pet type form state
  const [ptModal, setPtModal] = useState<{ mode: "add" | "edit"; pt?: PetType } | null>(null);
  const [ptName, setPtName] = useState("");
  const [ptSaving, setPtSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "breed" | "petType"; id: string; name: string } | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/pet-types`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" }).then(r => r.json()),
      fetch(`${API}/breeds?limit=200`, { headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" }).then(r => r.json()),
    ]).then(([pt, br]) => {
      if (pt.success) setPetTypes(pt.petTypes || []);
      if (br.success) setBreeds(br.breeds || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ---- Breed CRUD ----
  const openBreedAdd = () => { setBreedModal({ mode: "add" }); setBreedName(""); setBreedPetType(petTypes[0]?._id || ""); };
  const openBreedEdit = (b: Breed) => { setBreedModal({ mode: "edit", breed: b }); setBreedName(b.name); setBreedPetType(typeof b.petType === "string" ? b.petType : b.petType._id); };

  const saveBreed = async () => {
    if (!breedName.trim() || !breedPetType) { toast.error("Name and pet type required"); return; }
    setBreedSaving(true);
    try {
      const isEdit = breedModal?.mode === "edit";
      const url = isEdit ? `${API}/admin/breeds/${breedModal!.breed!._id}` : `${API}/admin/breeds`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ name: breedName.trim(), petType: breedPetType }),
      });
      const d = await res.json();
      if (d.success) { toast.success(isEdit ? "Breed updated" : "Breed added"); setBreedModal(null); fetchData(); }
      else toast.error(d.message || "Failed");
    } catch { toast.error("Network error"); }
    finally { setBreedSaving(false); }
  };

  // ---- PetType CRUD ----
  const openPtAdd = () => { setPtModal({ mode: "add" }); setPtName(""); };
  const openPtEdit = (pt: PetType) => { setPtModal({ mode: "edit", pt }); setPtName(pt.name); };

  const savePetType = async () => {
    if (!ptName.trim()) { toast.error("Name required"); return; }
    setPtSaving(true);
    try {
      const isEdit = ptModal?.mode === "edit";
      const url = isEdit ? `${API}/admin/pet-types/${ptModal!.pt!._id}` : `${API}/admin/pet-types`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ name: ptName.trim() }),
      });
      const d = await res.json();
      if (d.success) { toast.success(isEdit ? "Pet type updated" : "Pet type added"); setPtModal(null); fetchData(); }
      else toast.error(d.message || "Failed");
    } catch { toast.error("Network error"); }
    finally { setPtSaving(false); }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    try {
      const url = type === "breed" ? `${API}/admin/breeds/${id}` : `${API}/admin/pet-types/${id}`;
      const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` }, credentials: "include" });
      const d = await res.json();
      if (d.success) { toast.success(`${type === "breed" ? "Breed" : "Pet type"} deleted`); setDeleteConfirm(null); fetchData(); }
      else toast.error(d.message || "Failed");
    } catch { toast.error("Network error"); }
  };

  const breedsByType = breeds.reduce<Record<string, Breed[]>>((acc, b) => {
    const ptId = typeof b.petType === "string" ? b.petType : b.petType._id;
    if (!acc[ptId]) acc[ptId] = [];
    acc[ptId].push(b);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-20"><FaDog className="w-8 h-8 text-slate-200 animate-bounce" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Breeds & Pet Types</h1>
          <p className="text-slate-500 text-sm mt-0.5">{breeds.length} breeds · {petTypes.length} pet types</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "breeds" ? (
            <button onClick={openBreedAdd} className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid shadow-sm"><HiPlus size={16} /> Add Breed</button>
          ) : (
            <button onClick={openPtAdd} className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid shadow-sm"><HiPlus size={16} /> Add Pet Type</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["breeds", "petTypes"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "breeds" ? "Breeds" : "Pet Types"}
          </button>
        ))}
      </div>

      {activeTab === "breeds" && (
        <div className="space-y-4">
          {petTypes.map(pt => (
            <div key={pt._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700">{pt.name} <span className="text-slate-400 font-normal text-xs">({(breedsByType[pt._id] || []).length} breeds)</span></h2>
              </div>
              <div className="p-4">
                {(breedsByType[pt._id] || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No breeds yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(breedsByType[pt._id] || []).map(b => (
                      <div key={b._id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 group">
                        <span className="text-sm text-slate-700">{b.name}</span>
                        <button onClick={() => openBreedEdit(b)} className="text-slate-300 hover:text-brand-green transition-colors"><HiPencil size={12} /></button>
                        <button onClick={() => setDeleteConfirm({ type: "breed", id: b._id, name: b.name })} className="text-slate-300 hover:text-red-500 transition-colors"><HiTrash size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "petTypes" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Name", "Slug", "Breeds", "Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {petTypes.map(pt => (
                <tr key={pt._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{pt.name}</td>
                  <td className="py-3 px-4 text-xs text-slate-500 font-mono">{pt.slug}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">{(breedsByType[pt._id] || []).length}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openPtEdit(pt)} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-brand-green-soft hover:text-brand-green transition-colors"><HiPencil size={14} /></button>
                      <button onClick={() => setDeleteConfirm({ type: "petType", id: pt._id, name: pt.name })} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"><HiTrash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Breed modal */}
      {breedModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">{breedModal.mode === "add" ? "Add Breed" : "Edit Breed"}</h2>
              <button onClick={() => setBreedModal(null)} className="text-slate-400 hover:text-slate-600"><HiX size={18} /></button>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Breed Name</label>
                <input value={breedName} onChange={e => setBreedName(e.target.value)} autoFocus
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" placeholder="e.g. Golden Retriever" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Pet Type</label>
                <select value={breedPetType} onChange={e => setBreedPetType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green bg-white">
                  {petTypes.map(pt => <option key={pt._id} value={pt._id}>{pt.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBreedModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={saveBreed} disabled={breedSaving} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid disabled:opacity-50">
                <HiCheck size={15} /> {breedSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pet type modal */}
      {ptModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">{ptModal.mode === "add" ? "Add Pet Type" : "Edit Pet Type"}</h2>
              <button onClick={() => setPtModal(null)} className="text-slate-400 hover:text-slate-600"><HiX size={18} /></button>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Pet Type Name</label>
              <input value={ptName} onChange={e => setPtName(e.target.value)} autoFocus
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-green" placeholder="e.g. Dog, Cat, Bird" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPtModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={savePetType} disabled={ptSaving} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-mid disabled:opacity-50">
                <HiCheck size={15} /> {ptSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="font-bold text-slate-800 mb-1">Delete {deleteConfirm.type === "breed" ? "Breed" : "Pet Type"}?</h2>
            <p className="text-sm text-slate-500 mb-5">
              <strong>"{deleteConfirm.name}"</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
