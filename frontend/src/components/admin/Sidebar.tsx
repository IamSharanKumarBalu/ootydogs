"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";
import { toast } from "sonner";
import {
  HiHome, HiClipboardList, HiCollection, HiUsers, HiNewspaper,
  HiFlag, HiCog, HiLogout, HiArrowLeft, HiTag, HiCreditCard,
} from "react-icons/hi";
import { FaPaw, FaDog } from "react-icons/fa";
import { MdPets } from "react-icons/md";

const NAV_ITEMS = [
  { title: "Dashboard",   href: "/admin",             icon: HiHome,         exact: true },
  { title: "Listings",    href: "/admin/listings",     icon: HiClipboardList },
  { title: "Services",    href: "/admin/services",     icon: MdPets },
  { title: "Users",       href: "/admin/users",        icon: HiUsers },
  { title: "Breeds",      href: "/admin/breeds",       icon: FaDog },
  { title: "Categories",  href: "/admin/categories",   icon: HiTag },
  { title: "Blogs",       href: "/admin/blogs",        icon: HiNewspaper },
  { title: "Transactions", href: "/admin/transactions", icon: HiCreditCard },
  { title: "Reports",     href: "/admin/reports",      icon: HiFlag },
  { title: "Settings",    href: "/admin/settings",     icon: HiCog },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 bg-brand-green-dark text-white flex flex-col">
      {/* Logo */}
      <div className="h-16 shrink-0 flex items-center px-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white/10 ring-1 ring-white/20 shrink-0">
            <Image src="/logo.png" alt="OotyDogs" fill className="object-contain p-0.5" />
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-sm text-white">OotyDogs</p>
            <p className="text-[10px] text-brand-green-light leading-none">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map(({ title, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand-green text-white shadow-lg shadow-brand-green/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}>
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-white/10 space-y-1">
        <Link href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <HiArrowLeft size={16} /> Back to Site
        </Link>
        <button
          onClick={async () => { await signOut(); toast.success("Logged out"); window.location.href = "/"; }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-white hover:bg-red-600/80 transition-all"
        >
          <HiLogout size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
