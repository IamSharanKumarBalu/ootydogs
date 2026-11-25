"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook, FaInstagram, FaTwitter, FaYoutube,
  FaPhone, FaEnvelope, FaMapMarkerAlt,
} from "react-icons/fa";
import { config } from "@/constants/config";

export const Footer = () => {
  const link = "text-sm text-white/70 hover:text-brand-green-light transition-colors";
  const heading = "text-xs font-bold uppercase tracking-widest text-white/40 mb-4";

  return (
    <footer className="bg-brand-green-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 ring-2 ring-white/20">
                <Image src="/logo.png" alt={config.appName} fill className="object-contain p-1" />
              </div>
              <div>
                <p className="font-extrabold text-lg text-white leading-tight">{config.appName}</p>
                <p className="text-brand-green-light text-[10px] leading-none">Find your pet companion</p>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-5">{config.appDescription}</p>
            <div className="flex gap-3">
              {[
                { icon: FaFacebook, href: "#",                      label: "Facebook" },
                { icon: FaInstagram, href: config.contact.instagram, label: "Instagram" },
                { icon: FaTwitter,  href: "#",                      label: "Twitter" },
                { icon: FaYoutube,  href: "#",                      label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 bg-white/10 hover:bg-brand-green-mid rounded-full flex items-center justify-center transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Browse */}
          <div>
            <p className={heading}>Browse</p>
            <ul className="space-y-2.5">
              {[
                { label: "All Pet Listings",        href: "/listings" },
                { label: "Dogs",                    href: "/listings?petType=Dogs" },
                { label: "Cats",                    href: "/listings?petType=Cats" },
                { label: "Birds",                   href: "/listings?petType=Birds" },
                { label: "Breeds Directory",        href: "/breeds" },
                { label: "Pet Services",            href: "/services" },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className={heading}>Quick Links</p>
            <ul className="space-y-2.5">
              {[
                { label: "Post Your Pet",  href: "/listings/new" },
                { label: "My Listings",   href: "/profile?tab=listings" },
                { label: "Saved Pets",    href: "/profile?tab=saved" },
                { label: "My Profile",    href: "/profile" },
                { label: "Blog",          href: "/blogs" },
                { label: "Contact Us",    href: "/contact" },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className={heading}>Get in Touch</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2.5 text-sm">
                <FaPhone className="text-brand-green-light mt-0.5 shrink-0" size={13} />
                <a href={`tel:${config.contact.phone.replace(/\s/g, "")}`} className={link}>
                  {config.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <FaEnvelope className="text-brand-green-light mt-0.5 shrink-0" size={13} />
                <a href={`mailto:${config.contact.email}`} className={link}>
                  {config.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <FaMapMarkerAlt className="text-brand-green-light mt-0.5 shrink-0" size={13} />
                <span className="text-white/60">Ooty, Tamil Nadu, India</span>
              </li>
            </ul>

            {/* Post CTA in footer */}
            <Link href="/listings/new"
              className="inline-block bg-brand-red hover:bg-brand-red-light text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
              + Post Your Pet Free
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm text-center md:text-left">
            © {new Date().getFullYear()} {config.appName}. All rights reserved. · Developed by{" "}
            <a href="https://digistrivemedia.com/" target="_blank" rel="noopener noreferrer"
              className="text-brand-green-light hover:text-white transition-colors">
              Digistrive Media
            </a>
          </p>
          <div className="flex flex-wrap gap-5 text-xs">
            {[
              { label: "Privacy Policy",     href: "/legal/privacy" },
              { label: "Terms & Conditions", href: "/legal/terms" },
              { label: "Animal Welfare",     href: "/legal/animal-welfare"  },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="text-white/40 hover:text-white/70 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
