"use client";

import { AlertTriangle } from "lucide-react";

export function EmergencyModal({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border-2 border-red-600 bg-red-600 p-6 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-7 w-7 text-white" />
          <h2 className="text-xl font-bold tracking-tight">Seek emergency care now</h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-red-50">
          You selected a symptom that can signal a life-threatening reaction or infection. Do not
          wait for an online result. Call your local emergency number (911 in the US) or go to the
          nearest emergency department immediately.
        </p>
        <ul className="mt-4 space-y-1 text-sm text-red-100">
          <li>· If someone is with you, tell them what you selected.</li>
          <li>· Bring the insect with you if it was captured safely.</li>
          <li>· Do not drive yourself if you feel faint.</li>
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href="tel:911"
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition-opacity hover:opacity-90"
          >
            Call emergency services (911)
          </a>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-white/40 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            I understand, continue
          </button>
        </div>
      </div>
    </div>
  );
}
