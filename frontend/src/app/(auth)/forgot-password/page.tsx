"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { MdError, MdCheckCircle } from "react-icons/md";
import { HiArrowLeft, HiArrowRight, HiMail } from "react-icons/hi";
import { FaPaw } from "react-icons/fa";
import LoadingButton from "@/components/ui/loadingButton";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const ForgotPassword = () => {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else setError(data.message || "Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left brand panel ── */}
      <div className="relative hidden lg:flex lg:w-5/12 xl:w-[42%] flex-col bg-brand-green overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-green-mid/40" />
          <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-brand-green-dark/50" />
          <FaPaw className="absolute top-16 right-10 text-white/[0.06] rotate-[15deg]" size={160} />
          <FaPaw className="absolute bottom-28 left-6 text-white/[0.05] rotate-[-20deg]" size={120} />
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 py-12">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white/15 ring-1 ring-white/25 shrink-0">
              <Image src="/logo.png" alt="OotyDogs" fill className="object-contain p-1" priority />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">OotyDogs</span>
          </Link>

          <div className="my-auto">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <HiMail className="text-brand-green-light" size={28} />
            </div>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              Password<br />Recovery
            </h2>
            <p className="text-brand-green-light text-base leading-relaxed max-w-xs">
              We&apos;ll send a secure reset link to your registered email address. It expires in 15 minutes.
            </p>
          </div>

          <p className="text-white/40 text-xs mt-auto pt-8">
            Check your spam folder if you don&apos;t see the email
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="lg:hidden bg-brand-green px-6 py-5 flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white/15 ring-1 ring-white/25 shrink-0">
            <Image src="/logo.png" alt="OotyDogs" fill className="object-contain p-0.5" priority />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">OotyDogs</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-green transition-colors mb-8 font-medium">
              <HiArrowLeft size={15} /> Back to Sign In
            </Link>

            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-brand-green-soft rounded-full flex items-center justify-center mx-auto mb-5">
                  <MdCheckCircle className="text-brand-green w-9 h-9" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Check your inbox</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-2">
                  If an account exists for <strong className="text-slate-700">{email}</strong>, we&apos;ve sent a password reset link.
                </p>
                <p className="text-xs text-slate-400 mb-8">The link expires in 15 minutes.</p>
                <Link href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green-mid transition-colors">
                  <HiArrowLeft size={14} /> Return to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-1.5">Forgot your password?</h1>
                  <p className="text-slate-500 text-sm">Enter your email and we&apos;ll send you a reset link</p>
                </div>

                {error && (
                  <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
                    <MdError className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required disabled={loading}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all text-sm"
                    />
                  </div>

                  <LoadingButton type="submit" loading={loading}
                    className="w-full bg-brand-green hover:bg-brand-green-mid text-white font-semibold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                    Send Reset Link <HiArrowRight size={15} />
                  </LoadingButton>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
