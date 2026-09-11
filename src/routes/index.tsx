import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useReducer, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
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
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<TriageResponse | null>(null);

  const hasEmergency = form.symptoms.length > 0;

  useEffect(() => {
    if (hasEmergency) setModalOpen(true);
  }, [form.symptoms.length, hasEmergency]);

  const canContinue =
    (step === 0 && !!form.lesionImage) ||
    (step === 1 && !!form.environment && !!form.duration) ||
    step === 2;

  async function handleSubmit() {
    setStatus("sending");
    setError(null);
    try {
      const data = await submitTriage(form);
      setResponse(data);
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong sending your intake.");
      setStatus("error");
    }
  }

  function reset() {
    dispatch({ type: "reset" });
    setStep(0);
    setResponse(null);
    setStatus("idle");
    setError(null);
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
                  <Button onClick={handleSubmit} disabled={status === "sending"}>
                    {status === "sending" && <Loader2 className="size-4 animate-spin" />}
                    {status === "sending"
                      ? "Sending your intake…"
                      : status === "error"
                        ? "Try again"
                        : "Get assessment"}
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

function ResultsDashboard({
  response,
  onReset,
}: {
  response: TriageResponse;
  onReset: () => void;
}) {
  const results = normalizeResults(response);
  const guidance = response.guidance ?? response.advice;

  return (
    <section className="mt-6 space-y-5">
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

      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((item, i) => (
            <ProbabilityCard key={`${i}-${item.name ?? item.condition}`} item={item} rank={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          The service did not return any ranked findings for this intake.
        </div>
      )}

      {guidance && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold text-foreground">What to do next</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {guidance}
          </p>
        </div>
      )}

      <FitzpatrickTabs />

      {response.disclaimer && (
        <p className="rounded-2xl bg-muted px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          {response.disclaimer}
        </p>
      )}
    </section>
  );
}
