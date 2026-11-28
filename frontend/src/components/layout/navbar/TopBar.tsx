"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaSearch, FaUser, FaUserCircle, FaSignOutAlt,
  FaHeart, FaListAlt, FaBars, FaTimes, FaPhone, FaCreditCard,
} from "react-icons/fa";
import { useSession } from "@/lib/auth/client";
import { useAuthMutation } from "@/hooks/auth/useAuthMutation";
import type { Manager } from "@/hooks/useManager";
import { config } from "@/constants/config";
import NotificationBell from "./NotificationBell";

const NAV_LINKS = [
  { label: "Browse Pets", href: "/listings" },
  { label: "Breeds",      href: "/breeds" },
  { label: "Services",    href: "/services" },
  { label: "Blog",        href: "/blogs" },
  { label: "Contact",     href: "/contact" },
];

const PET_TYPES = ["All", "Dogs", "Cats", "Birds", "Fish", "Rabbits", "Hamsters", "Reptiles"];

export const TopBar = ({ editProfileManager }: { editProfileManager: Manager }) => {
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [petFilter, setPetFilter] = useState("All");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuthMutation();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    if (showDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (petFilter !== "All") params.set("petType", petFilter);
    router.push(`/listings?${params.toString()}`);
  };

  const AccountDropdown = () =>
    showDropdown ? (
      <div
        onMouseLeave={() => setShowDropdown(false)}
        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-green to-brand-green-mid px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <FaUserCircle className="text-brand-green" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{session?.user?.name || "User"}</p>
              <p className="text-white/70 text-xs truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>
        {/* Links */}
        <div className="py-2">
          <Link href="/profile" onClick={() => setShowDropdown(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-brand-green-soft transition-colors group">
            <FaUserCircle className="text-slate-400 group-hover:text-brand-green" size={16} />
            <span className="text-sm font-medium">My Profile</span>
          </Link>
          <Link href="/my/listings" onClick={() => setShowDropdown(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-brand-green-soft transition-colors group">
            <FaListAlt className="text-slate-400 group-hover:text-brand-green" size={16} />
            <span className="text-sm font-medium">My Listings</span>
          </Link>
          <Link href="/my/favourites" onClick={() => setShowDropdown(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-brand-green-soft transition-colors group">
            <FaHeart className="text-slate-400 group-hover:text-brand-red" size={16} />
            <span className="text-sm font-medium">Saved Pets</span>
          </Link>
          <Link href="/my/subscription" onClick={() => setShowDropdown(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-brand-green-soft transition-colors group">
            <FaCreditCard className="text-slate-400 group-hover:text-brand-green" size={16} />
            <span className="text-sm font-medium">My Subscription</span>
          </Link>
          <Link href="/pricing" onClick={() => setShowDropdown(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-brand-green-soft transition-colors group">
            <span className="text-slate-400 group-hover:text-brand-green text-base leading-none">₹</span>
            <span className="text-sm font-medium">View Plans</span>
          </Link>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={() => { setShowDropdown(false); signOut.mutate(); }}
            disabled={signOut.isPending}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            <FaSignOutAlt size={16} />
            <span className="text-sm font-medium">{signOut.isPending ? "Logging out…" : "Logout"}</span>
          </button>
        </div>
      </div>
    ) : null;

  return (
    <>
      {/* ══ MOBILE ══════════════════════════════════════════════════════════ */}
      <header className="lg:hidden bg-brand-green shadow-md">
        {/* Row 1: Logo + icons */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 ring-2 ring-white/30">
              <Image src="/logo.png" alt={config.appName} fill className="object-contain p-0.5" priority />
            </div>
            <div className="leading-tight">
              <p className="text-white font-extrabold text-sm">{config.appName}</p>
              <p className="text-brand-green-light text-[9px] leading-none">Find your pet companion</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/listings/new"
              className="bg-brand-red hover:bg-brand-red-light text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors hidden xs:block">
              + Post Pet
            </Link>

            <NotificationBell />

            {!mounted || isPending ? (
              <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
            ) : session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 text-white/80 hover:text-white">
                  <FaUser size={16} />
                </button>
                <AccountDropdown />
              </div>
            ) : (
              <Link href="/login" className="p-2 text-white/80 hover:text-white">
                <FaUser size={16} />
              </Link>
            )}

            <button onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-white/80 hover:text-white">
              {showMobileMenu ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>

        {/* Row 2: Search */}
        <form onSubmit={handleSearch} className="px-4 pb-3">
          <div className="flex h-10 rounded-lg overflow-hidden border border-white/20">
            <select value={petFilter} onChange={e => setPetFilter(e.target.value)}
              className="bg-white/10 text-white text-xs px-2 outline-none shrink-0 border-r border-white/20">
              {PET_TYPES.map(t => <option key={t} value={t} className="text-slate-800">{t}</option>)}
            </select>
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search breeds, cities, listings…"
              className="flex-1 bg-white/10 text-white placeholder-white/50 text-sm px-3 outline-none" />
            <button type="submit" className="bg-brand-red hover:bg-brand-red-light px-3 transition-colors">
              <FaSearch className="text-white" size={14} />
            </button>
          </div>
        </form>

        {/* Mobile menu */}
        {showMobileMenu && (
          <nav className="border-t border-white/10 py-2 bg-brand-green-dark">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2.5 text-white/90 hover:bg-white/10 text-sm font-medium">
                {l.label}
              </Link>
            ))}
            <div className="px-4 pt-2 pb-3">
              <Link href="/listings/new" onClick={() => setShowMobileMenu(false)}
                className="block w-full text-center bg-brand-red hover:bg-brand-red-light text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
                + Post Your Pet
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* ══ DESKTOP ══════════════════════════════════════════════════════════ */}
      <header className="hidden lg:block bg-brand-green shadow-md">
        {/* Main bar */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-2">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 ring-2 ring-white/30">
                <Image src="/logo.png" alt={config.appName} fill className="object-contain p-0.5" priority />
              </div>
              <div className="leading-tight">
                <p className="text-white font-extrabold text-lg tracking-tight leading-none">{config.appName}</p>
                <p className="text-brand-green-light text-[10px] leading-none mt-0.5">Find your pet companion</p>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-1 h-10 rounded-lg overflow-hidden border border-white/20">
              <select value={petFilter} onChange={e => setPetFilter(e.target.value)}
                className="bg-white/10 text-white text-xs px-3 outline-none shrink-0 border-r border-white/20 cursor-pointer">
                {PET_TYPES.map(t => <option key={t} value={t} className="text-slate-800">{t}</option>)}
              </select>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search for breeds, cities, listings…"
                className="flex-1 bg-white/10 text-white placeholder-white/50 text-sm px-4 outline-none" />
              <button type="submit"
                className="bg-brand-red hover:bg-brand-red-light px-5 text-white flex items-center gap-2 text-sm font-semibold transition-colors">
                <FaSearch size={14} /> Search
              </button>
            </form>

            {/* Account */}
            {!mounted || isPending ? (
              <div className="w-28 h-9 bg-white/10 rounded animate-pulse shrink-0" />
            ) : session?.user ? (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onMouseEnter={() => setShowDropdown(true)}
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-white hover:text-brand-green-light border border-transparent hover:border-white/30 rounded-lg px-3 py-2 transition-all">
                  <FaUserCircle size={18} />
                  <div className="leading-tight text-left">
                    <p className="text-[10px] text-white/70">Hello,</p>
                    <p className="text-sm font-bold leading-none">{session.user.name?.split(" ")[0] || "User"} ▾</p>
                  </div>
                </button>
                <AccountDropdown />
              </div>
            ) : (
              <Link href="/login"
                className="flex items-center gap-2 text-white hover:text-brand-green-light border border-white/20 hover:border-white/50 rounded-lg px-3 py-2 transition-all shrink-0">
                <FaUser size={16} />
                <span className="text-sm font-semibold">Sign In</span>
              </Link>
            )}

            {/* Notifications */}
            <NotificationBell />

            {/* Post CTA */}
            <Link href="/listings/new"
              className="bg-brand-red hover:bg-brand-red-light text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors shrink-0 whitespace-nowrap shadow-lg shadow-red-900/30">
              + Post Your Pet
            </Link>
          </div>
        </div>

        {/* Secondary bar */}
        <div className="bg-brand-green-dark border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-6 h-9 text-sm">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className="text-white/80 hover:text-brand-green-light transition-colors font-medium">
                  {l.label}
                </Link>
              ))}
              <Link href={`tel:${config.contact.phone.replace(/\s/g, "")}`}
                className="ml-auto flex items-center gap-1.5 text-white/60 hover:text-brand-green-light transition-colors text-xs">
                <FaPhone size={11} />
                <span>{config.contact.phone}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
