import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useReducer, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCard } from "@/components/triage/UploadCard";
import { StepNav } from "@/components/triage/StepNav";
import { EmergencyModal } from "@/components/triage/EmergencyModal";
import { ProbabilityCard } from "@/components/triage/ProbabilityCard";
import { FitzpatrickTabs } from "@/components/triage/FitzpatrickTabs";
import {
  DURATION_OPTIONS,
  FALLBACK_RESPONSE,
  EMERGENCY_SYMPTOMS,
  ENVIRONMENT_OPTIONS,
  initialFormState,
  normalizeResults,
  submitTriage,
  triageReducer,
  type TriageResponse,
} from "@/lib/triage";
import { US_STATE_OPTIONS } from "@/lib/us-states";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BiteID — Bite & Rash Intake (Alpha)" },
      {
        name: "description",
        content:
          "Alpha testing only: upload a photo of a bite or rash, answer a few questions, and see a ranked assessment with a skin-tone reference guide.",
      },
      { property: "og:title", content: "BiteID — Bite & Rash Intake (Alpha)" },
      {
        property: "og:description",
        content:
          "Alpha testing only: upload a photo of a bite or rash, answer a few questions, and see a ranked assessment with a skin-tone reference guide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TriagePage,
});

function TriagePage() {
  const [form, dispatch] = useReducer(triageReducer, initialFormState);
  const [step, setStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [response, setResponse] = useState<TriageResponse | null>(null);

  const hasEmergency = form.symptoms.length > 0;

  useEffect(() => {
    if (hasEmergency) setModalOpen(true);
  }, [form.symptoms.length, hasEmergency]);

  const canContinue =
    (step === 0 && !!form.lesionImage) ||
    (step === 1 && !!form.environment && !!form.duration && !!form.usState) ||
    step === 2;

  async function handleSubmit() {
    setStatus("sending");
    const data = await submitTriage(form).catch(() => FALLBACK_RESPONSE);
    setResponse(data);
    setStatus("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    dispatch({ type: "reset" });
    setStep(0);
    setResponse(null);
    setStatus("idle");
  }

  return (
    <main className="min-h-screen bg-background pb-20 font-sans">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-5" />
          </span>
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="font-display text-base font-semibold text-foreground">BiteID</p>
            <span className="rounded-full bg-caution/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-caution-foreground">
              Alpha — testing only
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Bites, stings and skin reactions</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5">
        {hasEmergency && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-destructive px-4 py-3 text-destructive-foreground">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <p className="text-sm font-medium">
              You reported an emergency symptom. Get urgent medical care now — do not rely on this
              assessment.
            </p>
          </div>
        )}

        {status === "done" && response ? (
          <ResultsDashboard response={response} onReset={reset} />
        ) : (
          <section className="mt-6">
            <StepNav current={step} />

            <div className="mt-7">
              {step === 0 && (
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    Show us the area
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    A close, well-lit photo works best. If you caught the insect, a second photo
                    helps a lot.
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <UploadCard
                      title="Skin lesion"
                      hint="The bite, sting or rash itself."
                      required
                      file={form.lesionImage}
                      onChange={(file) => dispatch({ type: "setLesion", file })}
                    />
                    <UploadCard
                      title="Captured bug"
                      hint="The insect, if you have it."
                      file={form.bugImage}
                      onChange={(file) => dispatch({ type: "setBug", file })}
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    A little context
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Where you were and how long this has been going on.
                  </p>
                  <div className="mt-5 space-y-5 rounded-2xl border border-border bg-card p-5">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Where were you exposed?
                      </label>
                      <Select
                        value={form.environment}
                        onValueChange={(value) => dispatch({ type: "setEnvironment", value })}
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder="Choose an environment" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENVIRONMENT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Which state were you in?
                      </label>
                      <Select
                        value={form.usState}
                        onValueChange={(value) => dispatch({ type: "setUsState", value })}
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder="Choose a state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Which insects are active depends on where and when you were bitten.
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        How long have you had it?
                      </label>
                      <Select
                        value={form.duration}
                        onValueChange={(value) => dispatch({ type: "setDuration", value })}
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder="Choose a duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    Safety check
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tick anything you are experiencing right now.
                  </p>
                  <div className="mt-5 space-y-2">
                    {EMERGENCY_SYMPTOMS.map((symptom) => {
                      const checked = form.symptoms.includes(symptom.value);
                      return (
                        <label
                          key={symptom.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                            checked
                              ? "border-destructive bg-destructive/5"
                              : "border-border bg-card hover:border-primary/40"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() =>
                              dispatch({ type: "toggleSymptom", value: symptom.value })
                            }
                          />
                          <span className="text-sm font-medium text-foreground">
                            {symptom.label}
                          </span>
                        </label>
                      );
                    })}

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
                      <Checkbox
                        checked={form.noneOfThese}
                        onCheckedChange={(value) =>
                          dispatch({ type: "setNoneOfThese", value: value === true })
                        }
                      />
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ShieldCheck className="size-4 text-primary" />
                        None of these apply to me
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || status === "sending"}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>

              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <Button onClick={handleSubmit}>
                    {status === "sending" && <Loader2 className="size-4 animate-spin" />}
                    {status === "sending" ? "Sending your intake…" : "Get assessment"}
                  </Button>
                  {hasEmergency && (
                    <span className="text-xs font-medium text-destructive">
                      Get emergency care first.
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Alpha version — for testing only.</span>{" "}
          BiteID is an unfinished prototype and is not a medical service. This tool provides general
          information only and is not a diagnosis. Always consult a qualified clinician about a
          bite, sting or changing skin lesion.
        </p>
      </div>

      <EmergencyModal open={modalOpen} onDismiss={() => setModalOpen(false)} />
    </main>
  );
}

function getAdditionalGuidance(
  rawGuidance: string | undefined,
  lesionText: string | undefined,
  firstAid: string[] | undefined,
  warningSigns: string[] | undefined,
  isErythemaMigrans: boolean,
): string | null {
  if (!rawGuidance) return null;

  const paragraphs = rawGuidance
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const filtered = paragraphs.filter((p) => {
    if (lesionText && (p.includes(lesionText) || lesionText.includes(p))) {
      return false;
    }
    if (firstAid?.some((fa) => p.includes(fa) || fa.includes(p))) {
      return false;
    }
    if (warningSigns?.some((ws) => p.includes(ws) || ws.includes(p))) {
      return false;
    }
    if (/^watch for:\s*/i.test(p)) {
      return false;
    }
    if (isErythemaMigrans && /erythema migrans|lyme disease|expanding ring-shaped rash/i.test(p)) {
      return false;
    }
    return true;
  });

  return filtered.length > 0 ? filtered.join("\n\n") : null;
}

function ResultsDashboard({
  response,
  onReset,
}: {
  response: TriageResponse;
  onReset: () => void;
}) {
  const results = normalizeResults(response);
  const rawGuidance = response.guidance ?? response.advice;
  const topResult = results[0];
  const secondaryResults = results.slice(1);

  const isErythemaMigrans =
    Boolean(response.hasErythemaMigrans) ||
    /erythema migrans|bull'?s?[- ]?eye|annular target/i.test(topResult?.description ?? "") ||
    /erythema migrans|bull'?s?[- ]?eye|annular target/i.test(
      String(response.lesionReading ?? ""),
    ) ||
    Boolean(
      topResult?.matchedFactors?.some((f) => /annular|target rash|erythema migrans/i.test(f)),
    ) ||
    (topResult?.id === "blacklegged_tick" &&
      (topResult.confidence ?? 0) >= 40 &&
      Boolean(topResult?.matchedFactors?.some((f) => /annular|target|expanding/i.test(f))));

  const additionalGuidance = getAdditionalGuidance(
    rawGuidance,
    topResult?.description,
    topResult?.firstAidAdvice,
    topResult?.warningSignsToWatch,
    isErythemaMigrans,
  );

  const hasActionContent =
    (topResult?.firstAidAdvice && topResult.firstAidAdvice.length > 0) ||
    (topResult?.warningSignsToWatch && topResult.warningSignsToWatch.length > 0) ||
    (topResult?.delayedRisks && topResult.delayedRisks.length > 0) ||
    additionalGuidance;

  return (
    <section className="mt-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Your assessment
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ranked from most to least likely, based on what you shared.
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="size-4" />
          Start over
        </Button>
      </div>

      {topResult ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Primary Match
            </span>
            <ProbabilityCard
              key={`top-${topResult.name ?? topResult.condition}`}
              item={topResult}
              rank={0}
              defaultExpanded={true}
            />
          </div>

          {isErythemaMigrans && (
            <div className="rounded-2xl border-2 border-caution/40 bg-caution/10 p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3.5">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-caution-foreground" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">
                      Clinical Notice: Erythema Migrans & Lyme Disease
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-caution/20 px-2.5 py-0.5 text-xs font-semibold text-caution-foreground">
                      Early Lyme Indicator
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    This lesion shows strong visual characteristics of{" "}
                    <strong>Erythema Migrans</strong> (an expanding annular or bullseye rash), which
                    is a hallmark early symptom of <strong>Lyme disease</strong> transmitted by
                    ticks.
                  </p>
                  <p className="text-sm leading-relaxed text-foreground font-medium">
                    <strong>Medical Attention Recommended:</strong> Consult a physician,
                    dermatologist, or urgent care clinician promptly. Early clinical diagnosis and
                    standard antibiotic therapy (such as doxycycline) are highly effective at curing
                    Lyme disease and preventing chronic joint, neurological, or cardiac
                    complications.
                  </p>
                  <div className="rounded-xl border border-caution/30 bg-card/60 p-3 text-xs leading-relaxed text-muted-foreground">
                    <strong>Clinical Tip:</strong> Use a ballpoint pen to lightly trace the outer
                    border of the rash and take a photo next to a coin or ruler. This helps your
                    healthcare provider verify whether the erythema is actively expanding over 24–48
                    hours.
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasActionContent && (
            <div className="rounded-2xl border-2 border-primary/25 bg-primary/5 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-primary">
                <HeartPulse className="size-5 shrink-0" />
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                  What to do next
                </h2>
                <span className="ml-auto inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Recommended Action
                </span>
              </div>

              <div className="mt-4 space-y-4 rounded-xl border border-primary/15 bg-card/80 p-4 sm:p-5 backdrop-blur-xs">
                {topResult.firstAidAdvice && topResult.firstAidAdvice.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                      First aid
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {topResult.firstAidAdvice.map((advice, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {topResult.warningSignsToWatch && topResult.warningSignsToWatch.length > 0 && (
                  <div
                    className={
                      topResult.firstAidAdvice?.length ? "border-t border-border/50 pt-3.5" : ""
                    }
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-caution-foreground">
                      Warning signs to watch
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {topResult.warningSignsToWatch.map((sign, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-caution" />
                          <span>{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {topResult.delayedRisks && topResult.delayedRisks.length > 0 && (
                  <div
                    className={
                      topResult.firstAidAdvice?.length || topResult.warningSignsToWatch?.length
                        ? "border-t border-border/50 pt-3.5"
                        : ""
                    }
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Delayed risks
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {topResult.delayedRisks.map((risk, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {additionalGuidance && (
                  <div
                    className={
                      topResult.firstAidAdvice?.length ||
                      topResult.warningSignsToWatch?.length ||
                      topResult.delayedRisks?.length
                        ? "border-t border-border/50 pt-3.5"
                        : ""
                    }
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {additionalGuidance}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <FitzpatrickTabs resultId={topResult.id} resultName={topResult.name} />

          {secondaryResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Other possibilities considered ({secondaryResults.length})
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Alternative matches with lower probability scores.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {secondaryResults.map((item, idx) => (
                  <ProbabilityCard
                    key={`${idx + 1}-${item.name ?? item.condition}`}
                    item={item}
                    rank={idx + 1}
                    defaultExpanded={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            The service did not return any ranked findings for this intake.
          </div>
          {rawGuidance && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                What to do next
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {rawGuidance}
              </p>
            </div>
          )}
        </div>
      )}

      {response.disclaimer && (
        <p className="rounded-2xl bg-muted px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          {response.disclaimer}
        </p>
      )}
    </section>
  );
}
