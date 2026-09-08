"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bug,
  AlertOctagon,
  PhoneCall,
  ShieldCheck,
  ChevronDown,
  CheckSquare,
  AlertTriangle,
  Printer,
  RotateCcw,
  Sparkles,
  Info,
  FileText,
  Eye,
} from "lucide-react";
import { AnalysisResult, TriageContext } from "@/lib/schema";
import { ReferenceComparisonModal } from "@/components/ReferenceComparisonModal";

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [context, setContext] = useState<TriageContext | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const [completedAdvice, setCompletedAdvice] = useState<Record<number, boolean>>({});

  const [selectedRefPest, setSelectedRefPest] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("biteid_triage_result");
    const storedContext = sessionStorage.getItem("biteid_triage_context");

    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult));
      } catch (e) {
        console.error("Failed to parse triage result:", e);
      }
    }

    if (storedContext) {
      try {
        setContext(JSON.parse(storedContext));
      } catch (e) {
        console.error("Failed to parse context:", e);
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-200/60 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">No Active Triage Result Found</h2>
        <p className="text-sm text-slate-500">
          Please complete the intake wizard to generate a bite assessment.
        </p>
        <Link
          href="/intake"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-2xl shadow-md hover:bg-emerald-700 transition-colors"
        >
          <span>Start Assessment</span>
        </Link>
      </div>
    );
  }

  // 1. EMERGENCY REDIRECT SCREEN
  if (result.isEmergencyRedirect) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        <div className="bg-red-600 text-white rounded-3xl p-8 shadow-2xl border-4 border-red-700 text-center space-y-6 glow-red">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <AlertOctagon className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-2">
            <span className="bg-white/20 text-white text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full backdrop-blur-md">
              Emergency Safety Interception
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Seek Emergency Care Immediately</h1>
          </div>

          <p className="text-sm sm:text-base text-red-100 font-medium leading-relaxed max-w-lg mx-auto">
            {result.emergencyMessage ||
              "Red-flag systemic symptoms were detected. Online photo assessment is halted for your safety. Please seek emergency medical care immediately."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href="tel:911"
              className="flex items-center justify-center gap-2 bg-white text-red-700 hover:bg-red-50 font-extrabold text-base py-4 px-6 rounded-2xl shadow-lg transition-transform transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call 911</span>
            </a>

            <a
              href="tel:18002221222"
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-lg transition-transform transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Poison Control</span>
            </a>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 space-y-3 text-slate-700">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-600" /> Safe Transportation Instructions
          </h3>
          <ul className="list-disc list-inside text-xs space-y-1.5 text-slate-600 font-medium">
            <li>Have someone else drive you to the nearest emergency room or wait for EMS.</li>
            <li>If an EpiPen (epinephrine auto-injector) is prescribed, administer as instructed.</li>
            <li>Do not consume food, liquid, or attempt to drive yourself while experiencing severe dizziness.</li>
          </ul>
        </div>
      </div>
    );
  }

  const topMatch = result.rankedCandidates[0];

  const mapPestNameToId = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("tick")) return "blacklegged_tick";
    if (lower.includes("mosquito")) return "mosquito";
    if (lower.includes("bed bug")) return "bed_bug";
    if (lower.includes("flea")) return "flea";
    if (lower.includes("recluse")) return "brown_recluse";
    if (lower.includes("widow")) return "black_widow";
    return "mosquito";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Reference Comparison Modal */}
      {selectedRefPest && (
        <ReferenceComparisonModal
          isOpen={!!selectedRefPest}
          onClose={() => setSelectedRefPest(null)}
          pestId={selectedRefPest.id}
          pestName={selectedRefPest.name}
        />
      )}

      {/* Top Banner */}
      <div className="glass-card-dark rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden glow-emerald">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Bug className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> BiteID Multimodal Assessment
            </span>
            {result.culpritDetectedFromPhoto && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
                Pest Visual Confirmation Included
              </span>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-400 font-extrabold">Primary Suspected Cause</p>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              {topMatch?.name}
            </h1>
            <p className="text-sm italic text-slate-300 font-serif">{topMatch?.scientificName}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300">Probability Match:</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {Math.round((topMatch?.probability || 0) * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300">Confidence:</span>
                <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                  topMatch?.confidence === "high"
                    ? "bg-emerald-500 text-slate-950"
                    : topMatch?.confidence === "medium"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-slate-500 text-white"
                }`}>
                  {topMatch?.confidence}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedRefPest({
                  id: mapPestNameToId(topMatch.name),
                  name: topMatch.name,
                })
              }
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all transform hover:scale-105"
            >
              <Eye className="w-4 h-4" />
              <span>Compare Visual References</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Suspected Causes Ranking */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">Top Suspected Biting Vectors</h2>

        <div className="space-y-4">
          {result.rankedCandidates.map((candidate, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-white/60 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center shadow-sm">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{candidate.name}</p>
                    <p className="text-[11px] italic text-slate-500">{candidate.scientificName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-slate-900">
                    {Math.round(candidate.probability * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRefPest({
                        id: mapPestNameToId(candidate.name),
                        name: candidate.name,
                      })
                    }
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visual Ref</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    idx === 0 ? "bg-emerald-600" : idx === 1 ? "bg-amber-500" : "bg-slate-400"
                  }`}
                  style={{ width: `${Math.round(candidate.probability * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "Why this match?" Accordion */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">Why This Match? Contextual Correlation</h2>

        <div className="space-y-3">
          {result.rankedCandidates.map((candidate, idx) => {
            const isOpen = activeAccordion === idx;
            return (
              <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white/40">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm bg-white/60 hover:bg-white/90 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-800">
                    <Bug className="w-4 h-4 text-emerald-600" />
                    <span>Matched Factors for {candidate.name}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="p-4 bg-white/80 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
                    <p className="font-extrabold text-slate-800 mb-2">Key Diagnostic Correlations:</p>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700 font-medium">
                      {candidate.matchedFactors.map((factor, fIdx) => (
                        <li key={fIdx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* First Aid Advice Checklist */}
      {topMatch && topMatch.firstAidAdvice.length > 0 && (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" /> Recommended First Aid Checklist
          </h2>

          <div className="space-y-2.5">
            {topMatch.firstAidAdvice.map((advice, aIdx) => {
              const isDone = completedAdvice[aIdx];
              return (
                <button
                  key={aIdx}
                  type="button"
                  onClick={() => setCompletedAdvice((prev) => ({ ...prev, [aIdx]: !prev[aIdx] }))}
                  className={`w-full text-left p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                    isDone
                      ? "bg-emerald-500/10 border-emerald-500/30 text-slate-500 line-through"
                      : "bg-white/60 border-slate-200/80 hover:bg-white text-slate-800"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 ${
                    isDone ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-300"
                  }`}>
                    {isDone && <CheckSquare className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold leading-relaxed">{advice}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* "When to see a doctor" Safety Checklist */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 space-y-4 backdrop-blur-md">
        <h2 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" /> When to See a Healthcare Provider
        </h2>

        <ul className="space-y-2 text-xs text-amber-950 font-semibold list-disc list-inside">
          {topMatch?.warningSigns.map((sign, sIdx) => (
            <li key={sIdx}>{sign}</li>
          )) || <li>If redness expands beyond 2 inches or warm, pus-filled blisters develop.</li>}
          <li>If symptoms fail to improve after 3 to 5 days.</li>
        </ul>
      </div>

      {/* CLINICAL SUMMARY CARD (Exportable View) */}
      <div className="glass-card rounded-3xl p-6 border-2 border-slate-300/80 shadow-md space-y-4 print:border-none">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900">Clinical Summary Card</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">ID: {Date.now().toString().slice(-8)}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Patient Region</span>
            <span className="font-bold text-slate-800">{context?.usState || "US-VA"}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Environment</span>
            <span className="font-bold text-slate-800">{context?.incidentLocation?.replace(/_/g, " ") || "Yard"}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Primary Sensation</span>
            <span className="font-bold text-slate-800">{context?.primarySensation?.replace(/_/g, " ") || "Itch"}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Red-Flag Screen</span>
            <span className="font-extrabold text-emerald-600">Passed (Clear)</span>
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl p-4 text-xs text-slate-700 space-y-1 border border-slate-200/60">
          <p className="font-extrabold text-slate-900">Triage Summary:</p>
          <p className="leading-relaxed">{result.summary}</p>
        </div>

        <p className="text-[10px] text-slate-400 italic">
          Disclaimer: {result.disclaimer}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 pb-8">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Summary</span>
        </button>

        <Link
          href="/intake"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Assessment</span>
        </Link>
      </div>
    </div>
  );
}
