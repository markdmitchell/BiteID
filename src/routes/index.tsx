import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Compass,
  Eye,
  FileText,
  HeartPulse,
  Loader2,
  MapPin,
  Printer,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  WifiOff,
  Zap,
} from "lucide-react";
import biteIdIcon from "@/assets/biteid-icon.png";
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
import { ClinicalSummaryModal } from "@/components/triage/ClinicalSummaryModal";
import { UrgentCareLocator } from "@/components/triage/UrgentCareLocator";
import { NonVectorLookalikes } from "@/components/triage/NonVectorLookalikes";
import { RashExpansionTracker } from "@/components/triage/RashExpansionTracker";
import { OfflineFieldKitModal } from "@/components/triage/OfflineFieldKitModal";
import { SnakebiteSurvivalModal } from "@/components/triage/SnakebiteSurvivalModal";
import { KnownCulpritModal } from "@/components/triage/KnownCulpritModal";
import {
  BODY_LOCATION_OPTIONS,
  DURATION_OPTIONS,
  FALLBACK_RESPONSE,
  EMERGENCY_SYMPTOMS,
  ENVIRONMENT_OPTIONS,
  SENSATION_OPTIONS,
  initialFormState,
  normalizeResults,
  submitTriage,
  triageReducer,
  type TriageFormState,
  type TriageResponse,
} from "@/lib/triage";
import { US_STATE_OPTIONS } from "@/lib/us-states";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BiteID - Identify Bites, Stings, and Skin Reactions" },
      {
        name: "description",
        content:
          "Alpha testing only: upload a photo of a bite or rash, answer a few questions, and see a ranked assessment with a skin-tone reference guide.",
      },
      { property: "og:title", content: "BiteID - Identify Bites, Stings, and Skin Reactions" },
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
  const [fieldKitOpen, setFieldKitOpen] = useState(false);
  const [snakebiteOpen, setSnakebiteOpen] = useState(false);
  const [knownCulpritOpen, setKnownCulpritOpen] = useState(false);
  const [selectedCulpritId, setSelectedCulpritId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [response, setResponse] = useState<TriageResponse | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  const hasEmergency = form.symptoms.length > 0;

  useEffect(() => {
    if (hasEmergency) setModalOpen(true);
  }, [form.symptoms, hasEmergency]);

  useEffect(() => {
    if (status === "done") resultsHeadingRef.current?.focus();
  }, [status]);

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
      <header className="border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90"
              aria-label="BiteID home"
            >
              <img src={biteIdIcon} alt="BiteID" className="size-9 shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-foreground">BiteID</p>
                <span className="block text-[10px] font-semibold uppercase text-caution-foreground">
                  Alpha · testing only
                </span>
              </div>
            </Link>
            <p className="hidden text-xs text-muted-foreground sm:inline">
              Bites, stings and skin reactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Identify a known bug"
              onClick={() => {
                setSelectedCulpritId(null);
                setKnownCulpritOpen(true);
              }}
              className="flex items-center gap-1.5 border-primary/30 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <Zap className="size-3.5 text-primary" />
              <span className="hidden md:inline">Known Bug</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Open snakebite emergency guidance"
              onClick={() => setSnakebiteOpen(true)}
              className="flex items-center gap-1.5 border-destructive/40 text-xs font-semibold text-destructive hover:bg-destructive/10"
            >
              <ShieldAlert className="size-3.5 text-destructive" />
              <span className="hidden md:inline">Snakebite SOS</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Open field kit"
              onClick={() => setFieldKitOpen(true)}
              className="flex items-center gap-1.5 border-primary/30 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <Compass className="size-3.5 text-primary" />
              <span className="hidden md:inline">Field Kit</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5">
        {hasEmergency && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-5 flex items-start gap-3 rounded-lg bg-destructive px-4 py-3 text-destructive-foreground"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <p className="text-sm font-medium">
              You reported an emergency symptom. Get urgent medical care now — do not rely on this
              assessment.
            </p>
          </div>
        )}

        {status === "done" && response ? (
          <ResultsDashboard
            response={response}
            form={form}
            hasEmergency={hasEmergency}
            onReset={reset}
            onOpenFieldKit={() => setFieldKitOpen(true)}
            onOpenSnakebite={() => setSnakebiteOpen(true)}
            onOpenKnownCulprit={() => {
              setSelectedCulpritId(null);
              setKnownCulpritOpen(true);
            }}
            headingRef={resultsHeadingRef}
          />
        ) : (
          <section className="mt-6">
            {step === 0 && (
              <div className="mb-7 rounded-lg border border-primary/25 bg-card p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase text-primary">
                      <Zap className="size-3" />
                      Skip The Photo Quiz
                    </span>
                    <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
                      Already know what bit or stung you?
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                      Saw the tick, scorpion, bee, spider, or ant? Get instant clinical first-aid
                      steps, dangerous folklore myths to avoid, and hospital red flags without an AI
                      scan.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedCulpritId(null);
                      setKnownCulpritOpen(true);
                    }}
                    className="w-full shrink-0 gap-2 text-xs font-semibold sm:w-auto"
                  >
                    <span>I Know What Bit Me</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {step > 0 && <StepNav current={step} />}

            <div className={step === 0 ? "" : "mt-7"}>
              {step === 0 && (
                <div>
                  <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
                    Not sure? Upload a photo.
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    A close, well-lit photo works best. If you caught the insect, a second photo
                    helps a lot.
                  </p>
                  <div className="mt-5">
                    <StepNav current={step} />
                  </div>
                  <div className="mt-6 space-y-4">
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
                      compact
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
                    A little context
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Where you were and how long this has been going on.
                  </p>
                  <div className="mt-5 space-y-7 rounded-lg border border-border bg-card p-4 sm:p-6">
                    <fieldset className="space-y-5">
                      <legend className="font-display text-base font-semibold text-foreground">
                        Exposure
                      </legend>
                      <div>
                        <label
                          htmlFor="environment"
                          className="text-sm font-medium text-foreground"
                        >
                          Where were you exposed?
                        </label>
                        <Select
                          value={form.environment}
                          onValueChange={(value) => dispatch({ type: "setEnvironment", value })}
                        >
                          <SelectTrigger id="environment" className="mt-2 w-full">
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
                        <label htmlFor="state" className="text-sm font-medium text-foreground">
                          Which state were you in?
                        </label>
                        <Select
                          value={form.usState}
                          onValueChange={(value) => dispatch({ type: "setUsState", value })}
                        >
                          <SelectTrigger id="state" className="mt-2 w-full">
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
                    </fieldset>
                    <fieldset className="space-y-5 border-t border-border pt-6">
                      <legend className="font-display text-base font-semibold text-foreground">
                        Reaction details
                      </legend>
                      <div>
                        <label
                          htmlFor="body-location"
                          className="text-sm font-medium text-foreground"
                        >
                          Where on your body is the bite?
                        </label>
                        <Select
                          value={form.bodyLocation}
                          onValueChange={(value) => dispatch({ type: "setBodyLocation", value })}
                        >
                          <SelectTrigger id="body-location" className="mt-2 w-full">
                            <SelectValue placeholder="Choose a body location" />
                          </SelectTrigger>
                          <SelectContent>
                            {BODY_LOCATION_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Different insects target specific areas like ankles, waistbands, or
                          exposed skin.
                        </p>
                      </div>
                      <div>
                        <label htmlFor="sensation" className="text-sm font-medium text-foreground">
                          How does it feel?
                        </label>
                        <Select
                          value={form.sensation}
                          onValueChange={(value) => dispatch({ type: "setSensation", value })}
                        >
                          <SelectTrigger id="sensation" className="mt-2 w-full">
                            <SelectValue placeholder="Choose a sensation" />
                          </SelectTrigger>
                          <SelectContent>
                            {SENSATION_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Tick bites are often painless, while bees and wasps cause immediate sharp
                          pain.
                        </p>
                      </div>
                      <div>
                        <label htmlFor="duration" className="text-sm font-medium text-foreground">
                          How long have you had it?
                        </label>
                        <Select
                          value={form.duration}
                          onValueChange={(value) => dispatch({ type: "setDuration", value })}
                        >
                          <SelectTrigger id="duration" className="mt-2 w-full">
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
                    </fieldset>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
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
                          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
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

                    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
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

            <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-3 border-t border-border pt-5">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || status === "sending"}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>

              {step < 2 ? (
                <div className="justify-self-end text-right">
                  <Button
                    aria-describedby="continue-help"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canContinue}
                  >
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                  {!canContinue && (
                    <p id="continue-help" className="mt-2 max-w-56 text-xs text-muted-foreground">
                      {step === 0
                        ? "Add a skin lesion photo to continue."
                        : "Complete the required exposure details to continue."}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <Button onClick={handleSubmit} disabled={status === "sending"} aria-live="polite">
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

        <p className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Alpha version — for testing only.</span>{" "}
          BiteID is an unfinished prototype and is not a medical service. This tool provides general
          information only and is not a diagnosis. Always consult a qualified clinician about a
          bite, sting or changing skin lesion.
        </p>
      </div>

      <EmergencyModal open={modalOpen} onDismiss={() => setModalOpen(false)} />
      <OfflineFieldKitModal
        open={fieldKitOpen}
        onOpenChange={setFieldKitOpen}
        onOpenSnakebiteSurvival={() => setSnakebiteOpen(true)}
      />
      <SnakebiteSurvivalModal open={snakebiteOpen} onOpenChange={setSnakebiteOpen} />
      <KnownCulpritModal
        open={knownCulpritOpen}
        onOpenChange={setKnownCulpritOpen}
        initialVectorId={selectedCulpritId}
        onOpenSnakebiteSurvival={() => setSnakebiteOpen(true)}
      />
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
  form,
  hasEmergency = false,
  onReset,
  onOpenFieldKit,
  onOpenSnakebite,
  onOpenKnownCulprit,
  headingRef,
}: {
  response: TriageResponse;
  form: TriageFormState;
  hasEmergency?: boolean;
  onReset: () => void;
  onOpenFieldKit?: () => void;
  onOpenSnakebite?: () => void;
  onOpenKnownCulprit?: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [locatorOpen, setLocatorOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);

  if (response.isOfflineQueued) {
    return (
      <section aria-live="polite" className="mt-6 space-y-6">
        <div className="rounded-lg border-2 border-primary/30 bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <WifiOff className="size-6" />
            </span>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Cached in Device Storage
                </span>
                <span className="text-xs text-muted-foreground">
                  0-Cell-Service / Backcountry Mode
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Intake Stashed Locally
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You appear to be offline or in a wilderness area without cellular connectivity. Your
                photos, symptoms, duration, and exposure location have been securely saved to this
                device's local queue.
              </p>
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs space-y-2">
                <p className="font-semibold text-foreground">
                  Backcountry & Envenomation Protocol:
                </p>
                <ul className="list-inside list-disc space-y-1.5 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Urgent envenomations:</strong> If this is a
                    suspected venomous snakebite (pit viper), bark scorpion sting, or tick
                    attachment, immediately check the emergency guidelines in the Field Kit.
                  </li>
                  <li>
                    <strong className="text-foreground">Visual atlas:</strong> Compare your lesion
                    and captured specimen against the offline 20-species visual database.
                  </li>
                  <li>
                    <strong className="text-foreground">Automatic sync:</strong> Once you return to
                    cellular coverage or Wi-Fi, BiteID will alert you to submit this intake for full
                    AI vision & vector analysis.
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {onOpenFieldKit && (
                  <Button onClick={onOpenFieldKit} className="flex items-center gap-2 shadow-xs">
                    <Compass className="size-4" />
                    Open Backcountry Field Kit
                  </Button>
                )}
                <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
                  <RotateCcw className="size-4" />
                  Start New Intake
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const results = normalizeResults(response);
  const rawGuidance = response.guidance ?? response.advice;
  const topResult = results[0];
  const secondaryResults = results.slice(1);

  const isErythemaMigrans =
    Boolean(response.hasErythemaMigrans) ||
    /erythema migrans|bull'?s?[- ]?eye|annular target/i.test(topResult?.description ?? "") ||
    /erythema migrans|bull'?s?[- ]?eye|annular target/i.test(
      String(response["lesionReading"] ?? ""),
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
    <section aria-live="polite" className="mt-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-3xl font-bold leading-tight text-foreground outline-none"
          >
            Your assessment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked from most to least likely, based on what you shared.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          {onOpenKnownCulprit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenKnownCulprit}
              className="font-medium"
            >
              <Zap className="mr-1.5 size-4 text-primary" />
              Known Bug
            </Button>
          )}
          {onOpenFieldKit && (
            <Button variant="outline" size="sm" onClick={onOpenFieldKit} className="font-medium">
              <Compass className="size-4 mr-1.5 text-primary" />
              Field Kit
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => setSummaryOpen(true)}
            className="font-medium shadow-xs"
          >
            <Printer className="size-4 mr-1.5" />
            Doctor Summary (PDF)
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
            <RotateCcw className="size-4" />
            <span>Start over</span>
          </Button>
        </div>
      </div>

      {topResult ? (
        <div className="space-y-6">
          {topResult.id === "pit_viper" && onOpenSnakebite && (
            <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-destructive">
                    <ShieldAlert className="size-4 shrink-0" />
                    High-Hazard Pit Viper Envenomation Suspected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Do not delay medical evacuation. Launch the live 15-minute edema progression
                    tracker and first-aid protocol now.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onOpenSnakebite}
                  className="shrink-0 text-xs font-bold shadow-xs"
                >
                  <ShieldAlert className="mr-1 size-3.5" />
                  Snakebite Survival Protocol
                </Button>
              </div>
            </div>
          )}

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

          {response.mimickerAlert?.detected && (
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3.5">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">
                      Clinical Consideration: Non-Arthropod Mimic
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                      {response.mimickerAlert.condition.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    {response.mimickerAlert.explanation ||
                      "The visual presentation exhibits morphological overlap with non-vector skin conditions. Clinical inspection is recommended to rule out fungal or bacterial infection."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <a
                      href="#non-vector-lookalikes"
                      className="font-medium text-primary hover:underline"
                    >
                      Compare against our validated non-arthropod lookalikes below &darr;
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {response.dermatologicalFindings && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-xs sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Eye className="size-4" />
                  </span>
                  <h2 className="font-display text-base font-bold text-foreground">
                    Objective Dermatological Findings
                  </h2>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  AI Morphological Analysis
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground font-medium block">Configuration</span>
                  <span className="font-semibold text-foreground capitalize">
                    {response.dermatologicalFindings.pattern.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground font-medium block">Primary Lesion</span>
                  <span className="font-semibold text-foreground capitalize">
                    {response.dermatologicalFindings.primaryLesion.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground font-medium block">Central Feature</span>
                  <span className="font-semibold text-foreground capitalize">
                    {response.dermatologicalFindings.centralFeatures.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground font-medium block">Estimated Size</span>
                  <span className="font-semibold text-foreground">
                    {response.dermatologicalFindings.estimatedDiameter === "under_1cm"
                      ? "< 1 cm (Punctate)"
                      : response.dermatologicalFindings.estimatedDiameter === "1_to_5cm"
                        ? "1–5 cm (Localized)"
                        : response.dermatologicalFindings.estimatedDiameter === "over_5cm"
                          ? "> 5 cm (Broad Expansion)"
                          : "Diffuse / Multi-focal"}
                  </span>
                </div>
              </div>

              {response.dermatologicalFindings.lesionDescription && (
                <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-3">
                  &ldquo;{response.dermatologicalFindings.lesionDescription}&rdquo;
                </p>
              )}
            </div>
          )}

          {isErythemaMigrans && (
            <div className="rounded-lg border-2 border-caution/40 bg-caution/10 p-5 shadow-sm sm:p-6">
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
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setTrackerOpen(true)}
                      className="font-semibold shadow-xs"
                    >
                      <Activity className="size-3.5 mr-1.5" />
                      Track Rash Expansion (24–48h)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocatorOpen(true)}
                      className="font-medium bg-card"
                    >
                      <MapPin className="size-3.5 mr-1.5" />
                      Find In-Person Urgent Care
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSummaryOpen(true)}
                      className="font-medium bg-card"
                    >
                      <Printer className="size-3.5 mr-1.5" />
                      Print Doctor Handout (PDF)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasActionContent && (
            <div className="rounded-lg border-2 border-primary/25 bg-primary/5 p-5 shadow-sm sm:p-6">
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

                <div className="border-t border-border/50 pt-3.5 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Clinical Evaluation & Provider Handoff
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If symptoms persist, worsen, or if you suspect an infection or tick-borne
                    illness, have this evaluated by a clinician. Generate our structured clinical
                    handoff memo or locate a walk-in center nearby:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={() => setSummaryOpen(true)}
                    >
                      <Printer className="size-3.5 mr-1.5" />
                      Print Doctor Summary (PDF)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setLocatorOpen(true)}
                    >
                      <MapPin className="size-3.5 mr-1.5 text-primary" />
                      Find Nearby Urgent Care
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setTrackerOpen(true)}
                    >
                      <Activity className="size-3.5 mr-1.5 text-primary" />
                      Track Rash (24–48h)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <FitzpatrickTabs
            resultId={topResult.id}
            resultName={topResult.name}
            isErythemaMigrans={isErythemaMigrans}
          />

          <div id="non-vector-lookalikes">
            <NonVectorLookalikes topResultId={topResult.id} isErythemaMigrans={isErythemaMigrans} />
          </div>

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
          <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
            The service did not return any ranked findings for this intake.
          </div>
          {rawGuidance && (
            <div className="rounded-lg border border-border bg-card p-5">
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

      {/* Non-Physician Liability & Guidance Notice */}
      <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
          <ShieldCheck className="size-4 text-primary" />
          <span>Non-Physician Disclaimer & Care Guidance</span>
        </div>
        <p>
          BiteID is an algorithmic visual screening prototype, not a physician, medical practice, or
          certified diagnostic device. This assessment is unconfirmed information and is not a
          medical diagnosis. If you experience severe swelling, difficulty breathing, dizziness,
          confusion, spreading dark discoloration, or high fever, seek emergency medical care
          immediately (Call 911).
        </p>
      </div>

      {response.disclaimer && (
        <p className="rounded-lg bg-muted px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          {response.disclaimer}
        </p>
      )}

      <ClinicalSummaryModal
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        response={response}
        form={form}
        isErythemaMigrans={isErythemaMigrans}
      />

      <UrgentCareLocator
        open={locatorOpen}
        onOpenChange={setLocatorOpen}
        usState={form.usState}
        hasEmergencySymptoms={hasEmergency}
      />

      <RashExpansionTracker
        open={trackerOpen}
        onOpenChange={setTrackerOpen}
        initialLesionFile={form.lesionImage}
        isErythemaMigrans={isErythemaMigrans}
      />
    </section>
  );
}
