import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, Phone, RotateCcw } from "lucide-react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

export function TriageErrorFallback({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "triage_route" });
    headingRef.current?.focus();
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
      <div role="alert" className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <span className="inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
          BiteID Alpha — testing only
        </span>
        <AlertTriangle className="mx-auto mt-4 size-8 text-muted-foreground" aria-hidden />
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-xl font-semibold text-foreground outline-none">
          Something went wrong with this intake
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page hit an unexpected problem. Your photos were not sent anywhere new. Reloading starts a fresh intake.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="size-4" aria-hidden /> Reload page
          </button>
          <button
            type="button"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try again
          </button>
        </div>
        <div className="mt-6 rounded-md border border-destructive/50 bg-destructive/5 p-3 text-left text-sm text-foreground">
          If you have trouble breathing, facial swelling, or spreading redness with fever, call 911 now.
          <a href="tel:911" className="mt-2 flex min-h-11 items-center gap-2 font-semibold text-destructive underline">
            <Phone className="size-4" aria-hidden /> Call 911
          </a>
        </div>
      </div>
    </main>
  );
}
