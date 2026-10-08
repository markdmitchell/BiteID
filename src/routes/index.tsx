import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useReducer, useRef, useState, useMemo } from "react";
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Baby,
  CheckCircle2,
  Compass,
  Eye,
  FileText,
  Heart,
  HeartPulse,
  Loader2,
  MapPin,
  PhoneCall,
  Pill,
  Printer,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  WifiOff,
  Zap,
  Calculator,
  Camera,
  BookOpen,
  Navigation,
  Volume2,
  VolumeX,
  Sun,
} from "lucide-react";
import biteIdIcon from "@/assets/biteid-icon.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
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
import { ClinicalDiscriminatorCard } from "@/components/triage/ClinicalDiscriminatorCard";
import { applyForkInTheRoad, type ForkOption } from "@/lib/clinical-discriminator";
import { FitzpatrickTabs } from "@/components/triage/FitzpatrickTabs";
import { ClinicalSummaryModal } from "@/components/triage/ClinicalSummaryModal";
import { UrgentCareLocator } from "@/components/triage/UrgentCareLocator";
import { NonVectorLookalikes } from "@/components/triage/NonVectorLookalikes";
import { RashExpansionTracker } from "@/components/triage/RashExpansionTracker";
import { OfflineFieldKitModal } from "@/components/triage/OfflineFieldKitModal";
import { BackcountryPrintableGuideModal } from "@/components/triage/BackcountryPrintableGuideModal";
import { SnakebiteSurvivalModal } from "@/components/triage/SnakebiteSurvivalModal";
import { KnownCulpritModal } from "@/components/triage/KnownCulpritModal";
import { PwaInstallBanner } from "@/components/triage/PwaInstallBanner";
import { PediatricDosingModal } from "@/components/triage/PediatricDosingModal";
import { SafeHarborModal } from "@/components/triage/SafeHarborModal";
import { ReconnectionSyncBanner } from "@/components/triage/ReconnectionSyncBanner";
import { PrivacySanitizationModal } from "@/components/triage/PrivacySanitizationModal";
import { ReleaseNotesModal } from "@/components/triage/ReleaseNotesModal";
import { detectUsStateFromOfflineGps } from "@/lib/geo-offline";
import { useSpeechGuidance } from "@/hooks/useSpeechGuidance";
import { startSilentCacheWarming } from "@/lib/offline-cache";
import { removeOfflineIntake, type StashedIntake } from "@/lib/offline-manager";
import { analyseIntakeFn } from "@/lib/triage.functions";
import {
  PatientProfileSelector,
  PATIENT_PERSONAS,
} from "@/components/triage/PatientProfileSelector";
import { VULNERABLE_GUIDANCE_MAP } from "@/lib/vulnerable-guidance.data";
import {
  BODY_LOCATION_OPTIONS,
  DURATION_OPTIONS,
  FALLBACK_RESPONSE,
  EMERGENCY_SYMPTOMS,
  ENVIRONMENT_OPTIONS,
  SENSATION_OPTIONS,
  initialFormState,
  normalizeResults,
  purgeExpiredHealthData,
  submitTriage,
  triageReducer,
  type TriageFormState,
  type TriageResponse,
  type PatientVulnerabilityProfile,
} from "@/lib/triage";
import { US_STATE_OPTIONS } from "@/lib/us-states";
import { TriageErrorFallback } from "@/components/triage/TriageErrorFallback";

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
  errorComponent: TriageErrorFallback,
});

