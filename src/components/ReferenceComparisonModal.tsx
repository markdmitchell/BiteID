"use client";

import { useState } from "react";
import { X, Sparkles, ShieldAlert, CheckCircle2, Filter } from "lucide-react";
import { FitzpatrickScale, getReferenceAssetsForPest } from "@/lib/referenceData";

interface ReferenceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  pestId: string;
  pestName: string;
  userImageUrl?: string | null;
}

export function ReferenceComparisonModal({
  isOpen,
  onClose,
  pestId,
  pestName,
  userImageUrl,
}: ReferenceComparisonModalProps) {
  const [selectedSkinType, setSelectedSkinType] = useState<FitzpatrickScale>("I-II");

  if (!isOpen) return null;

  const assets = getReferenceAssetsForPest(pestId, selectedSkinType);
  const activeAsset = assets[0] || getReferenceAssetsForPest(pestId)[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ref-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-white/60 relative my-8 glow-emerald">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Modal Header */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Clinical Reference Engine
            </div>
            <h2 id="ref-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Visual Reference Comparison: {pestName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Compare your reaction against verified CDC public health assets and AI clinical presentations across Fitzpatrick skin types.
            </p>
          </div>

          {/* Skin Type Filter Controls */}
          <div className="bg-slate-100/60 p-4 rounded-2xl border border-slate-200/80 space-y-2 backdrop-blur-md">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" /> Select Fitzpatrick Skin Tone Category:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { scale: "I-II" as FitzpatrickScale, label: "Types I - II", sub: "Fair / Light" },
                { scale: "III-IV" as FitzpatrickScale, label: "Types III - IV", sub: "Medium / Olive" },
                { scale: "V-VI" as FitzpatrickScale, label: "Types V - VI", sub: "Deep / Dark" },
              ].map((item) => (
                <button
                  key={item.scale}
                  type="button"
                  onClick={() => setSelectedSkinType(item.scale)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    selectedSkinType === item.scale
                      ? "border-emerald-500 bg-emerald-600 text-white font-extrabold shadow-md"
                      : "border-slate-200/80 bg-white/80 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs leading-none">{item.label}</p>
                  <p className={`text-[10px] mt-1 ${selectedSkinType === item.scale ? "text-emerald-100" : "text-slate-400"}`}>
                    {item.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: User Photo */}
            <div className="border border-slate-200/80 rounded-2xl p-4 bg-white/50 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Your Photo</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">Uploaded</span>
              </div>
              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center shadow-inner">
                {userImageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={userImageUrl} alt="User lesion reaction" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-slate-400 italic">No image provided</p>
                )}
              </div>
              <p className="text-xs text-slate-600 italic">
                Reaction under assessment
              </p>
            </div>

            {/* Right Card: Clinical Reference Photo */}
            <div className="border border-emerald-500/30 rounded-2xl p-4 bg-emerald-500/5 space-y-3 relative shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Typical Presentation</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeAsset?.isAIGenerated
                    ? "bg-amber-500/10 text-amber-900 border border-amber-500/30"
                    : "bg-blue-500/10 text-blue-900 border border-blue-500/30"
                }`}>
                  {activeAsset?.sourceAttribution || "Clinical Reference"}
                </span>
              </div>

              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-200 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeAsset?.imageUrl} alt={activeAsset?.clinicalDescription} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  {activeAsset?.clinicalDescription}
                </p>

                <div className="space-y-1">
                  <p className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">Hallmark Visual Features:</p>
                  <ul className="text-xs space-y-1 text-slate-700">
                    {activeAsset?.hallmarkFeatures.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* MANDATORY CLINICAL GUARDRAIL & NON-DIAGNOSTIC DISCLAIMER */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-950 text-xs backdrop-blur-md">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Non-Diagnostic Educational Guardrail:</p>
              <p className="leading-relaxed text-amber-900 font-medium">
                Reference photographs illustrate typical morphological patterns and do not constitute a definitive medical diagnosis. Individual immune responses, secondary scratching, and localized melanin variations can significantly alter lesion appearance.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md"
            >
              Close Reference View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
