import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Photos", "Context", "Safety check"];

export function StepNav({ current }: { current: number }) {
  return (
    <ol aria-label="Assessment progress" className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 items-center gap-2 sm:gap-3"
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary/10 text-primary",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs font-medium sm:text-sm",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={cn("h-px flex-1", done ? "bg-primary/50" : "bg-border")}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
