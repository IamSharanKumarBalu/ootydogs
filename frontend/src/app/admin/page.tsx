export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  HiUsers, HiClipboardList, HiCollection, HiFlag, HiMail,
  HiArrowRight, HiClock, HiCheckCircle, HiExclamation,
} from "react-icons/hi";
import { MdPets } from "react-icons/md";
import { getAdminDashboardStats } from "./actions";

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  const cards = [
    {
      title: "Total Users",
      value: stats?.users?.total ?? "—",
      sub: stats?.users?.pendingVerifications ? `${stats.users.pendingVerifications} pending verification` : "All verified",
      icon: HiUsers, color: "bg-blue-500", href: "/admin/users",
    },
    {
      title: "Total Listings",
      value: stats?.listings?.total ?? "—",
      sub: stats?.listings?.pending ? `${stats.listings.pending} awaiting approval` : "All clear",
      icon: HiClipboardList, color: "bg-brand-green", href: "/admin/listings",
    },
    {
      title: "Approved Listings",
      value: stats?.listings?.approved ?? "—",
      sub: "Live on site",
      icon: HiCheckCircle, color: "bg-emerald-500", href: "/admin/listings",
    },
    {
      title: "Pet Services",
      value: stats?.services?.total ?? "—",
      sub: stats?.services?.pending ? `${stats.services.pending} awaiting approval` : "All clear",
      icon: MdPets, color: "bg-purple-500", href: "/admin/services",
    },
    {
      title: "Unread Enquiries",
      value: stats?.enquiries?.unread ?? "—",
      sub: "New messages",
      icon: HiMail, color: "bg-amber-500", href: "/admin/listings",
    },
    {
      title: "Open Reports",
      value: stats?.reports?.open ?? "—",
      sub: "Need review",
      icon: HiFlag, color: "bg-red-500", href: "/admin/reports",
    },
  ];

  const actionItems = [
    { title: "Review Listings",   desc: "Approve or reject pending listings", href: "/admin/listings?status=pending", color: "hover:border-brand-green", iconColor: "bg-brand-green-soft text-brand-green", icon: HiClipboardList },
    { title: "Verify Users",      desc: "Approve user verification requests",  href: "/admin/users?verificationStatus=pending", color: "hover:border-blue-300", iconColor: "bg-blue-50 text-blue-600", icon: HiUsers },
    { title: "Review Services",   desc: "Approve pending service listings",    href: "/admin/services?status=pending", color: "hover:border-purple-300", iconColor: "bg-purple-50 text-purple-600", icon: MdPets },
    { title: "Handle Reports",    desc: "Review flagged listings and users",   href: "/admin/reports?status=open", color: "hover:border-red-300", iconColor: "bg-red-50 text-red-600", icon: HiFlag },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">OotyDogs Admin Overview</p>
        </div>
        <Link href="/admin/listings?status=pending"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white rounded-xl hover:bg-brand-green-mid transition-colors text-sm font-medium shadow-sm">
          <HiClock className="w-4 h-4" /> Pending Reviews
        </Link>
      </div>

      {/* Alert if pending items */}
      {((stats?.listings?.pending ?? 0) > 0 || (stats?.users?.pendingVerifications ?? 0) > 0) && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <HiExclamation className="text-amber-500 w-5 h-5 shrink-0" />
          <p className="text-sm text-amber-800">
            You have{" "}
            {(stats?.listings?.pending ?? 0) > 0 && <strong>{stats.listings.pending} listing{stats.listings.pending !== 1 ? "s" : ""}</strong>}
            {(stats?.listings?.pending ?? 0) > 0 && (stats?.users?.pendingVerifications ?? 0) > 0 && " and "}
            {(stats?.users?.pendingVerifications ?? 0) > 0 && <strong>{stats.users.pendingVerifications} user verification{stats.users.pendingVerifications !== 1 ? "s" : ""}</strong>}
            {" "}awaiting your review.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ title, value, sub, icon: Icon, color, href }) => (
          <Link key={title} href={href}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <HiArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-green group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{title}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actionItems.map(({ title, desc, href, color, iconColor, icon: Icon }) => (
            <Link key={title} href={href}
              className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all ${color} group`}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                <HiArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