function TriagePage() {
  const [form, dispatch] = useReducer(triageReducer, initialFormState);
  const [step, setStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [fieldKitOpen, setFieldKitOpen] = useState(false);
  const [printableGuideOpen, setPrintableGuideOpen] = useState(false);
  const [dosingModalOpen, setDosingModalOpen] = useState(false);
  const [snakebiteOpen, setSnakebiteOpen] = useState(false);
  const [knownCulpritOpen, setKnownCulpritOpen] = useState(false);
  const [selectedCulpritId, setSelectedCulpritId] = useState<string | null>(null);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [response, setResponse] = useState<TriageResponse | null>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [safeHarborOpen, setSafeHarborOpen] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("biteid_high_contrast") === "true";
  });
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  // Silently warm offline cache, run auto-retention purge, and verify legal safe harbor consent
  useEffect(() => {
    startSilentCacheWarming();
    purgeExpiredHealthData(30);
    const ack = localStorage.getItem("biteid_safe_harbor_acknowledged");
    if (!ack) {
      setSafeHarborOpen(true);
    }
  }, []);

  async function handleSyncQueuedIntake(intake: StashedIntake) {
    setStatus("sending");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const data = await analyseIntakeFn({
        data: {
          lesionImage: intake.lesionPreviewUrl || "",
          bugImage: intake.bugPreviewUrl || null,
          environment: intake.environment,
          duration: intake.duration,
          usState: intake.usState,
          bodyLocation: intake.bodyLocation,
          sensation: intake.sensation,
          monthIndex: new Date().getMonth(),
          symptoms: intake.symptoms,
        },
      });
      removeOfflineIntake(intake.id);
      setResponse(data as unknown as TriageResponse);
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  }

  async function handleDetectGps() {
    setGpsDetecting(true);
    setGpsMessage(null);
    try {
      const res = await detectUsStateFromOfflineGps();
      dispatch({ type: "setUsState", value: res.stateCode });
      setGpsMessage(`Auto-detected ${res.stateName} via offline satellite GPS`);
      setTimeout(() => setGpsMessage(null), 4000);
    } catch (err) {
      setGpsMessage(err instanceof Error ? err.message : "GPS detection unavailable");
      setTimeout(() => setGpsMessage(null), 4000);
    } finally {
      setGpsDetecting(false);
    }
  }

  const hasEmergency =
    form.symptoms.length > 0 ||
    form.batOrAnimalExposure ||
    form.secondaryInfectionSymptoms.includes("red_streaks");

  useEffect(() => {
    if (hasEmergency) setModalOpen(true);
  }, [form.symptoms, form.batOrAnimalExposure, form.secondaryInfectionSymptoms, hasEmergency]);

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
    <main
      className={cn(
        "min-h-screen pb-20 font-sans transition-colors duration-200",
        highContrastMode
          ? "bg-black text-amber-300 contrast-125 selection:bg-amber-400 selection:text-black"
          : "bg-background text-foreground",
      )}
    >
      <header className="border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
              aria-label="BiteID home"
            >
              <img src={biteIdIcon} alt="BiteID" className="size-9 shrink-0 object-contain" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold text-foreground">BiteID</span>
                  <span className="rounded-sm bg-caution/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-caution-foreground">
                    Alpha
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                  Bites, stings & skin reactions
                </p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Open snakebite emergency guidance"
              onClick={() => setSnakebiteOpen(true)}
              className="flex items-center gap-1.5 border-destructive/40 text-xs font-semibold text-destructive hover:bg-destructive/10"
            >
              <ShieldAlert className="size-3.5 text-destructive" />
              <span>Snakebite SOS</span>
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
              <span>Field Kit</span>
            </Button>
          </div>
        </div>
      </header>

      <ReconnectionSyncBanner onSyncIntake={handleSyncQueuedIntake} />
      <PwaInstallBanner />

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
            onOpenPrintableGuide={() => setPrintableGuideOpen(true)}
            onOpenSnakebite={() => setSnakebiteOpen(true)}
            onOpenDosingModal={() => setDosingModalOpen(true)}
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
                        <div className="flex items-center justify-between gap-2">
                          <label htmlFor="state" className="text-sm font-medium text-foreground">
                            Which state were you in?
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={gpsDetecting}
                            onClick={handleDetectGps}
                            className="h-7 px-2 text-xs font-medium text-primary hover:bg-primary/10 flex items-center gap-1"
                          >
                            <Compass className={`size-3.5 ${gpsDetecting ? "animate-spin" : ""}`} />
                            <span>{gpsDetecting ? "Locating..." : "Auto-Detect (GPS)"}</span>
                          </Button>
                        </div>
                        {gpsMessage && (
                          <p className="mt-1 text-xs font-medium text-primary animate-in fade-in duration-200">
                            {gpsMessage}
                          </p>
                        )}
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
                          Satellite GPS works 100% offline without cellular data.
                        </p>
                      </div>

                      {/* 14-Day Travel History */}
                      <div className="pt-2">
                        <label className="text-sm font-medium text-foreground block">
                          Travel outside your home state in the past 14 days?
                        </label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Accounts for incubation times of desert or tropical vectors.
                        </p>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          {[
                            { id: "none", label: "No Travel", sub: "Local to state only" },
                            {
                              id: "us_southwest",
                              label: "US Southwest / Desert",
                              sub: "AZ, NM, NV, TX, SoCal",
                            },
                            {
                              id: "tropical_intl",
                              label: "Tropical / International",
                              sub: "Caribbean, LatAm, Asia",
                            },
                          ].map((t) => {
                            const isSelected = form.recentTravel === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() =>
                                  dispatch({
                                    type: "setRecentTravel",
                                    value: t.id as "none" | "us_southwest" | "tropical_intl",
                                  })
                                }
                                className={cn(
                                  "p-2.5 rounded-xl border text-left transition-all",
                                  isSelected
                                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/40"
                                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                                )}
                              >
                                <span className="block font-semibold text-xs text-foreground">
                                  {t.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground block">
                                  {t.sub}
                                </span>
                              </button>
                            );
                          })}
                        </div>
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

                      <div className="border-t border-border/80 pt-5 space-y-2">
                        <div>
                          <label className="text-sm font-medium text-foreground block">
                            Who was bitten or affected?
                          </label>
                          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                            Enables tailored pediatric weight dosing, pregnancy medication
                            safeguards, and Beers criteria precautions.
                          </p>
                        </div>
                        <PatientProfileSelector
                          value={form.patientProfile}
                          onChange={(val) => dispatch({ type: "setPatientProfile", value: val })}
                          compact={false}
                          showSummary={true}
                        />
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

                  {/* P0: Mammalian / Bat Rabies Exposure Screener */}
                  <div className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-destructive/10 p-2 text-destructive shrink-0">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-destructive">
                            Critical Rabies Safeguard
                          </span>
                          <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                            Fatal Risk
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-foreground">
                          Bat or Wild Mammal Direct Contact?
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Did you wake up with a bat in your room, tent, or cabin, touch a bat with
                          bare skin, or suffer an unprovoked bite/scratch from a raccoon, skunk,
                          fox, or stray mammal? CDC guidance states bat teeth are microscopic and
                          punctures can be completely painless and invisible, yet rabies is 100%
                          fatal without prompt Post-Exposure Prophylaxis (PEP).
                        </p>
                        <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-md border border-destructive/40 bg-background/80 p-3 transition-colors hover:bg-destructive/10">
                          <Checkbox
                            checked={form.batOrAnimalExposure}
                            onCheckedChange={(checked) =>
                              dispatch({ type: "setBatExposure", value: checked === true })
                            }
                          />
                          <span className="text-xs font-semibold text-destructive">
                            Yes — Potential bat or wild mammal exposure (Immediate Emergency Rabies
                            PEP required)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-sm font-semibold text-foreground mb-1">
                      Systemic Red Flag Symptoms
                    </h2>
                    <p className="text-xs text-muted-foreground mb-3">
                      Select if you are currently experiencing any of these critical symptoms:
                    </p>
                    <div className="space-y-2">
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
                          None of these systemic symptoms apply to me
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* P1: Secondary Bacterial Infection Screener */}
                  <div className="mt-6 rounded-lg border border-border bg-card p-4 sm:p-5">
                    <div className="space-y-1 mb-3">
                      <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                        <ShieldAlert className="size-4 text-primary" />
                        Secondary Infection Screener (Cellulitis & MRSA)
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Scratching insect bites introduces skin bacteria (Staph/Strep). Check any
                        signs of expanding infection:
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        {
                          id: "expanding_erythema",
                          label: "Expanding Redness",
                          desc: "Border expanding > 1 cm/hr or noticeable daily growth",
                        },
                        {
                          id: "red_streaks",
                          label: "Spreading Red Streaks",
                          desc: "Streaks tracking toward torso or lymph nodes (Emergency)",
                        },
                        {
                          id: "warmth_edema",
                          label: "Marked Heat & Swelling",
                          desc: "Skin feels hot, tight, indurated (hardened), or tender",
                        },
                        {
                          id: "purulence",
                          label: "Pus / Honey Crusts",
                          desc: "Cloudy yellow/green discharge, pustule, or golden crusting",
                        },
                      ].map((item) => {
                        const checked = form.secondaryInfectionSymptoms.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={cn(
                              "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors",
                              checked
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card hover:border-primary/40",
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() =>
                                dispatch({
                                  type: "toggleSecondaryInfectionSymptom",
                                  value: item.id,
                                })
                              }
                              className="mt-0.5"
                            />
                            <div className="min-w-0">
                              <span className="block text-xs font-semibold text-foreground">
                                {item.label}
                              </span>
                              <span className="block text-[11px] text-muted-foreground">
                                {item.desc}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
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

        <div className="mt-8 border-t border-border pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs leading-relaxed text-muted-foreground flex-1">
            <span className="font-semibold text-foreground">Alpha version — for testing only.</span>{" "}
            BiteID is an unfinished prototype and is not a medical service. This tool provides
            general information only and is not a diagnosis. Always consult a qualified clinician
            about a bite, sting or changing skin lesion.
          </p>
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReleaseNotesOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Release Notes (v1.2)</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPrivacyModalOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Device Privacy & Eraser</span>
            </Button>
          </div>
        </div>
      </div>

      <ReleaseNotesModal open={releaseNotesOpen} onOpenChange={setReleaseNotesOpen} />

      <EmergencyModal
        open={modalOpen}
        onDismiss={() => setModalOpen(false)}
        isBatExposure={form.batOrAnimalExposure}
        isSecondaryInfection={form.secondaryInfectionSymptoms.includes("red_streaks")}
      />
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
      <BackcountryPrintableGuideModal
        open={printableGuideOpen}
        onOpenChange={setPrintableGuideOpen}
      />
      <PediatricDosingModal open={dosingModalOpen} onOpenChange={setDosingModalOpen} />
      <PrivacySanitizationModal open={privacyModalOpen} onOpenChange={setPrivacyModalOpen} />
      <SafeHarborModal
        open={safeHarborOpen}
        onAcknowledge={() => {
          setSafeHarborOpen(false);
          localStorage.setItem("biteid_safe_harbor_acknowledged", "true");
        }}
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
  onOpenPrintableGuide,
  onOpenSnakebite,
  onOpenDosingModal,
  onOpenKnownCulprit,
  headingRef,
}: {
  response: TriageResponse;
  form: TriageFormState;
  hasEmergency?: boolean;
  onReset: () => void;
  onOpenFieldKit?: () => void;
  onOpenPrintableGuide?: () => void;
  onOpenSnakebite?: () => void;
  onOpenDosingModal?: () => void;
  onOpenKnownCulprit?: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [locatorOpen, setLocatorOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<PatientVulnerabilityProfile>(
    form.patientProfile ?? "standard_adult",
  );
  const [forkChoice, setForkChoice] = useState<"primary" | "secondary" | "neutral">("neutral");
  const [activeForkOption, setActiveForkOption] = useState<ForkOption | undefined>(undefined);

  useEffect(() => {
    setForkChoice("neutral");
    setActiveForkOption(undefined);
  }, [response]);

  const { isSpeaking, isSupported: speechSupported, toggle: toggleSpeech } = useSpeechGuidance();

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
                    suspected venomous snakebite (pit viper), bark scorpion sting, marine hazard, or
                    tick attachment, immediately check the emergency guidelines in the Field Kit.
                  </li>
                  <li>
                    <strong className="text-foreground">Visual atlas:</strong> Compare your lesion
                    and captured specimen against the offline 32-species visual database.
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
                {onOpenPrintableGuide && (
                  <Button
                    onClick={onOpenPrintableGuide}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Printer className="size-4" />
                    Printable Pocket Guide
                  </Button>
                )}
                <Button
                  onClick={onReset}
                  variant="ghost"
                  className="flex items-center gap-2 text-muted-foreground"
                >
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

  const baselineResults = useMemo(() => normalizeResults(response), [response]);
  const baselineTop = baselineResults[0];
  const baselineRunnerUp = baselineResults[1];

  const effectiveResults = useMemo(() => {
    if (!baselineTop || !baselineRunnerUp) return baselineResults;
    return applyForkInTheRoad(
      baselineResults,
      forkChoice,
      baselineTop.id ?? "",
      baselineRunnerUp.id ?? "",
    );
  }, [baselineResults, forkChoice, baselineTop, baselineRunnerUp]);

  const results = effectiveResults;
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
            className="font-display text-2xl sm:text-3xl font-bold leading-tight text-foreground outline-none"
          >
            Diagnostic Assessment &amp; Clinical Differential
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Multimodal vision evaluation ranked by clinical likelihood, regional priors, and lesion
            morphology.
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
          {onOpenPrintableGuide && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenPrintableGuide}
              className="font-medium"
            >
              <Printer className="size-4 mr-1.5 text-primary" />
              Pocket Guide
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => setSummaryOpen(true)}
            className="font-semibold shadow-xs"
          >
            <FileText className="size-4 mr-1.5" />
            Doctor Summary (SBAR &amp; QR)
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
            <RotateCcw className="size-4" />
            <span>Start over</span>
          </Button>
        </div>
      </div>

      {/* Patient Vulnerability Profile Selector & Poison Control Bar */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Baby className="size-4" />
            </span>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Patient Vulnerability Profile
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Instantly recalibrates first-aid advice, black-box warnings, and pediatric/geriatric
                safety limits.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onOpenDosingModal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenDosingModal}
                className="h-7 px-2.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1.5"
              >
                <Calculator className="size-3.5 text-primary" />
                <span>Pediatric Dosing Engine</span>
              </Button>
            )}
            <a
              href="tel:18002221222"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
            >
              <PhoneCall className="size-3" />
              <span>Poison Help: 1-800-222-1222</span>
            </a>
          </div>
        </div>

        <PatientProfileSelector
          value={activeProfile}
          onChange={setActiveProfile}
          compact={false}
          showSummary={true}
        />
      </div>

      {/* P0: Non-Skin / Degraded Photo Rejection Gate Banner */}
      {response.isRejectedImage && (
        <div className="rounded-xl border-2 border-destructive/60 bg-destructive/10 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg bg-destructive/20 p-2.5 text-destructive shrink-0">
              <Camera className="size-6" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-destructive/25 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-destructive">
                  Photo Rejection Gate
                </span>
                <span className="text-xs text-destructive font-medium">
                  Non-Skin or Degraded Quality
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-destructive">
                Unable to Analyze Image
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {response.rejectionReason ||
                  "The uploaded photo does not appear to show human skin, an identifiable lesion, or clear specimen details."}
              </p>
              <div className="rounded-lg border border-destructive/20 bg-background/60 p-3 text-xs text-muted-foreground space-y-1.5">
                <p className="font-semibold text-foreground">Diagnostic Integrity Rule:</p>
                <p>
                  To prevent dangerous false confidence, BiteID strictly halts evaluation and
                  refuses to generate speculative diagnostic rankings on non-dermatological objects
                  (furniture, floors, pets, documents) or unreadable images.
                </p>
              </div>
              <div className="pt-1 flex gap-2">
                <Button size="sm" variant="default" onClick={onReset} className="gap-1.5 text-xs">
                  <RotateCcw className="size-3.5" />
                  Retake / Upload Clear Photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* P0: Mammalian / Bat Rabies PEP Protocol Banner */}
      {response.hasRabiesAlert && (
        <div className="rounded-xl border-2 border-destructive bg-destructive/15 p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg bg-destructive p-2 text-destructive-foreground shrink-0 animate-pulse">
              <ShieldAlert className="size-6" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-destructive-foreground">
                  Fatal Pathogen Warning
                </span>
                <span className="text-xs font-bold text-destructive">
                  Emergency Rabies PEP Indicated
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-destructive">
                Bat or Wild Mammalian Rabies Exposure Alert
              </h2>
              <p className="text-sm text-foreground leading-relaxed font-medium">
                Rabies virus is nearly 100% fatal once clinical neurological symptoms appear, but
                100% preventable with timely Post-Exposure Prophylaxis (PEP).
              </p>
              <div className="rounded-lg border border-destructive/30 bg-card p-3 text-xs space-y-2">
                <p className="font-bold text-destructive">Mandatory Clinical Protocol:</p>
                <ol className="list-decimal list-inside space-y-1 text-foreground/90">
                  <li>
                    <strong>Immediate Wound Cleansing:</strong> Wash the contact area vigorously
                    with soap and warm running water for at least 15 continuous minutes.
                  </li>
                  <li>
                    <strong>Do Not Wait for Symptoms:</strong> Go directly to an Emergency
                    Department or call your local Department of Public Health immediately.
                  </li>
                  <li>
                    <strong>Post-Exposure Prophylaxis (PEP):</strong> Consists of Human Rabies
                    Immune Globulin (HRIG) infiltrated at the wound site, plus a 4-dose rabies
                    vaccine series (Days 0, 3, 7, and 14).
                  </li>
                  <li>
                    <strong>Bat Quarantine / Testing:</strong> If the bat was safely captured
                    without brain damage, contact animal control for PCR testing. Never handle a
                    live or dead bat barehanded.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* P1: Secondary Bacterial Infection (Cellulitis / MRSA) Banner */}
      {response.hasCellulitisAlert && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg bg-destructive/20 p-2 text-destructive shrink-0">
              <AlertTriangle className="size-6" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-destructive/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-destructive">
                  Bacterial Superinfection Alert
                </span>
                <span className="text-xs font-medium text-destructive">
                  Suspected Cellulitis / Lymphangitis / MRSA
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-destructive">
                Secondary Bacterial Infection Suspected
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed">
                Scratching insect bites breaches the epidermal barrier, introducing opportunistic
                bacteria (<em>Staphylococcus aureus</em> including MRSA, or{" "}
                <em>Streptococcus pyogenes</em>). Your reported symptoms indicate active bacterial
                invasion beyond simple bite histaminic response.
              </p>
              <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
                <p className="font-bold text-foreground">Urgent Care Instructions:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    <strong>Pen Border Marking:</strong> Take an ink pen and outline the visible
                    edge of the red border right now with the current timestamp. If redness expands
                    beyond this line, prescription oral or IV antibiotics are required.
                  </li>
                  <li>
                    <strong>Spreading Red Streaks (Lymphangitis):</strong> Streaks tracking toward
                    armpits or groin signal lymphatic invasion and high risk of bacteremia/sepsis.
                    Proceed to urgent care or the ER immediately.
                  </li>
                  <li>
                    <strong>Never Lance or Squeeze:</strong> Squeezing furuncles or pustules forces
                    MRSA bacteria into deep subcutaneous tissue and muscular fascia.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {/* Dynamic Vulnerable Population Safety Directives Card */}
          {(() => {
            if (activeProfile === "standard_adult") return null;
            const guidance =
              topResult.vulnerableGuidance ??
              (topResult.id ? VULNERABLE_GUIDANCE_MAP[topResult.id] : undefined);
            if (!guidance) return null;

            const isPed = activeProfile === "infant_toddler" || activeProfile === "child";
            const isPreg = activeProfile === "pregnant_nursing";
            const isGeri = activeProfile === "geriatric_immune";

            return (
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                  <div className="flex items-center gap-2">
                    {isPed && <Baby className="size-4 text-rose-600 dark:text-rose-400" />}
                    {isPreg && <Heart className="size-4 text-purple-600 dark:text-purple-400" />}
                    {isGeri && <ShieldAlert className="size-4 text-blue-600 dark:text-blue-400" />}
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Personalized Safety Directives for{" "}
                      {PATIENT_PERSONAS.find((p) => p.key === activeProfile)?.label}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Clinical Priority
                  </span>
                </div>

                {isPed && guidance.pediatric && (
                  <div className="space-y-2.5 text-xs">
                    {guidance.pediatric.blackBoxWarning && (
                      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive font-medium">
                        <span className="font-bold flex items-center gap-1.5 mb-1">
                          <AlertOctagon className="size-4 shrink-0" />
                          BLACK-BOX PEDIATRIC WARNING:
                        </span>
                        {guidance.pediatric.blackBoxWarning}
                      </div>
                    )}
                    {guidance.pediatric.atypicalPresentation && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
                        <span className="font-bold flex items-center gap-1.5 mb-1">
                          <Sparkles className="size-4 shrink-0" />
                          &quot;DO NOT MISS&quot; ATYPICAL PRESENTATION:
                        </span>
                        {guidance.pediatric.atypicalPresentation}
                      </div>
                    )}
                    {guidance.pediatric.weightBasedAdvice && (
                      <div className="rounded-lg border border-border bg-card p-3 text-foreground space-y-2">
                        <div>
                          <span className="font-bold flex items-center gap-1.5 text-primary mb-1">
                            <Pill className="size-4 shrink-0" />
                            Weight-Based Medication & First Aid:
                          </span>
                          {guidance.pediatric.weightBasedAdvice}
                        </div>
                        {onOpenDosingModal && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={onOpenDosingModal}
                            className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 flex items-center gap-1.5"
                          >
                            <Calculator className="size-3.5 text-primary" />
                            Open Weight-Based Liquid Dosing Calculator
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {isPreg && guidance.pregnancy && (
                  <div className="space-y-2.5 text-xs">
                    {guidance.pregnancy.contraindications &&
                      guidance.pregnancy.contraindications.length > 0 && (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive font-medium">
                          <span className="font-bold flex items-center gap-1.5 mb-1">
                            <AlertTriangle className="size-4 shrink-0" />
                            CONTRAINDICATIONS IN PREGNANCY:
                          </span>
                          {guidance.pregnancy.contraindications.join(" • ")}
                        </div>
                      )}
                    {guidance.pregnancy.safeAlternatives && (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-900 dark:text-emerald-200">
                        <span className="font-bold flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="size-4 shrink-0" />
                          Safe First-Line Alternatives:
                        </span>
                        {guidance.pregnancy.safeAlternatives}
                      </div>
                    )}
                    {guidance.pregnancy.fetalRisks && (
                      <div className="rounded-lg border border-border bg-card p-3 text-foreground">
                        <span className="font-bold flex items-center gap-1.5 text-purple-600 mb-1">
                          <Heart className="size-4 shrink-0" />
                          Maternal-Fetal Considerations:
                        </span>
                        {guidance.pregnancy.fetalRisks}
                      </div>
                    )}
                  </div>
                )}

                {isGeri && guidance.geriatric && (
                  <div className="space-y-2.5 text-xs">
                    {guidance.geriatric.beersCriteriaWarning && (
                      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
                        <span className="font-bold flex items-center gap-1.5 mb-1">
                          <Pill className="size-4 shrink-0" />
                          BEERS CRITERIA MEDICATION PRECAUTION:
                        </span>
                        {guidance.geriatric.beersCriteriaWarning}
                      </div>
                    )}
                    {guidance.geriatric.atypicalPresentation && (
                      <div className="rounded-lg border border-primary/20 bg-card p-3 text-foreground">
                        <span className="font-bold flex items-center gap-1.5 text-primary mb-1">
                          <Sparkles className="size-4 shrink-0" />
                          Atypical Blunted Presentation:
                        </span>
                        {guidance.geriatric.atypicalPresentation}
                      </div>
                    )}
                    {guidance.geriatric.sepsisWarningSigns &&
                      guidance.geriatric.sepsisWarningSigns.length > 0 && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                          <span className="font-bold flex items-center gap-1.5 mb-1">
                            <ShieldAlert className="size-4 shrink-0" />
                            Sepsis & Secondary Infection Red Flags (qSOFA):
                          </span>
                          {guidance.geriatric.sepsisWarningSigns.join(" • ")}
                        </div>
                      )}
                  </div>
                )}
              </div>
            );
          })()}

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

          {baselineResults.length > 1 && baselineTop && baselineRunnerUp && (
            <ClinicalDiscriminatorCard
              topResult={baselineTop}
              runnerUpResult={baselineRunnerUp}
              response={response}
              form={form}
              forkChoice={forkChoice}
              onForkChoiceChange={(choice, option) => {
                setForkChoice(choice);
                setActiveForkOption(option);
              }}
            />
          )}

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
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                        First aid
                      </h3>
                      {speechSupported && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleSpeech(
                              `First aid instructions for suspected ${topResult.name}. ` +
                                topResult.firstAidAdvice?.join(". "),
                            )
                          }
                          className={`h-7 px-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isSpeaking
                              ? "text-destructive bg-destructive/10 hover:bg-destructive/20 animate-pulse"
                              : "text-primary hover:bg-primary/10"
                          }`}
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="size-3.5" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="size-3.5" />
                              <span>Listen (Hands-Free)</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
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
        patientProfile={activeProfile}
        effectiveResults={effectiveResults}
        forkDetails={{
          choice: forkChoice,
          activeOption: activeForkOption,
        }}
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
        suspectedCondition={topResult?.name}
        patientProfile={activeProfile}
      />
    </section>
  );
}
