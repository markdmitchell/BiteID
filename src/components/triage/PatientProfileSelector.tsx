/* eslint-disable react-refresh/only-export-components */
import type { PatientVulnerabilityProfile } from "@/lib/triage";
import { User, Baby, Sparkles, Heart, ShieldAlert } from "lucide-react";

export type PersonaDefinition = {
  key: PatientVulnerabilityProfile;
  label: string;
  shortLabel: string;
  ageRange: string;
  icon: typeof User;
  activeBadge: string;
  clinicalTag: string;
  summary: string;
};

export const PATIENT_PERSONAS: PersonaDefinition[] = [
  {
    key: "standard_adult",
    label: "Standard Adult",
    shortLabel: "Adult",
    ageRange: "18–64 yrs",
    icon: User,
    activeBadge: "bg-primary/10 text-primary border-primary/20",
    clinicalTag: "Standard Protocols",
    summary: "Standard toxicological and first-aid protocols.",
  },
  {
    key: "infant_toddler",
    label: "Infant / Toddler",
    shortLabel: "Infant <2",
    ageRange: "< 2 yrs",
    icon: Baby,
    activeBadge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    clinicalTag: "High Venom-to-Mass Ratio",
    summary: "Weight-based dosing only. Escalated PICU & antivenom protocols.",
  },
  {
    key: "child",
    label: "Child",
    shortLabel: "Child 2–12",
    ageRange: "2–12 yrs",
    icon: Sparkles,
    activeBadge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    clinicalTag: "Reye's & EpiPen Jr Rules",
    summary: "Strict Aspirin avoidance (Reye's syndrome). EpiPen Jr thresholds.",
  },
  {
    key: "pregnant_nursing",
    label: "Pregnant / Nursing",
    shortLabel: "Pregnancy",
    ageRange: "Maternal-Fetal",
    icon: Heart,
    activeBadge: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    clinicalTag: "Teratogen Safeguards",
    summary: "Doxycycline & Ivermectin contraindications. Safe alternatives.",
  },
  {
    key: "geriatric_immune",
    label: "Older Adult / High-Risk",
    shortLabel: "Age 65+",
    ageRange: "65+ yrs / Immune",
    icon: ShieldAlert,
    activeBadge: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    clinicalTag: "Beers Criteria & Sepsis",
    summary: "Anticholinergic delirium/fall cautions. Atypical faint presentations.",
  },
];

type PatientProfileSelectorProps = {
  value: PatientVulnerabilityProfile;
  onChange: (value: PatientVulnerabilityProfile) => void;
  compact?: boolean;
  showSummary?: boolean;
};

export function PatientProfileSelector({
  value,
  onChange,
  compact = false,
  showSummary = true,
}: PatientProfileSelectorProps) {
  const currentPersona = PATIENT_PERSONAS.find((p) => p.key === value) ?? PATIENT_PERSONAS[0];

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {PATIENT_PERSONAS.map((p) => {
          const Icon = p.icon;
          const isSelected = p.key === value;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onChange(p.key)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? `${p.activeBadge} shadow-xs font-semibold ring-1 ring-primary/40`
                  : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{p.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PATIENT_PERSONAS.map((p) => {
          const Icon = p.icon;
          const isSelected = p.key === value;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onChange(p.key)}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? "border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex size-7 items-center justify-center rounded-lg ${
                    isSelected ? p.activeBadge : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">{p.ageRange}</span>
              </div>
              <span className="mt-2 text-xs font-bold text-foreground">{p.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {p.clinicalTag}
              </span>
            </button>
          );
        })}
      </div>

      {showSummary && (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <currentPersona.icon className="size-4 shrink-0 text-primary" />
          <span>
            <strong className="text-foreground">{currentPersona.label}:</strong>{" "}
            {currentPersona.summary}
          </span>
        </div>
      )}
    </div>
  );
}
