"use client";

import Link from "next/link";
import { Bug, ShieldCheck, AlertTriangle } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_0_rgba(15,23,42,0.03)]">
      {/* Alpha Release Testing Disclaimer Bar */}
      <div className="bg-amber-500 text-slate-950 text-[11px] font-extrabold py-1 px-4 text-center flex items-center justify-center gap-1.5 shadow-xs">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-slate-950" />
        <span>ALPHA RELEASE: BiteID is an experimental prototype intended solely for testing and evaluation. Not for clinical diagnosis.</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Bug className="w-5 h-5" />
          </div>
          <span>Bite<span className="text-emerald-600">ID</span></span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/40 ml-1">
            Alpha Testing Build
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-900 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
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
