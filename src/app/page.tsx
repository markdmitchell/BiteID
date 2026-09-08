import Link from "next/link";
import { Bug, ShieldAlert, Sparkles, MapPin, Activity, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section with Ambient Liquid Mesh */}
      <div className="glass-card-dark rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden glow-emerald">
        {/* Liquid Lighting Accents */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Multimodal Insect & Spider Bite Triage
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Instant Bite Triage Powered by <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Vision & Regional Geo-Data</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            BiteID combines lesion photo analysis, pest visual identification, geographic endemicity maps, and active seasonal windows to triage insect and spider bites safely.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/intake"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 text-sm"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Red-Flag Safety Alert Banner */}
      <div className="glass-card rounded-2xl p-5 border-l-4 border-l-red-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Deterministic Safety Interception</h3>
            <p className="text-xs text-slate-600">Any reported difficulty breathing, facial swelling, or dizziness immediately short-circuits triage to emergency 911 resources.</p>
          </div>
        </div>
        <Link
          href="/intake"
          className="text-xs font-bold text-red-600 hover:text-red-700 underline whitespace-nowrap"
        >
          Check Symptoms
        </Link>
      </div>

      {/* Liquid Glass Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Bug className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Dual Photo Analysis</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload a lesion reaction photo, plus an optional pest image for an instant visual identification accuracy boost.
          </p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Geo & Seasonal Filtering</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Filters candidates by strict geographic endemicity (e.g. non-endemic brown recluse penalties) and temperature/month curves.
          </p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Clinical Summary Card</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Generates exportable clinical summaries with first aid checklists and warning signs to share with your physician.
          </p>
        </div>
      </div>
    </div>
  );
}
