import Link from "next/link";
import { Bug, ShieldAlert, Sparkles, MapPin, Activity, ArrowRight, Layers, FileText, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-6 py-4">
      {/* Header Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Modular Triage Architecture</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">BiteID Bento Dashboard</h1>
        </div>
        <Link
          href="/intake"
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-2xl shadow-md transition-all text-xs"
        >
          <span>Start Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Tile 1: Hero Bento Card (2x2 span on desktop) */}
        <div className="md:col-span-2 md:row-span-2 bento-card-dark flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
            <Bug className="w-64 h-64 text-white" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="bento-badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" /> AI Multimodal Vision + Geo Engine
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-white">
              Precision Bite Triage in a Modular <span className="text-emerald-400">Bento Grid</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Triages insect and spider bites safely by combining lesion photo identification, optional culprit pest morphology, geographic endemicity maps, and active seasonal temperature curves.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-300 font-medium">
              <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Deterministic Red-Flag Safety
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fitzpatrick Types I–VI
              </span>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <Link
              href="/intake"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-all text-xs"
            >
              <span>Launch Intake Wizard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Tile 2: Red-Flag Safety Interception (2-col span) */}
        <div className="md:col-span-2 bento-card border-l-4 border-l-red-500 flex flex-col justify-between space-y-4 bg-red-50/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Deterministic Safety Interception</h3>
                <p className="text-xs text-slate-600">Immediate 911 / Poison Control short-circuiting.</p>
              </div>
            </div>
            <span className="bento-badge bg-red-100 text-red-800 border border-red-200">
              Active
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Reported breathing difficulty, facial swelling, or severe dizziness halts online triage immediately and displays emergency 911 / Poison Control call links.
          </p>
        </div>

        {/* Tile 3: Dual Photo Vision */}
        <div className="bento-card bento-card-hover flex flex-col justify-between space-y-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Dual Photo Analysis</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Lesion skin photo + optional culprit pest photo for an instant +80% accuracy boost.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700">Gemini 2.5 Vision</span>
        </div>

        {/* Tile 4: Geo-Seasonal Engine */}
        <div className="bento-card bento-card-hover flex flex-col justify-between space-y-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Geo & Seasonal Filter</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Applies hard endemic state boundaries (e.g. 0% Brown Recluse in WA) and temperature curves.
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-700">US State Data</span>
        </div>

        {/* Tile 5: Fitzpatrick Skin Engine */}
        <div className="bento-card bento-card-hover flex flex-col justify-between space-y-3">
          <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Fitzpatrick Scale I–VI</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Side-by-side visual reference comparisons spanning fair, olive, and deep skin tones.
            </p>
          </div>
          <span className="text-[11px] font-bold text-purple-700">CDC & AI Dataset</span>
        </div>

        {/* Tile 6: Clinical Summary Export */}
        <div className="bento-card bento-card-hover flex flex-col justify-between space-y-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Clinical Summary Card</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generates exportable clinical summaries formatted for healthcare provider review.
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-700">Print / Export</span>
        </div>
      </div>
    </div>
  );
}
