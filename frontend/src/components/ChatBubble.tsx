"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTimes, FaPhone, FaEnvelope, FaListAlt } from "react-icons/fa";

export function ChatBubble() {
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [cloudVisible, setCloudVisible]   = useState(false);
  const [cloudGone, setCloudGone]         = useState(false);
  const [panelOpen, setPanelOpen]         = useState(false);

  useEffect(() => {
    // bubble slides in after 1 s (hidden behind splash if first visit)
    const t1 = setTimeout(() => setBubbleVisible(true), 1000);
    // cloud pops up 1.5 s after bubble
    const t2 = setTimeout(() => setCloudVisible(true), 2500);
    // auto-dismiss cloud after ~6 s
    const t3 = setTimeout(() => setCloudVisible(false), 8500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const dismissCloud = () => setCloudVisible(false);

  const togglePanel = () => {
    setPanelOpen(o => !o);
    setCloudVisible(false);
  };

  if (!bubbleVisible) return null;

  return (
    <>
      <style>{`
        @keyframes chatBounceIn {
          0%   { transform: translateY(80px) scale(0.4); opacity: 0; }
          55%  { transform: translateY(-10px) scale(1.08); opacity: 1; }
          75%  { transform: translateY(4px) scale(0.97); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cloudPopIn {
          0%   { transform: scale(0.5) translateY(10px); opacity: 0; transform-origin: bottom right; }
          65%  { transform: scale(1.06) translateY(-3px); opacity: 1; transform-origin: bottom right; }
          100% { transform: scale(1) translateY(0); opacity: 1; transform-origin: bottom right; }
        }
        @keyframes cloudFloat {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-5px); }
        }
        @keyframes chatFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          30%     { transform: translateY(-4px) rotate(-2deg); }
          70%     { transform: translateY(-2px) rotate(2deg); }
        }
        @keyframes panelSlideIn {
          from { transform: translateY(16px) scale(0.95); opacity: 0; transform-origin: bottom right; }
          to   { transform: translateY(0) scale(1); opacity: 1; transform-origin: bottom right; }
        }
        .chat-bubble-icon {
          animation: chatBounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                     chatFloat 3.5s ease-in-out 2s infinite;
        }
        .chat-cloud {
          animation: cloudPopIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                     cloudFloat 3s ease-in-out 1s infinite;
        }
        .chat-panel {
          animation: panelSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div className="fixed bottom-24 right-4 lg:bottom-8 lg:right-6 z-50 flex flex-col items-end gap-2">

        {/* Speech cloud */}
        {cloudVisible && (
          <div className="chat-cloud relative mb-1">
            <div
              className="relative bg-white rounded-2xl rounded-br-sm px-4 py-3 shadow-xl border border-slate-100"
              style={{ maxWidth: 190 }}
            >
              {/* dismiss x */}
              <button
                onClick={dismissCloud}
                className="absolute -top-2 -right-2 w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors"
              >
                <FaTimes size={8} className="text-slate-500" />
              </button>

              <p className="text-slate-800 font-semibold text-sm leading-snug">
                Hey, talk to me! 🐾
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Need help finding a pet?
              </p>

              {/* cloud tail */}
              <div
                className="absolute -bottom-2 right-5 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45"
                style={{ boxShadow: "2px 2px 4px rgba(0,0,0,0.05)" }}
              />
            </div>
          </div>
        )}

        {/* Quick-contact panel */}
        {panelOpen && (
          <div className="chat-panel bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden w-64">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-green to-brand-green-mid px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 ring-2 ring-white/30 shrink-0">
                  <Image src="/cute-puppy-02.png" alt="" width={32} height={32} className="object-cover w-full h-full" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">OotyDogs</p>
                  <p className="text-white/70 text-xs">We&apos;re happy to help!</p>
                </div>
              </div>
              <button onClick={togglePanel} className="text-white/70 hover:text-white p-1">
                <FaTimes size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-3 space-y-2">
              <p className="text-slate-500 text-xs px-1 mb-3">
                Looking for a pet or have questions? Reach us instantly 🐶
              </p>

              <a
                href="https://wa.me/917094508737"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
              >
                <span className="text-xl">💬</span>
                <div>
                  <p className="text-sm font-semibold text-green-700">WhatsApp Us</p>
                  <p className="text-xs text-green-500">Usually replies in minutes</p>
                </div>
              </a>

              <a
                href="tel:+917094508737"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <FaPhone className="text-brand-green ml-1" size={16} />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Call Us</p>
                  <p className="text-xs text-slate-400">Mon–Sat, 9 AM – 6 PM</p>
                </div>
              </a>

              <Link
                href="/contact"
                onClick={togglePanel}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <FaEnvelope className="text-brand-green ml-1" size={16} />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Send a Message</p>
                  <p className="text-xs text-slate-400">We&apos;ll get back to you</p>
                </div>
              </Link>

              <Link
                href="/listings"
                onClick={togglePanel}
                className="flex items-center gap-3 p-3 rounded-xl bg-brand-green-soft hover:bg-brand-green/10 transition-colors group"
              >
                <FaListAlt className="text-brand-green ml-1" size={16} />
                <div>
                  <p className="text-sm font-semibold text-brand-green">Browse Pets 🐾</p>
                  <p className="text-xs text-slate-400">See all available listings</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Floating icon button */}
        <button
          onClick={togglePanel}
          className="chat-bubble-icon relative w-16 h-16 rounded-full overflow-hidden shadow-2xl ring-4 ring-white hover:scale-110 active:scale-95 transition-transform"
          aria-label="Chat with us"
          style={{ boxShadow: "0 8px 32px rgba(26,124,75,0.35)" }}
        >
          <Image
            src="/cute-puppy-02.png"
            alt="Chat with OotyDogs"
            fill
            className="object-cover"
          />
          {/* green dot */}
          <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </button>
      </div>
    </>
  );
}
