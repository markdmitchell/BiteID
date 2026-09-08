"use client";

import Link from "next/link";
import { Bug, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_20px_0_rgba(15,23,42,0.03)]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Bug className="w-5 h-5" />
          </div>
          <span>Bite<span className="text-emerald-600">ID</span></span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 ml-1 backdrop-blur-md">
            Liquid Glass Beta
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-800 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Red-Flag Interception Active</span>
          </div>

          <Link
            href="/intake"
            className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            New Assessment
          </Link>
        </div>
      </div>
    </header>
  );
}
