import Link from "next/link";
import { FaPaw } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-green-soft flex items-center justify-center mb-6">
        <FaPaw className="w-10 h-10 text-brand-green" />
      </div>
      <h1 className="text-6xl font-extrabold text-slate-800 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-700 mb-3">Page Not Found</h2>
      <p className="text-slate-500 max-w-sm mb-8">
        Looks like this page wandered off. Let&apos;s get you back to finding your perfect pet companion.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/"
          className="px-6 py-3 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-mid transition-colors shadow-sm">
          Back to Home
        </Link>
        <Link href="/listings"
          className="px-6 py-3 bg-brand-green-soft text-brand-green font-semibold rounded-xl hover:bg-brand-green-muted transition-colors">
          Browse Pets
        </Link>
      </div>
    </div>
  );
}
