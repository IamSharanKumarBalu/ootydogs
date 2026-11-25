"use client";

import { PasswordInput } from "@/components/ui/form/PasswordInput";
import Link from "next/link";
import Image from "next/image";
import { MdError } from "react-icons/md";
import { HiCheckCircle, HiArrowRight } from "react-icons/hi";
import { FaPaw, FaDog, FaHeart, FaShieldAlt } from "react-icons/fa";
import { useAuthMutation } from "@/hooks/auth";
import { FormEvent, useRef } from "react";
import LoadingButton from "@/components/ui/loadingButton";

const inp = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all text-sm";
const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2";

const FEATURES = [
  { icon: FaDog,       text: "Post your first listing in under 3 minutes" },
  { icon: FaHeart,     text: "Save and compare pets from across India" },
  { icon: FaShieldAlt, text: "Verified community with safety-first policies" },
];

const Register = () => {
  const { signUp } = useAuthMutation();

  const nameRef     = useRef<HTMLInputElement>(null!);
  const emailRef    = useRef<HTMLInputElement>(null!);
  const phoneRef    = useRef<HTMLInputElement>(null!);
  const passwordRef = useRef<HTMLInputElement>(null!);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signUp.mutate({
      email: emailRef.current.value,
      password: passwordRef.current.value,
      name: nameRef.current.value,
      phone: phoneRef.current.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left brand panel ── */}
      <div className="relative hidden lg:flex lg:w-5/12 xl:w-[42%] flex-col justify-between bg-brand-green overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-green-mid/40" />
          <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-brand-green-dark/50" />
          <FaPaw className="absolute top-16 right-10 text-white/[0.06] rotate-[15deg]" size={160} />
          <FaPaw className="absolute bottom-28 left-6 text-white/[0.05] rotate-[-20deg]" size={120} />
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 py-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-auto">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white/15 ring-1 ring-white/25 shrink-0">
              <Image src="/logo.png" alt="OotyDogs" fill className="object-contain p-1" priority />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">OotyDogs</span>
          </Link>

          <div className="my-auto">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
              Join India&apos;s<br />Pet Community
            </h2>
            <p className="text-brand-green-light text-base leading-relaxed mb-10 max-w-xs">
              Connect with breeders, rescue homes and pet owners across every state. It&apos;s completely free.
            </p>

            <ul className="space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="text-brand-green-light" size={15} />
                  </div>
                  <span className="text-white/80 text-sm leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/40 text-xs mt-auto pt-8">
            Free forever for pet owners. No credit card required.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-brand-green px-6 py-5 flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white/15 ring-1 ring-white/25 shrink-0">
            <Image src="/logo.png" alt="OotyDogs" fill className="object-contain p-0.5" priority />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">OotyDogs</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-1.5">Create your account</h1>
              <p className="text-slate-500 text-sm">Join thousands of pet owners on OotyDogs</p>
            </div>

            {signUp.error && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
                <MdError className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">
                  {signUp.error instanceof Error ? signUp.error.message : "Could not create your account. Please try again."}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Full Name</label>
                  <input type="text" ref={nameRef} required placeholder="Your full name"
                    className={inp} name="name" disabled={signUp.isPending} />
                </div>
                <div>
                  <label className={lbl}>Email Address</label>
                  <input type="email" ref={emailRef} required placeholder="you@example.com"
                    className={inp} name="email" disabled={signUp.isPending} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={lbl}>Mobile Number</label>
                <input type="tel" ref={phoneRef} required placeholder="+91 98765 43210"
                  pattern="[0-9+\s\-]{7,15}" className={inp} name="phone" disabled={signUp.isPending} />
                <p className="text-xs text-slate-400 mt-1.5">Used for listing enquiries and account verification</p>
              </div>

              {/* Password */}
              <div>
                <label className={lbl}>Password</label>
                <PasswordInput ref={passwordRef} name="password" required disabled={signUp.isPending}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all text-sm"
                />
                <p className="text-xs text-slate-400 mt-1.5">Minimum 8 characters</p>
              </div>

              {/* Submit */}
              <div className="pt-1">
                <LoadingButton type="submit" loading={signUp.isPending}
                  className="w-full bg-brand-green hover:bg-brand-green-mid text-white font-semibold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                  Create Account <HiArrowRight size={15} />
                </LoadingButton>
              </div>

              <p className="text-xs text-slate-400 text-center leading-relaxed pt-1">
                By creating an account you agree to our{" "}
                <Link href="/legal/terms" className="underline hover:text-brand-green transition-colors">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="underline hover:text-brand-green transition-colors">Privacy Policy</Link>.
              </p>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400 font-medium">Already have an account?</span>
              </div>
            </div>

            <Link href="/login"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 border-2 border-brand-green text-brand-green hover:bg-brand-green-soft rounded-xl text-sm font-semibold transition-colors">
              Sign in instead
            </Link>

            <p className="text-center text-xs text-slate-400 mt-5 flex items-center justify-center gap-1.5">
              <HiCheckCircle className="text-brand-green" size={13} />
              Free forever — no credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
