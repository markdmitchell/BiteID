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
  RotateCcw,
  Sparkles,
  Check,
  Compass,
} from "lucide-react";
import {
  generateClinicalDiscriminator,
  type DiscriminatorComparison,
  type ForkOption,
} from "@/lib/clinical-discriminator";
import { type TriageResponse, type TriageFormState, type TriageResultItem } from "@/lib/triage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ClinicalDiscriminatorCardProps = {
  topResult: TriageResultItem;
  runnerUpResult?: TriageResultItem | null;
  response: TriageResponse;
  form: TriageFormState;
  forkChoice?: "primary" | "secondary" | "neutral";
  onForkChoiceChange?: (choice: "primary" | "secondary" | "neutral", activeOption?: ForkOption) => void;
};

export function ClinicalDiscriminatorCard({
  topResult,
  runnerUpResult,
  response,
  form,
  forkChoice = "neutral",
  onForkChoiceChange,
}: ClinicalDiscriminatorCardProps) {
  const [isDdxExpanded, setIsDdxExpanded] = useState(false);

  const comparison: DiscriminatorComparison | null = generateClinicalDiscriminator(
    topResult,
    runnerUpResult,
    response,
    form,
  );

  if (!comparison) return null;

  const fork = comparison.forkInTheRoad;
  const isForkActive = forkChoice === "primary" || forkChoice === "secondary";
  const activeOption =
    forkChoice === "primary"
      ? fork.primaryOption
      : forkChoice === "secondary"
        ? fork.secondaryOption
        : undefined;

  const handleSelectFork = (choice: "primary" | "secondary") => {
    if (!onForkChoiceChange) return;
    if (forkChoice === choice) {
      // Toggle off to neutral if clicked again
      onForkChoiceChange("neutral", undefined);
    } else {
      const option = choice === "primary" ? fork.primaryOption : fork.secondaryOption;
      onForkChoiceChange(choice, option);
    }
  };

  const handleResetFork = () => {
    if (onForkChoiceChange) {
      onForkChoiceChange("neutral", undefined);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-card p-4 sm:p-5 shadow-xs space-y-5">
      {/* Dynamic Fork in the Road Section */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Compass className="size-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                  Dynamic Fork in the Road: Break the Differential Tie
                </h3>
                {fork.isAmbiguous ? (
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    Close Match ({fork.probabilityDelta}% delta)
                  </span>
                ) : (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Diagnostic Tie-Breaker
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Our vision model found overlapping features between #{topResult.name} and #{runnerUpResult?.name}.
              </p>
            </div>
          </div>

          {isForkActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFork}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 self-start sm:self-auto"
            >
              <RotateCcw className="size-3" />
              <span>Reset to AI Baseline</span>
            </Button>
          )}
        </div>

        {/* Dynamic Question Prompt */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground/90 space-y-1">
          <p className="font-semibold text-primary flex items-center gap-1.5">
            <HelpCircle className="size-3.5 shrink-0" />
            <span>Clinical Discriminator Question:</span>
          </p>
          <p className="font-medium text-foreground text-xs leading-relaxed">
            {fork.question}
          </p>
        </div>

        {/* Active Fork Alert Feedback */}
        {isForkActive && activeOption && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs flex items-center justify-between gap-3 animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-foreground leading-tight">
                <strong className="text-emerald-700 dark:text-emerald-300">
                  Tie-Breaker Active:
                </strong>{" "}
                Differential recalibrated to favor{" "}
                <span className="font-bold underline">{activeOption.vectorName}</span> (+{activeOption.boostAmount}%) based on your confirmed exposure pattern.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFork}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground shrink-0 underline"
            >
              Undo
            </button>
          </div>
        )}

        {/* Interactive Option Cards (Side-by-Side or Stacked) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Option A: Primary Suspect */}
          <div
            className={cn(
              "rounded-xl border-2 p-4 text-xs transition-all space-y-3 cursor-pointer flex flex-col justify-between",
              forkChoice === "primary"
                ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-xs"
                : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30",
            )}
            onClick={() => handleSelectFork("primary")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectFork("primary");
              }
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                  Option A • Correlates with {fork.primaryOption.vectorName}
                </span>
                {forkChoice === "primary" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-bold">
                    <Check className="size-3" /> Selected
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-medium">Click to select</span>
                )}
              </div>
              <h4 className="font-display text-sm font-bold text-foreground">
                {fork.primaryOption.title}
              </h4>
              <ul className="space-y-1.5 text-muted-foreground text-[11.5px] pt-1">
                {fork.primaryOption.clues.map((clue, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span>{clue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-border/40">
              <p className="text-[10.5px] text-muted-foreground italic mb-2">
                {fork.primaryOption.clinicalSignificance}
              </p>
              <Button
                type="button"
                size="sm"
                variant={forkChoice === "primary" ? "default" : "outline"}
                className={cn(
                  "w-full text-xs font-semibold h-8",
                  forkChoice === "primary" && "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectFork("primary");
                }}
              >
                {forkChoice === "primary" ? (
                  <>
                    <Check className="size-3.5 mr-1" />
                    Selected ({fork.primaryOption.vectorName} Favored)
                  </>
                ) : (
                  `Confirm ${fork.primaryOption.vectorName} Clues`
                )}
              </Button>
            </div>
          </div>

          {/* Option B: Secondary Suspect */}
          <div
            className={cn(
              "rounded-xl border-2 p-4 text-xs transition-all space-y-3 cursor-pointer flex flex-col justify-between",
              forkChoice === "secondary"
                ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-xs"
                : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30",
            )}
            onClick={() => handleSelectFork("secondary")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectFork("secondary");
              }
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                  Option B • Correlates with {fork.secondaryOption.vectorName}
                </span>
                {forkChoice === "secondary" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-bold">
                    <Check className="size-3" /> Selected
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-medium">Click to select</span>
                )}
              </div>
              <h4 className="font-display text-sm font-bold text-foreground">
                {fork.secondaryOption.title}
              </h4>
              <ul className="space-y-1.5 text-muted-foreground text-[11.5px] pt-1">
                {fork.secondaryOption.clues.map((clue, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span>{clue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-border/40">
              <p className="text-[10.5px] text-muted-foreground italic mb-2">
                {fork.secondaryOption.clinicalSignificance}
              </p>
              <Button
                type="button"
                size="sm"
                variant={forkChoice === "secondary" ? "default" : "outline"}
                className={cn(
                  "w-full text-xs font-semibold h-8",
                  forkChoice === "secondary" && "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectFork("secondary");
                }}
              >
                {forkChoice === "secondary" ? (
                  <>
                    <Check className="size-3.5 mr-1" />
                    Selected ({fork.secondaryOption.vectorName} Favored)
                  </>
                ) : (
                  `Confirm ${fork.secondaryOption.vectorName} Clues`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hallmark Clinical Differentiator Box */}
      <div className="rounded-xl border border-primary/20 bg-muted/30 p-3.5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-foreground uppercase tracking-wide text-[10px]">
            <ArrowLeftRight className="size-3.5 text-primary shrink-0" />
            <span>Pathognomonic Differential Differentiator:</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDdxExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
          >
            <span>{isDdxExpanded ? "Hide Detailed DDx" : "View Detailed DDx"}</span>
            {isDdxExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>
        <p className="text-xs leading-relaxed text-foreground/90 font-medium">
          {comparison.keyClinicalDifferentiator}
        </p>
      </div>

      {/* Expanded DDx Deep-Dive */}
      {isDdxExpanded && (
        <div className="space-y-4 pt-1 border-t border-border/60 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Column 1: Primary Suspect */}
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
                    <span className="text-[10px] text-muted-foreground italic pl-5">
                      {comparison.primarySuspect.scientificName}
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  {comparison.primarySuspect.probability}% Likelihood
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mb-1.5">
                  Rule-In Clinical Evidence:
                </p>
                <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                  {comparison.primarySuspect.ruleInRationale.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="size-1 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: Secondary Suspect */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <XCircle className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-bold text-foreground text-xs">
                      #{comparison.secondarySuspect.name}
                    </span>
                  </div>
                  {comparison.secondarySuspect.scientificName && (
                    <span className="text-[10px] text-muted-foreground italic pl-5">
                      {comparison.secondarySuspect.scientificName}
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {comparison.secondarySuspect.probability}% Likelihood
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Clinical Rule-Out Nuances:
                </p>
                <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                  {comparison.secondarySuspect.ruleOutRationale.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="size-1 rounded-full bg-muted-foreground shrink-0 mt-1.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Mimicker Alert if present */}
          {comparison.mimickerRuleOut && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-[11px]">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span>Non-Vector Mimic Screened: {comparison.mimickerRuleOut.conditionName}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                {comparison.mimickerRuleOut.differentiatingSign}
              </p>
            </div>
          )}

          {/* Confirmation Directives */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 text-xs space-y-2">
            <p className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="size-3.5 text-primary shrink-0" />
              <span>Recommended In-Person Confirmation Steps:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              {comparison.recommendedClinicalConfirmation.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
