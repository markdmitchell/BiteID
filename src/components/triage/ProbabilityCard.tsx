import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { creatureReferenceOf } from "@/lib/creature-images";
import { confidenceOf, nameOf, type TriageResultItem } from "@/lib/triage";

type ProbabilityCardProps = {
  item: TriageResultItem;
  rank: number;
  defaultExpanded?: boolean;
};

function DetailList({
  title,
  items,
  variant = "default",
}: {
  title: string;
  items?: string[] | undefined;
  variant?: "default" | "warning" | "success" | "risk";
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-3.5 pt-2.5 border-t border-border/50">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {variant === "warning" && <AlertTriangle className="size-3 text-destructive" />}
        {variant === "risk" && <Clock className="size-3 text-amber-600 dark:text-amber-400" />}
        {variant === "success" && (
          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
        )}
        <span>{title}</span>
      </p>
      <ul className="mt-1.5 space-y-1">
        {items.map((entry, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground">
            <span
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                variant === "warning"
                  ? "bg-destructive"
                  : variant === "risk"
                    ? "bg-amber-500"
                    : variant === "success"
                      ? "bg-emerald-500"
                      : "bg-primary",
              )}
            />
            <span>{entry}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProbabilityCard({
  item,
  rank,
  defaultExpanded = rank === 0,
}: ProbabilityCardProps) {
  const value = Math.max(0, Math.min(100, confidenceOf(item)));
  const [width, setWidth] = useState(0);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    const t = window.setTimeout(() => setWidth(value), 80 + rank * 90);
    return () => window.clearTimeout(t);
  }, [value, rank]);

  const urgency = item.urgency ?? item.severity;
  const creatureReference = creatureReferenceOf(item.id);

  // Clinical confidence tiering
  const confidenceTier =
    value >= 70
      ? {
          label: "High Diagnostic Likelihood",
          color: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
        }
      : value >= 40
        ? {
            label: "Moderate Differential",
            color: "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/25",
          }
        : {
            label: "Rule-Out Consideration",
            color: "text-muted-foreground bg-muted/60 border-border",
          };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 sm:p-5 transition-all shadow-xs",
        rank === 0 ? "border-primary/50 ring-1 ring-primary/25" : "border-border",
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold font-mono",
              rank === 0
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground",
            )}
          >
            {rank + 1}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold leading-snug text-foreground">
                {nameOf(item)}
              </h3>
              {rank === 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="size-2.5" />
                  Primary Suspect
                </span>
              )}
            </div>
            {item.scientificName && (
              <p className="text-xs italic text-muted-foreground">{item.scientificName}</p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold border",
                  confidenceTier.color,
                )}
              >
                {confidenceTier.label}
              </span>
              {urgency && (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize",
                    /emerg|urgent|high|severe/i.test(urgency)
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : /moderate|medium|soon/i.test(urgency)
                        ? "bg-caution/15 text-caution-foreground border border-caution/25"
                        : "bg-primary/10 text-primary border border-primary/20",
                  )}
                >
                  {urgency}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Diagnostic Probability
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-black tabular-nums text-foreground">
              {Math.round(value)}%
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            CI: {Math.max(0, Math.round(value - 6))}%–{Math.min(100, Math.round(value + 6))}%
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? "Hide clinical DDx" : "View clinical DDx"}</span>
            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      </div>

      <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-muted/80">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            rank === 0 ? "bg-primary" : "bg-primary/70",
          )}
          style={{ width: `${width}%` }}
        />
      </div>

      {isExpanded && (
        <div className="mt-4 pt-1 animate-in fade-in-50 duration-200">
          {creatureReference && (
            <figure className="overflow-hidden rounded-xl border border-border bg-muted/30">
              <img
                src={creatureReference.src}
                alt={creatureReference.alt}
                width={1008}
                height={704}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover"
              />
              <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Diagnostic arthropod reference: {nameOf(item)}</span>
                <span className="italic">{item.scientificName}</span>
              </figcaption>
            </figure>
          )}

          {(item.description ?? item.summary) && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {item.description ?? item.summary}
            </p>
          )}

          <DetailList title="Diagnostic Concordance Factors" items={item.matchedFactors} />
          <DetailList
            title="Associated Pathogens & Vector Transmission"
            items={item.associatedPathogens}
            variant="risk"
          />
          <DetailList
            title="Delayed Sequelae to Monitor (24h–4w)"
            items={item.delayedRisks}
            variant="risk"
          />
          <DetailList
            title="Targeted Clinical First-Aid Protocol"
            items={item.firstAidAdvice}
            variant="success"
          />
          <DetailList
            title="Clinical Red Flags (Seek In-Person Care)"
            items={item.warningSignsToWatch}
            variant="warning"
          />
        </div>
      )}
    </div>
  );
}
