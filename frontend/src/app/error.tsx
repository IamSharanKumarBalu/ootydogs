"use client";

import Link from "next/link";
import { FaPaw } from "react-icons/fa";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <FaPaw className="w-10 h-10 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">Something went wrong</h2>
      <p className="text-slate-500 max-w-sm mb-8">
        We hit an unexpected snag. Try again — if the problem persists, please contact us.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={reset}
          className="px-6 py-3 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-mid transition-colors shadow-sm">
          Try Again
        </button>
        <Link href="/"
          className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
