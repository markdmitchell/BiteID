"use client";

import { AlertOctagon, PhoneCall, ShieldAlert, X } from "lucide-react";
import { EmergencySymptoms } from "@/lib/schema";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptoms: EmergencySymptoms;
}

export function EmergencyModal({ isOpen, onClose, symptoms }: EmergencyModalProps) {
  if (!isOpen) return null;

  const activeRedFlags: string[] = [];
  if (symptoms.difficultyBreathing) activeRedFlags.push("Difficulty breathing or wheezing");
  if (symptoms.facialSwelling) activeRedFlags.push("Swelling of face, lips, throat, or tongue");
  if (symptoms.dizzinessOrConfusion) activeRedFlags.push("Severe dizziness, confusion, or lightheadedness");
  if (symptoms.spreadingHives) activeRedFlags.push("Rapidly spreading hives or body-wide rash");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-200"
    >
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-red-500 overflow-hidden relative glow-red">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0 animate-pulse border border-red-500/30">
            <AlertOctagon className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h2 id="emergency-modal-title" className="text-xl font-extrabold tracking-tight text-red-700">
              Red-Flag Emergency Interception
            </h2>
            <p className="text-xs font-semibold text-red-600">Immediate Medical Attention Recommended</p>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-5 backdrop-blur-md">
          <p className="text-sm text-red-950 font-bold mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
            Detected Potential Anaphylaxis / Systemic Symptoms:
          </p>
          <ul className="list-disc list-inside text-sm text-red-900 space-y-1 font-semibold pl-1">
            {activeRedFlags.length > 0 ? (
              activeRedFlags.map((flag, idx) => <li key={idx}>{flag}</li>)
            ) : (
              <li>Red-flag systemic symptom indicated.</li>
            )}
          </ul>
        </div>

        <p className="text-sm text-slate-700 mb-6 leading-relaxed">
          Systemic symptoms after an insect or spider bite can escalate rapidly into life-threatening anaphylaxis or severe envenomation. Online photo assessment is <strong>not suitable</strong> for emergency symptoms.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <a
            href="tel:911"
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-red-500/30 transition-all text-center text-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 911 Immediately</span>
          </a>

          <a
            href="tel:18002221222"
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-500/30 transition-all text-center text-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Poison Control (US)</span>
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 py-2 transition-colors"
        >
          Review or modify symptoms
        </button>
      </div>
    </div>
  );
}
