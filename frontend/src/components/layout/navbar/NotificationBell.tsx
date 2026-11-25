"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HiBell, HiCheck } from "react-icons/hi";
import { useSession } from "@/lib/auth/client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

interface Notification {
  _id: string; title: string; message: string; type: string;
  read: boolean; createdAt: string; link?: string;
}

const TYPE_COLOR: Record<string, string> = {
  listing_approved: "bg-green-50 text-green-700",
  listing_rejected: "bg-red-50 text-red-700",
  enquiry: "bg-blue-50 text-blue-700",
  system: "bg-slate-50 text-slate-600",
};

export default function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getToken = () => {
    try { return session?.session?.token || localStorage.getItem("auth_token") || ""; } catch { return ""; }
  };

  const fetchNotifications = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    fetch(`${API}/notifications?limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setNotifications(d.notifications || []);
          setUnreadCount(d.unreadCount ?? (d.notifications || []).filter((n: Notification) => !n.read).length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [session, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const markRead = async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  if (!session?.user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Notifications">
        <HiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-red rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-brand-green hover:text-brand-green-mid font-medium">
                <HiCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-5 h-5 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <HiBell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id}
                  onClick={() => { if (!n.read) markRead(n._id); if (n.link) window.location.href = n.link; }}
                  className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? "bg-brand-green-soft/50" : ""}`}>
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-2 h-2 mt-1.5 bg-brand-green rounded-full shrink-0" />}
                    <div className={!n.read ? "" : "pl-4"}>
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 text-center">
            <button onClick={() => setOpen(false)} className="text-xs text-slate-500 hover:text-slate-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
