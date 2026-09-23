import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { creatureReferenceOf } from "@/lib/creature-images";
import { confidenceOf, nameOf, type TriageResultItem } from "@/lib/triage";

type ProbabilityCardProps = {
  item: TriageResultItem;
  rank: number;
  defaultExpanded?: boolean;
};

function DetailList({ title, items }: { title: string; items?: string[] | undefined }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {items.map((entry, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
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

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-shadow sm:p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
            {rank + 1}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold leading-snug text-foreground">{nameOf(item)}</h3>
            {item.scientificName && (
              <p className="text-xs italic text-muted-foreground">{item.scientificName}</p>
            )}
            {urgency && (
              <span
                className={cn(
                  "mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                  /emerg|urgent|high|severe/i.test(urgency)
                    ? "bg-destructive/10 text-destructive"
                    : /moderate|medium|soon/i.test(urgency)
                      ? "bg-caution/15 text-caution-foreground"
                      : "bg-primary/10 text-primary",
                )}
              >
                {urgency}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-display text-2xl font-bold tabular-nums text-foreground">
            {Math.round(value)}%
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? "Hide details" : "View details"}</span>
            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
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
              <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                AI-generated visual reference — not confirmation
              </figcaption>
            </figure>
          )}

          {(item.description ?? item.summary) && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {item.description ?? item.summary}
            </p>
          )}

          <DetailList title="Why it matched" items={item.matchedFactors} />
          <DetailList title="Can carry" items={item.associatedPathogens} />
        </div>
      )}
    </div>
  );
}
