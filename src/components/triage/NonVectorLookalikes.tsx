import { useState } from "react";
import { type LookalikeItem, getLookalikeDifferentials } from "@/lib/lookalikes";
import { AlertCircle, Eye, ShieldCheck, Stethoscope, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type NonVectorLookalikesProps = {
  topResultId?: string | undefined;
  isErythemaMigrans?: boolean | undefined;
};

export function NonVectorLookalikes({
  topResultId,
  isErythemaMigrans = false,
}: NonVectorLookalikesProps) {
  const lookalikes = getLookalikeDifferentials(topResultId, isErythemaMigrans);
  const [selectedId, setSelectedId] = useState<string>(lookalikes[0]?.id ?? "tinea_corporis");

  const currentItem = lookalikes.find((item) => item.id === selectedId) ?? lookalikes[0];
  if (!currentItem) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="size-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-foreground">
              Could this be something else?
            </h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              Non-Arthropod Lookalikes
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            In clinical practice, infections and contact allergies frequently mimic insect bites or
            Lyme rash. Compare your lesion against these common mimics with corroborated visual
            references.
          </p>
        </div>
      </div>

      {/* Tabs / Switcher */}
      <div className="flex flex-wrap gap-2">
        {lookalikes.map((item) => {
          const isSelected = item.id === currentItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border",
                isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <span>{item.name}</span>
              <ChevronRight
                className={cn(
                  "size-3.5 transition-transform",
                  isSelected && "rotate-90 text-primary",
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Active Lookalike Card */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-4 animate-in fade-in-50 duration-150">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Visual Reference Image */}
          <div className="md:col-span-5 space-y-2">
            <figure className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
              <img
                src={currentItem.image}
                alt={currentItem.imageAlt}
                width={700}
                height={466}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover"
              />
              <figcaption className="border-t border-border/60 bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Eye className="size-3 text-primary shrink-0" />
                <span>AI-generated dermatological reference photo</span>
              </figcaption>
            </figure>

            <div className="rounded-lg border border-border/60 bg-card p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground text-[11px] uppercase tracking-wide">
                Frequently Confused With:
              </p>
              <p className="text-foreground font-medium">
                {currentItem.mimickedVectors.join(" or ")}
              </p>
            </div>
          </div>

          {/* Clinical Details */}
          <div className="md:col-span-7 space-y-3.5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground">
                  {currentItem.name}
                </h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {currentItem.category}
                </span>
              </div>
              <p className="text-xs italic text-muted-foreground mt-0.5">
                {currentItem.scientificOrMedicalTerm}
              </p>
            </div>

            <p className="text-xs leading-relaxed text-foreground">{currentItem.summary}</p>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed">
              <span className="font-semibold text-primary block text-[11px] uppercase tracking-wide mb-0.5">
                Why this match was considered:
              </span>
              <span className="text-foreground">{currentItem.whyConsidered}</span>
            </div>

            {/* Differentiating Table */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                How a Clinician Distinguishes Them
              </h4>
              <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden text-xs">
                {currentItem.differentiatingFeatures.map((df, idx) => (
                  <div
                    key={idx}
                    className="p-3 space-y-1.5 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-2"
                  >
                    <span className="font-semibold text-foreground sm:col-span-1 text-[11px]">
                      {df.feature}
                    </span>
                    <div className="sm:col-span-2 space-y-1 text-[11px] leading-relaxed">
                      <p>
                        <strong className="text-primary">{currentItem.name.split(" ")[0]}:</strong>{" "}
                        <span className="text-foreground">{df.lookalikeSign}</span>
                      </p>
                      <p>
                        <strong className="text-muted-foreground">Arthropod Bite:</strong>{" "}
                        <span className="text-muted-foreground">{df.biteSign}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Workup Tips */}
            <div className="rounded-lg border border-border/60 bg-card p-3 text-xs space-y-1 text-muted-foreground">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px] uppercase tracking-wide">
                <AlertCircle className="size-3 text-caution-foreground" />
                <span>Diagnostic Workup by a Physician:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-foreground">
                {currentItem.clinicalEvaluationTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5 text-primary shrink-0" />
        <span>
          Visual reference comparison is educational and non-diagnostic. Only a licensed physician
          or dermatologist can conduct clinical tests (KOH scrapings, bacterial cultures, or skin
          biopsies).
        </span>
      </div>
    </div>
  );
}
