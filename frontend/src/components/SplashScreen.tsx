"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [show, setShow] = useState(false);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("splash_done")) return;
      sessionStorage.setItem("splash_done", "1");
    } catch {
      return;
    }
    setShow(true);
    const t1 = setTimeout(() => setExit(true), 2500);
    const t2 = setTimeout(() => setShow(false), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes splashPupIn {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          55%  { transform: scale(1.18) rotate(6deg); opacity: 1; }
          75%  { transform: scale(0.93) rotate(-3deg); }
          90%  { transform: scale(1.06) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes splashPupWiggle {
          0%,100% { transform: rotate(0deg) scale(1); }
          20%     { transform: rotate(-6deg) scale(1.02); }
          40%     { transform: rotate(6deg) scale(1.02); }
          60%     { transform: rotate(-4deg) scale(1.01); }
          80%     { transform: rotate(4deg) scale(1.01); }
        }
        @keyframes splashPupOut {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.1) translateY(20px); opacity: 0; }
        }
        @keyframes splashLogoIn {
          0%   { transform: scale(0.2); opacity: 0; }
          65%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashTextIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashBgFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .splash-pup {
          animation:
            splashPupIn    0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
            splashPupWiggle 0.55s ease-in-out 1.1s,
            splashPupOut   0.4s  ease-in 1.9s forwards;
        }
        .splash-logo {
          animation: splashLogoIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 2.0s both;
        }
        .splash-title {
          animation: splashTextIn 0.4s ease 2.25s both;
        }
        .splash-sub {
          animation: splashTextIn 0.4s ease 2.4s both;
        }
        .splash-exit {
          animation: splashBgFadeOut 0.55s ease forwards;
        }
      `}</style>

      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none${exit ? " splash-exit" : ""}`}
        style={{
          background: "linear-gradient(135deg, #1a7c4b 0%, #0f5c35 100%)",
          pointerEvents: exit ? "none" : "all",
        }}
      >
        {/* subtle paw-print dots */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
          backgroundSize: "36px 36px",
        }} />

        <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
          {/* Puppy */}
          <div className="splash-pup absolute inset-0 flex items-center justify-center">
            <Image
              src="/cute-puppy-01.png"
              alt=""
              width={160}
              height={160}
              priority
              className="drop-shadow-2xl"
            />
          </div>

          {/* Logo (appears after puppy fades) */}
          <div className="splash-logo absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl overflow-hidden bg-white/15 backdrop-blur-sm ring-2 ring-white/30 shadow-2xl" style={{ width: 88, height: 88, padding: 6 }}>
              <Image
                src="/logo.png"
                alt="OotyDogs"
                width={76}
                height={76}
                priority
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        <p className="splash-title text-white font-extrabold text-3xl tracking-tight mt-3 drop-shadow-lg">
          OotyDogs
        </p>
        <p className="splash-sub text-white/65 text-sm mt-1 tracking-wide">
          Find your pet companion 🐾
        </p>
      </div>
    </>
  );
}
