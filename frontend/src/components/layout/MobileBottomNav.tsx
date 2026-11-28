"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaPaw, FaListAlt, FaUser } from "react-icons/fa";

const tabs = [
  { label: "Home",       href: "/",                      icon: FaHome,    exact: true },
  { label: "Browse",     href: "/listings",              icon: FaPaw,     exact: false },
  { label: "My Listings",href: "/profile?tab=listings",  icon: FaListAlt, exact: false },
  { label: "Account",    href: "/profile",               icon: FaUser,    exact: false },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 safe-area-bottom">
      <div className="grid grid-cols-4 h-14">
        {tabs.map(({ label, href, icon: Icon, exact }) => {
          const basePath = href.split("?")[0];
          const active = exact ? pathname === basePath : pathname.startsWith(basePath);
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? "text-brand-gold" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
