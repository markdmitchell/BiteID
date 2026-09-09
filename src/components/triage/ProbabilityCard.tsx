import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { confidenceOf, nameOf, type TriageResultItem } from "@/lib/triage";

type ProbabilityCardProps = {
  item: TriageResultItem;
  rank: number;
};

export function ProbabilityCard({ item, rank }: ProbabilityCardProps) {
  const value = Math.max(0, Math.min(100, confidenceOf(item)));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setWidth(value), 80 + rank * 90);
    return () => window.clearTimeout(t);
  }, [value, rank]);

  const urgency = item.urgency ?? item.severity;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {rank + 1}
          </span>
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">{nameOf(item)}</h3>
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
        <span className="font-display text-2xl font-bold tabular-nums text-foreground">
          {Math.round(value)}%
        </span>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>

      {(item.description ?? item.summary) && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {item.description ?? item.summary}
        </p>
      )}
    </div>
  );
}
