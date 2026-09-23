import { useState } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import {
  generateClinicalDiscriminator,
  type DiscriminatorComparison,
} from "@/lib/clinical-discriminator";
import { type TriageResponse, type TriageFormState, type TriageResultItem } from "@/lib/triage";

type ClinicalDiscriminatorCardProps = {
  topResult: TriageResultItem;
  runnerUpResult?: TriageResultItem | null;
  response: TriageResponse;
  form: TriageFormState;
};

export function ClinicalDiscriminatorCard({
  topResult,
  runnerUpResult,
  response,
  form,
}: ClinicalDiscriminatorCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const comparison: DiscriminatorComparison | null = generateClinicalDiscriminator(
    topResult,
    runnerUpResult,
    response,
    form,
  );

  if (!comparison) return null;

  return (
    <div className="rounded-2xl border-2 border-primary/25 bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Stethoscope className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                Clinical Differential &amp; Rule-Out Rationale
              </h3>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                DDx Breakdown
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Comparative evidence distinguishing #{topResult.name} from #{runnerUpResult?.name}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
        >
          <span>{isExpanded ? "Collapse DDx" : "Expand DDx"}</span>
          {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
      </div>

      {/* Hallmark Clinical Differentiator Box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-foreground uppercase tracking-wide text-[10px]">
          <ArrowLeftRight className="size-3.5 text-primary shrink-0" />
          <span>Key Pathognomonic Differentiator (Clinical Tie-Breaker):</span>
        </div>
        <p className="text-xs leading-relaxed text-foreground/90 font-medium">
          {comparison.keyClinicalDifferentiator}
        </p>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-1 animate-in fade-in-50 duration-200">
          {/* Side-by-Side Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Column 1: Primary Suspect (Favored) */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold text-foreground text-xs">
                      #{comparison.primarySuspect.name}
                    </span>
                  </div>
                  {comparison.primarySuspect.scientificName && (
                    <span className="text-[10px] text-muted-foreground italic pl-5 block">
                      {comparison.primarySuspect.scientificName}
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 rounded-md px-2 py-0.5">
                  {comparison.primarySuspect.probability}% Match
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Why Ranked #1 (Rule-In Signs):
                </span>
                <ul className="space-y-1.5 pt-0.5">
                  {comparison.primarySuspect.ruleInRationale.map((reason, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[11px] text-muted-foreground leading-snug"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: Secondary Differential (Down-Ranked) */}
            <div className="rounded-xl border border-border/80 bg-muted/25 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <XCircle className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-bold text-foreground text-xs">
                      #{comparison.secondarySuspect.name}
                    </span>
                  </div>
                  {comparison.secondarySuspect.scientificName && (
                    <span className="text-[10px] text-muted-foreground italic pl-5 block">
                      {comparison.secondarySuspect.scientificName}
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted rounded-md px-2 py-0.5">
                  {comparison.secondarySuspect.probability}% Match
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Why Down-Ranked (Rule-Out Factors):
                </span>
                <ul className="space-y-1.5 pt-0.5">
                  {comparison.secondarySuspect.ruleOutRationale.map((reason, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[11px] text-muted-foreground leading-snug"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Mimicker Alert (If Screened) */}
          {comparison.mimickerRuleOut && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide text-[10px] flex items-center gap-1">
                <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
                <span>Lookalike Exclusion Note: {comparison.mimickerRuleOut.conditionName}</span>
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {comparison.mimickerRuleOut.differentiatingSign}
              </p>
            </div>
          )}

          {/* Clinical Confirmation Guidelines */}
          <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Recommended Physician Physical Exam Verification:</span>
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
              {comparison.recommendedClinicalConfirmation.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
