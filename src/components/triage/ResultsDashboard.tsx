"use client";

import { useState } from "react";
import { RotateCcw, ShieldAlert, AlertCircle, CheckCircle2 } from "lucide-react";
import type { TriageResponse } from "@/lib/triage";

const TONES = [
  {
    id: "i-ii",
    label: "Types I–II",
    caption: "Fair skin — reactions usually appear bright pink or red with distinct central erythema.",
  },
  {
    id: "iii-iv",
    label: "Types III–IV",
    caption: "Medium skin — reactions often appear red-brown and less obvious against surrounding skin.",
  },
  {
    id: "v-vi",
    label: "Types V–VI",
    caption: "Deep skin — reactions often appear violet, grey, hyperpigmented or darker than surrounding skin.",
  },
];

function confidencePercent(value: number | string | undefined) {
  if (value === undefined || value === null) return null;
  const num = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(num)) return null;
  const pct = num <= 1 ? num * 100 : num;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function ResultsDashboard({
  data,
  onRestart,
}: {
  data: TriageResponse;
  onRestart: () => void;
}) {
  const [activeTone, setActiveTone] = useState(TONES[0].id);
  const currentToneObj = TONES.find((t) => t.id === activeTone) || TONES[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Possible Vector Matches
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by multi-node AI & regional vector priors. Educational information, not a formal medical diagnosis.
          </p>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" /> Start over
        </button>
      </header>

      {/* Fitzpatrick Skin Tone Selector Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Fitzpatrick Skin Tone Reference View</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Select skin tone type to view visual presentation guidance.
        </p>
        <div className="mt-3 flex gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTone(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTone === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs italic text-muted-foreground">{currentToneObj.caption}</p>
      </div>

      <section className="space-y-4">
        {data.results.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No vector matches were returned for this analysis payload.
          </p>
        )}
        {data.results.map((result, index) => {
          const pct = confidencePercent(result.confidence);
          return (
            <article
              key={`${result.name}-${index}`}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{result.name}</h2>
                    {result.scientificName && (
                      <p className="text-xs italic text-muted-foreground">{result.scientificName}</p>
                    )}
                  </div>
                </div>
                {pct !== null && (
                  <span className="shrink-0 text-2xl font-bold tabular-nums text-primary">
                    {pct}%
                  </span>
                )}
              </div>

              {pct !== null && (
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              {/* Matched Factors */}
              {result.matchedFactors && result.matchedFactors.length > 0 && (
                <div className="rounded-xl bg-muted/50 p-3 text-xs space-y-1">
                  <span className="font-semibold text-foreground">Matched Diagnostic Criteria:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                    {result.matchedFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alpha-gal / Delayed Risk Warning Card if present */}
              {result.delayedRisks && result.delayedRisks.some(r => r.toLowerCase().includes("alpha-gal")) && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold dark:text-amber-400">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Special Risk Warning: Alpha-gal Syndrome (Red Meat Allergy)</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                    Lone Star Ticks inject galactose-alpha-1,3-galactose ("alpha-gal") sugar molecules via saliva. Symptoms (severe hives, facial swelling, severe GI cramps) typically occur <strong>3 to 8 hours</strong> after consuming beef, pork, lamb, venison, or dairy. Request a specific IgE blood test from your physician if symptoms occur post-ingestion.
                  </p>
                </div>
              )}

              {/* First Aid Guidance */}
              {result.firstAidAdvice && result.firstAidAdvice.length > 0 && (
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-foreground">Immediate First Aid Advice:</span>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    {result.firstAidAdvice.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
