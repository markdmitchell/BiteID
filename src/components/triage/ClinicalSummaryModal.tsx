import { useEffect, useState, useId, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import {
  Printer,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Copy,
  Check,
  Smartphone,
  QrCode,
  Eye,
  Activity,
  Waves,
} from "lucide-react";
import {
  type TriageResponse,
  type TriageFormState,
  type PatientVulnerabilityProfile,
  normalizeResults,
  BODY_LOCATION_OPTIONS,
  SENSATION_OPTIONS,
  EMERGENCY_SYMPTOMS,
  ENVIRONMENT_OPTIONS,
  DURATION_OPTIONS,
} from "@/lib/triage";
import { stateLabel } from "@/lib/us-states";
import { getLookalikeDifferentials } from "@/lib/lookalikes";
import { PATIENT_PERSONAS } from "./PatientProfileSelector";

type ClinicalSummaryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: TriageResponse;
  form: TriageFormState;
  isErythemaMigrans: boolean;
  patientProfile?: PatientVulnerabilityProfile;
};

export function ClinicalSummaryModal({
  open,
  onOpenChange,
  response,
  form,
  isErythemaMigrans,
  patientProfile,
}: ClinicalSummaryModalProps) {
  const [lesionUrl, setLesionUrl] = useState<string | null>(null);
  const [bugUrl, setBugUrl] = useState<string | null>(null);
  const [nowDate, setNowDate] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"document" | "er_triage" | "qr_code">("document");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [rashJournal, setRashJournal] = useState<{
    baselineDiameterMm: number;
    baselineDate: string;
    followUpDiameterMm?: number;
    followUpDate?: string;
  } | null>(null);
  const uniqueId = useId().replace(/:/g, "").slice(0, 8).toUpperCase();

  useEffect(() => {
    if (form.lesionImage) {
      const url = URL.createObjectURL(form.lesionImage);
      setLesionUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setLesionUrl(null);
    return undefined;
  }, [form.lesionImage]);

  useEffect(() => {
    if (form.bugImage) {
      const url = URL.createObjectURL(form.bugImage);
      setBugUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBugUrl(null);
    return undefined;
  }, [form.bugImage]);

  useEffect(() => {
    if (open) {
      setNowDate(
        new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      );
      try {
        const stored = localStorage.getItem("biteid_rash_journal_record");
        if (stored) {
          setRashJournal(JSON.parse(stored));
        } else {
          setRashJournal(null);
        }
      } catch {
        setRashJournal(null);
      }
    }
  }, [open]);

  const results = normalizeResults(response);
  const topResult = results[0];
  const secondaryResults = results.slice(1);

  const stateName = form.usState ? stateLabel(form.usState) : "Unspecified";
  const envName =
    ENVIRONMENT_OPTIONS.find((e) => e.value === form.environment)?.label ??
    form.environment ??
    "Unspecified";
  const durationName =
    DURATION_OPTIONS.find((d) => d.value === form.duration)?.label ??
    form.duration ??
    "Unspecified";
  const locationLabel =
    BODY_LOCATION_OPTIONS.find((l) => l.value === form.bodyLocation)?.label ?? form.bodyLocation;
  const sensationLabel =
    SENSATION_OPTIONS.find((s) => s.value === form.sensation)?.label ?? form.sensation;

  const lookalikes = getLookalikeDifferentials(topResult?.id, Boolean(isErythemaMigrans));
  const reportedEmergencies = EMERGENCY_SYMPTOMS.filter((sym) => form.symptoms.includes(sym.value));

  const effectiveProfile = patientProfile ?? form.patientProfile ?? "standard_adult";
  const personaDef =
    PATIENT_PERSONAS.find((p) => p.key === effectiveProfile) ?? PATIENT_PERSONAS[0];

  const handlePrint = () => {
    window.print();
  };

  const generateSbarText = useCallback((): string => {
    return `=== BITEID CLINICAL TRIAGE MEMO (SBAR FORMAT) ===
Ref ID: BID-${uniqueId}
Date/Time: ${nowDate || new Date().toLocaleString()}

[S] SITUATION
- Chief Complaint: Bite / skin lesion / envenomation screening
- Anatomical Location: ${locationLabel}
- Sensation: ${sensationLabel}
- Duration / Onset: ${durationName}
- Emergency Symptoms Screen: ${reportedEmergencies.length > 0 ? `POSITIVE for: ${reportedEmergencies.map((e) => e.label).join(", ")}` : "NEGATIVE (no anaphylaxis, airway compromise, or acute confusion reported)"}

[B] BACKGROUND & DEMOGRAPHICS
- Geographic Exposure: ${stateName}
- Environment: ${envName}
- Patient Profile: ${personaDef.label} (${personaDef.ageRange})
${effectiveProfile === "infant_toddler" || effectiveProfile === "child" ? "- Pediatric Safety: ASPIRIN/PEPTO-BISMOL STRICTLY CONTRAINDICATED (Reye's syndrome risk). Dose weight-based oral analgesics via oral syringe. Antivenom is not weight-reduced." : ""}${effectiveProfile === "pregnant_nursing" ? "- Pregnancy Safety: DOXYCYCLINE & IVERMECTIN CONTRAINDICATED. Safe Lyme alternative: Amoxicillin. Continuous fetal monitoring required if pit viper envenomation." : ""}${effectiveProfile === "geriatric_immune" ? "- Geriatric Safety: DIPHENHYDRAMINE CONTRAINDICATED per Beers criteria (delirium & fall fractures). High secondary infection/cellulitis vulnerability." : ""}

[A] ASSESSMENT / ALGORITHMIC DIFFERENTIAL
- Top Differential Hypothesis: ${topResult?.name ?? "Unknown"} (${topResult?.scientificName ?? ""}) — Likelihood: ${Math.round(topResult?.confidence ?? topResult?.probability ?? 0)}%
${topResult?.associatedPathogens?.length ? `- Associated Pathogens: ${topResult.associatedPathogens.join(", ")}` : ""}
${isErythemaMigrans ? "- CLINICAL ALERT: Strong visual & epidemiological concordance for ERYTHEMA MIGRANS (early Lyme disease). CDC guidelines advise clinical diagnosis & standard antibiotic evaluation without awaiting delayed serology." : ""}
${response.dermatologicalFindings ? `- Morphology: Pattern: ${response.dermatologicalFindings.pattern}, Primary: ${response.dermatologicalFindings.primaryLesion ?? "n/a"}, Central: ${response.dermatologicalFindings.centralFeatures}, Size: ${response.dermatologicalFindings.estimatedDiameter ?? "n/a"}` : ""}
${secondaryResults.length > 0 ? `- Secondary Differentials: ${secondaryResults.map((s) => `${s.name} (${Math.round(s.confidence ?? s.probability ?? 0)}%)`).join(", ")}` : ""}
${
  lookalikes.length > 0
    ? `- Non-Vector Lookalikes to Rule Out: ${lookalikes
        .slice(0, 3)
        .map((l) => l.name)
        .join(", ")}`
    : ""
}

[R] RECOMMENDATION & CLINICAL PLAN
- Formal physical exam by licensed clinician with vital signs.
- Active margin tracing: mark erythema/edema borders with ink pen; note time stamps every 15-30m.
- Evaluate need for antivenom (CroFab, Anascorp) if pit viper or scorpion envenomation with progressive swelling or neurotoxicity.
- Non-diagnostic algorithm: Clinical judgment supersedes this intake report.
==================================================`;
  }, [
    uniqueId,
    nowDate,
    locationLabel,
    sensationLabel,
    durationName,
    reportedEmergencies,
    stateName,
    envName,
    personaDef,
    effectiveProfile,
    topResult,
    isErythemaMigrans,
    response.dermatologicalFindings,
    secondaryResults,
    lookalikes,
  ]);

  useEffect(() => {
    if (open) {
      const sbar = generateSbarText();
      QRCode.toDataURL(sbar, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then(setQrCodeDataUrl)
        .catch(() => {});
    }
  }, [open, generateSbarText]);

  const handleCopySbar = async () => {
    const text = generateSbarText();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        <DialogTitle className="sr-only">Clinical Handout & Doctor Summary</DialogTitle>

        {/* Action Header (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-3 no-print">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">Clinical Handout & ER Handoff</h2>
              <p className="text-xs text-muted-foreground">
                Format for clinician review, EHR copy-paste (SBAR), or emergency triage
                presentation.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "er_triage" ? "default" : "outline"}
              onClick={() => setViewMode(viewMode === "er_triage" ? "document" : "er_triage")}
              className="text-xs font-semibold gap-1.5"
            >
              <Smartphone className="size-3.5" />
              <span>{viewMode === "er_triage" ? "Document View" : "Show ER Nurse"}</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "qr_code" ? "default" : "outline"}
              onClick={() => setViewMode(viewMode === "qr_code" ? "document" : "qr_code")}
              className="text-xs font-semibold gap-1.5"
            >
              <QrCode className="size-3.5" />
              <span>{viewMode === "qr_code" ? "Document View" : "Clinician QR"}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopySbar}
              className="text-xs font-semibold gap-1.5"
            >
              {isCopied ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied SBAR Note</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy EHR Note (SBAR)</span>
                </>
              )}
            </Button>
            <Button size="sm" onClick={handlePrint} className="text-xs font-medium gap-1.5">
              <Printer className="size-3.5" />
              <span>Print / PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* CLINICIAN SCANNABLE QR CODE VIEW */}
        {viewMode === "qr_code" && (
          <div className="space-y-4 pt-3 text-foreground no-print">
            <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 text-center space-y-4 shadow-md">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
                  <QrCode className="size-3.5" />
                  Clinician Fast-Handoff QR Matrix
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Scan to Ingest SBAR Note into EHR
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Hospital staff & triage nurses: Scan this high-density code with any tablet,
                  barcode scanner, or camera to import the patient&apos;s structured triage
                  assessment without manual data entry.
                </p>
              </div>

              {qrCodeDataUrl ? (
                <div className="inline-block rounded-2xl bg-white p-4 shadow-md border-2 border-slate-200">
                  <img
                    src={qrCodeDataUrl}
                    alt="Clinician SBAR QR Code"
                    className="size-60 sm:size-72 mx-auto"
                  />
                  <span className="text-[10px] font-mono text-slate-600 block mt-2">
                    Ref ID: BID-{uniqueId} • SBAR Standard
                  </span>
                </div>
              ) : (
                <div className="size-60 sm:size-72 rounded-2xl bg-muted flex items-center justify-center text-xs text-muted-foreground mx-auto">
                  Generating QR Code…
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Button onClick={handleCopySbar} className="gap-1.5 text-xs font-semibold">
                  {isCopied ? (
                    <>
                      <Check className="size-4 text-emerald-400" />
                      <span>Copied EHR SBAR Note</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      <span>Copy Full EHR Clinical Note (SBAR)</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode("document")}
                  className="text-xs"
                >
                  Return to Document View
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ER TRIAGE RAPID PRESENTATION MODE */}
        {viewMode === "er_triage" && (
          <div className="space-y-4 pt-3 text-foreground no-print">
            <div className="rounded-2xl border-2 border-primary/40 bg-card p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-destructive animate-ping" />
                  <span className="font-display text-base sm:text-lg font-bold uppercase tracking-wider text-foreground">
                    ER Triage Presentation View
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  Ref: BID-{uniqueId}
                </span>
              </div>

              {/* Primary Hazard Callout Banner */}
              <div className="rounded-xl border-2 border-destructive/40 bg-destructive/10 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-destructive flex items-center gap-1.5">
                    <ShieldAlert className="size-4" />
                    Top Suspected Hazard:
                  </span>
                  <span className="text-sm font-bold font-mono text-destructive">
                    {Math.round(topResult?.confidence ?? topResult?.probability ?? 0)}% Probability
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-foreground">
                  {topResult?.name ?? "Suspected Vector Envenomation"}
                </h3>
                {topResult?.scientificName && (
                  <p className="text-xs italic text-muted-foreground">{topResult.scientificName}</p>
                )}
                {topResult?.id === "pit_viper" && (
                  <p className="text-xs font-bold text-destructive pt-1">
                    HIGH EMERGENCY: Pit viper hemotoxic envenomation. Immediate CroFab/Anavip
                    evaluation & 15-minute serial circumference measurement indicated.
                  </p>
                )}
                {topResult?.id === "coral_snake" && (
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 pt-1">
                    POTENT NEUROTOXIN: Coral snake bite. Delayed respiratory paralysis risk. ICU
                    monitoring & coral snake antivenom indicated.
                  </p>
                )}
                {isErythemaMigrans && (
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 pt-1">
                    ERYTHEMA MIGRANS IDENTIFIED: Expanding annular lesion consistent with early Lyme
                    disease. CDC guidelines advise clinical treatment without awaiting serology.
                  </p>
                )}
              </div>

              {/* Patient Exposure & Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Anatomical Site
                  </span>
                  <span className="font-bold text-foreground text-sm">{locationLabel}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Sensation
                  </span>
                  <span className="font-bold text-foreground text-sm">{sensationLabel}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Duration
                  </span>
                  <span className="font-bold text-foreground text-sm">{durationName}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    State / Environment
                  </span>
                  <span
                    className="font-bold text-foreground text-sm truncate block"
                    title={`${stateName}, ${envName}`}
                  >
                    {stateName}
                  </span>
                </div>
              </div>

              {/* Patient Profile Safeguards */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <ShieldAlert className="size-3.5 text-primary" />
                    Patient Population Profile:
                  </span>
                  <span className="font-bold text-primary font-mono text-[11px]">
                    {personaDef.label} ({personaDef.ageRange})
                  </span>
                </div>
                {effectiveProfile === "infant_toddler" || effectiveProfile === "child" ? (
                  <p className="text-destructive font-medium text-[11px]">
                    • PEDIATRIC ALERT: Aspirin & Pepto-Bismol are strictly prohibited (Reye&apos;s
                    syndrome). Initial antivenom is NOT reduced by weight.
                  </p>
                ) : null}
                {effectiveProfile === "pregnant_nursing" ? (
                  <p className="text-purple-700 dark:text-purple-300 font-medium text-[11px]">
                    • PREGNANCY ALERT: Doxycycline and Ivermectin are contraindicated. Amoxicillin
                    is safe for Lyme. Continuous electronic fetal monitoring if snakebite.
                  </p>
                ) : null}
                {effectiveProfile === "geriatric_immune" ? (
                  <p className="text-blue-700 dark:text-blue-300 font-medium text-[11px]">
                    • GERIATRIC ALERT: Diphenhydramine (Benadryl) is contraindicated per Beers
                    criteria (delirium & fall fractures). High sepsis vulnerability.
                  </p>
                ) : null}
              </div>

              {/* Emergency Red Flags */}
              <div className="rounded-xl border border-border/70 p-3 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Systemic Emergency Symptoms:
                </span>
                {reportedEmergencies.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-destructive font-bold">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>POSITIVE: {reportedEmergencies.map((e) => e.label).join(", ")}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Patient denied acute systemic emergencies at initial intake.</span>
                  </div>
                )}
              </div>

              {/* Photos */}
              <div className="flex gap-3">
                {lesionUrl && (
                  <div className="space-y-1">
                    <img
                      src={lesionUrl}
                      alt="Bite lesion photo"
                      className="size-24 rounded-lg object-cover border border-border"
                    />
                    <span className="text-[10px] text-muted-foreground block text-center">
                      Lesion Photo
                    </span>
                  </div>
                )}
                {bugUrl && (
                  <div className="space-y-1">
                    <img
                      src={bugUrl}
                      alt="Captured bug photo"
                      className="size-24 rounded-lg object-cover border border-border"
                    />
                    <span className="text-[10px] text-muted-foreground block text-center">
                      Captured Specimen
                    </span>
                  </div>
                )}
              </div>

              {/* Fast Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                <Button onClick={handleCopySbar} className="gap-1.5 text-xs font-semibold">
                  {isCopied ? (
                    <>
                      <Check className="size-4 text-emerald-400" />
                      <span>Copied EHR SBAR Note</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      <span>Copy Full EHR Clinical Note (SBAR)</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode("document")}
                  className="text-xs"
                >
                  Switch to Detailed Paper Report
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* DETAILED DOCUMENT VIEW (Always printed, visible when viewMode === "document") */}
        <div
          id="clinical-summary-print-root"
          className={`clinical-document space-y-4 pt-3 print:pt-0 text-foreground bg-card print:bg-white text-[13px] leading-normal ${
            viewMode === "er_triage" ? "hidden print:block" : "block"
          }`}
        >
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-foreground/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight uppercase">BiteID</span>
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground print:border print:border-neutral-300">
                  Patient-Initiated Screening Intake
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI Vision & Epidemiological Screening Memo — Formulated for Clinician Review
              </p>
            </div>
            <div className="text-right text-xs space-y-0.5">
              <p className="font-medium">
                Date: <span className="font-mono">{nowDate || "Current"}</span>
              </p>
              <p className="text-muted-foreground font-mono text-[11px]">
                Intake Ref: BID-{uniqueId}
              </p>
            </div>
          </div>

          {/* MANDATORY LEGAL & LIABILITY NOTICE BANNER */}
          <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-[11px] leading-relaxed text-neutral-800 print:border-neutral-400">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-neutral-900 mb-1">
              <ShieldAlert className="size-3.5 text-neutral-700" />
              <span>Notice to Attending Clinician & Patient (Non-Diagnostic Disclaimer)</span>
            </div>
            <p>
              This document is an <strong>informational patient-intake summary</strong> generated by
              an experimental computer vision and Bayesian likelihood model (BiteID). BiteID is{" "}
              <strong>NOT a licensed medical practitioner</strong>, certified diagnostic device, or
              telemedicine service. No doctor-patient relationship is created. The differential
              probabilities, vector hypotheses, and pathogens listed below are unconfirmed
              algorithmic estimates designed solely to assist a licensed healthcare provider in
              conducting a formal clinical history and physical examination.{" "}
              <strong>
                Clinical judgment by a licensed medical provider must always supersede this
                screening report.
              </strong>
            </p>
          </div>

          {/* Patient Reported Intake Parameters & Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border/70 pb-4">
            <div className="md:col-span-2 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                Patient Exposure & Intake History
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Anatomical Site
                  </span>
                  <span className="font-medium text-foreground">{locationLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Patient Sensation
                  </span>
                  <span className="font-medium text-foreground">{sensationLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Geographic State
                  </span>
                  <span className="font-medium text-foreground">{stateName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Onset / Duration
                  </span>
                  <span className="font-medium text-foreground">{durationName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Reported Environment
                  </span>
                  <span className="font-medium text-foreground">{envName}</span>
                </div>
              </div>

              {/* Red Flag Emergency Status */}
              <div className="mt-2 rounded border border-border/60 bg-muted/20 p-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Systemic Emergency Symptoms Screen
                </span>
                {reportedEmergencies.length > 0 ? (
                  <div className="mt-1 flex items-start gap-1.5 text-destructive font-semibold">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                    <span>
                      Positive for reported emergency symptoms:{" "}
                      {reportedEmergencies.map((e) => e.label).join(", ")}. Immediate medical
                      evaluation recommended.
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-1.5 text-foreground font-medium text-[12px]">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>
                      Patient denied acute systemic emergencies (no anaphylaxis, airway compromise,
                      or confusion reported at intake).
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Images Column */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                Submitted Photos
              </h3>
              <div className="flex gap-2">
                {lesionUrl ? (
                  <div className="space-y-1">
                    <img
                      src={lesionUrl}
                      alt="Lesion submission"
                      className="h-28 w-28 object-cover rounded border border-border print:border-neutral-400"
                    />
                    <span className="text-[10px] text-muted-foreground block text-center">
                      Lesion / Rash
                    </span>
                  </div>
                ) : (
                  <div className="h-28 w-28 flex items-center justify-center rounded border border-dashed text-xs text-muted-foreground text-center p-2">
                    No photo attached
                  </div>
                )}
                {bugUrl && (
                  <div className="space-y-1">
                    <img
                      src={bugUrl}
                      alt="Captured insect submission"
                      className="h-28 w-28 object-cover rounded border border-border print:border-neutral-400"
                    />
                    <span className="text-[10px] text-muted-foreground block text-center">
                      Captured Specimen
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Alert: Erythema Migrans Notice (if present) */}
          {isErythemaMigrans && (
            <div className="rounded-lg border-2 border-amber-600/40 bg-amber-50/50 p-3 text-xs text-amber-950 print:border-amber-700 space-y-1">
              <div className="flex items-center gap-2 font-bold uppercase text-amber-900">
                <AlertTriangle className="size-4 text-amber-700" />
                <span>
                  Special Clinical Consideration: Suspected Erythema Migrans (Early Lyme Disease)
                </span>
              </div>
              <p className="leading-relaxed">
                Visual inspection and epidemiological priors indicate an{" "}
                <strong>expanding annular or target lesion consistent with Erythema Migrans</strong>
                . Per CDC clinical management guidelines, acute Erythema Migrans is diagnostic for
                early localized Lyme disease; treatment with standard first-line antimicrobial
                therapy (e.g. doxycycline) should be clinically evaluated and not delayed awaiting
                serology, which is often negative during the early acute stage.
              </p>
              <p className="font-semibold text-[11px] text-amber-900">
                Recommendation: Clinician should physically inspect margins, palpate regional lymph
                nodes, check for systemic constitutional symptoms (fever, arthralgia, neck
                stiffness), and consider active boundary measurement over 24–48 hours.
              </p>
            </div>
          )}

          {/* Special Populations & Vulnerability Profile */}
          <div className="rounded-lg border border-border/80 bg-muted/15 p-3.5 text-xs space-y-2 print:border-neutral-400">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="size-3.5 text-primary" />
                Special Populations & Vulnerability Considerations
              </span>
              <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                Patient Profile: {personaDef.label} ({personaDef.ageRange})
              </span>
            </div>

            <div className="space-y-1.5 leading-relaxed text-foreground text-[11px]">
              {effectiveProfile === "infant_toddler" && (
                <div className="space-y-1">
                  <p className="font-semibold text-rose-700 dark:text-rose-400">
                    • High Venom-to-Body-Mass Ratio: Rapid systemic progression. Initial antivenom
                    (CroFab / Anascorp) is NOT weight-reduced (neutralizes fixed mass of circulating
                    venom).
                  </p>
                  <p className="text-muted-foreground">
                    • Pediatric Dosing Safety: Dose fever/analgesic medications strictly by body
                    weight (kg) via calibrated oral syringe, never household spoons. Never
                    administer Aspirin or Pepto-Bismol (fatal Reye&apos;s syndrome risk).
                  </p>
                  <p className="text-muted-foreground">
                    • &quot;Do Not Miss&quot; Atypical Presentations: Watch for opsoclonus &
                    excessive drooling in scorpion stings; board-like rigid abdomen (appendicitis
                    mimic) in widow bites; scalp, face, and sole burrows in scabies.
                  </p>
                </div>
              )}

              {effectiveProfile === "child" && (
                <div className="space-y-1">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    • Aspirin Prohibition: Strictly avoid acetylsalicylic acid and bismuth
                    subsalicylate (Pepto-Bismol) due to Reye&apos;s syndrome.
                  </p>
                  <p className="text-muted-foreground">
                    • Anaphylaxis Dosing: EpiPen Jr (0.15 mg) for 7.5–30 kg (16.5–66 lbs); adult
                    auto-injector (0.30 mg) for &gt; 30 kg.
                  </p>
                  <p className="text-muted-foreground">
                    • Tick-Borne Prophylaxis: Short-course Doxycycline (&lt; 21d) is AAP approved
                    for confirmed Lyme/RMSF. RMSF requires immediate Doxycycline regardless of age.
                  </p>
                </div>
              )}

              {effectiveProfile === "pregnant_nursing" && (
                <div className="space-y-1">
                  <p className="font-semibold text-purple-700 dark:text-purple-300">
                    • Pharmacotherapy Contraindications: Doxycycline is CONTRAINDICATED (Category D:
                    permanent dental staining & bone suppression). Oral Ivermectin and Lindane are
                    CONTRAINDICATED.
                  </p>
                  <p className="text-muted-foreground">
                    • Safe First-Line Alternatives: Amoxicillin 500 mg PO TID for 14–21 days (or
                    Cefuroxime axetil 500 mg PO BID) for Lyme disease. Permethrin 5% cream is
                    Category B and safe for scabies.
                  </p>
                  <p className="text-muted-foreground">
                    • Maternal-Fetal Envenomation: Snakebite/scorpion envenomation risks placental
                    abruption; requires continuous electronic fetal monitoring and maternal ICU
                    admission. Antivenom is safe.
                  </p>
                </div>
              )}

              {effectiveProfile === "geriatric_immune" && (
                <div className="space-y-1">
                  <p className="font-semibold text-blue-700 dark:text-blue-300">
                    • Beers Criteria Warning: Strictly avoid sedating 1st-generation antihistamines
                    (Diphenhydramine) due to high anticholinergic risk of acute delirium, urinary
                    retention, and fall fractures. Use 2nd-gen Cetirizine or Loratadine.
                  </p>
                  <p className="text-muted-foreground">
                    • Blunted Host Response: Atypical faint Erythema Migrans; Norwegian/crusted
                    scabies presenting as painless hyperkeratosis; blunted fever spikes.
                  </p>
                  <p className="text-muted-foreground">
                    • Sepsis & Secondary Infection Risk: Accelerated cellulitis and bacteremia in
                    patients with venous stasis or diabetes; qSOFA screening recommended.
                  </p>
                </div>
              )}

              {effectiveProfile === "standard_adult" && (
                <p className="text-muted-foreground">
                  Standard adult toxicological first aid and antimicrobial treatment guidelines
                  apply.
                </p>
              )}
            </div>
          </div>

          {/* Objective Visual Dermatology Findings */}
          {response.dermatologicalFindings && (
            <div className="rounded border border-border/80 p-3 bg-muted/10 text-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block">
                Objective AI Visual Morphology Reading
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Pattern</span>
                  <span className="font-semibold text-foreground capitalize">
                    {response.dermatologicalFindings.pattern.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Primary Lesion</span>
                  <span className="font-semibold text-foreground capitalize">
                    {response.dermatologicalFindings.primaryLesion?.replace(/_/g, " ") ?? "None"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">
                    Central Characteristic
                  </span>
                  <span className="font-semibold text-foreground capitalize">
                    {response.dermatologicalFindings.centralFeatures.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Estimated Size</span>
                  <span className="font-semibold text-foreground">
                    {response.dermatologicalFindings.estimatedDiameter === "under_1cm"
                      ? "< 1 cm"
                      : response.dermatologicalFindings.estimatedDiameter === "1_to_5cm"
                        ? "1–5 cm"
                        : response.dermatologicalFindings.estimatedDiameter === "over_5cm"
                          ? "> 5 cm"
                          : "Diffuse"}
                  </span>
                </div>
              </div>
              {response.mimickerAlert?.detected && (
                <div className="mt-1 pt-1.5 border-t border-border/50 text-[11px] text-amber-900 font-medium">
                  <strong>Differential Note:</strong> Visual traits exhibit overlap with
                  non-arthropod{" "}
                  <span className="capitalize">
                    {response.mimickerAlert.condition.replace(/_/g, " ")}
                  </span>
                  . {response.mimickerAlert.explanation}
                </div>
              )}
            </div>
          )}

          {/* AI Differential Hypotheses */}
          <div className="space-y-3 border-b border-border/70 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1 flex items-center justify-between">
              <span>Algorithmic Differential Hypotheses (For Clinician Evaluation)</span>
              <span className="text-[10px] font-normal text-muted-foreground lowercase">
                ranked by likelihood model
              </span>
            </h3>

            {topResult && (
              <div className="rounded border border-border/80 p-3 bg-muted/10 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-foreground">1. {topResult.name}</span>
                    {topResult.scientificName && (
                      <span className="italic text-xs text-muted-foreground">
                        ({topResult.scientificName})
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-sm text-foreground font-mono">
                    Likelihood Score:{" "}
                    {Math.round(topResult.confidence ?? topResult.probability ?? 0)}%
                  </span>
                </div>

                {topResult.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    Morphology: {topResult.description}
                  </p>
                )}

                {topResult.matchedFactors && topResult.matchedFactors.length > 0 && (
                  <div className="text-xs">
                    <span className="font-semibold text-[11px] uppercase text-muted-foreground block">
                      Contributing Assessment Factors:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-foreground mt-0.5">
                      {topResult.matchedFactors.map((factor, i) => (
                        <li key={i}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {topResult.associatedPathogens && topResult.associatedPathogens.length > 0 && (
                  <div className="text-xs pt-1 border-t border-border/40">
                    <span className="font-semibold text-[11px] uppercase text-muted-foreground block">
                      Associated Pathogens / Vector Risks:
                    </span>
                    <p className="font-mono text-xs text-foreground mt-0.5">
                      {topResult.associatedPathogens.join(" • ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {secondaryResults.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  Secondary Differentials Evaluated:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {secondaryResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded border border-border/50 bg-card"
                    >
                      <div>
                        <span className="font-semibold">
                          {idx + 2}. {item.name}
                        </span>
                        {item.scientificName && (
                          <span className="italic text-[11px] text-muted-foreground ml-1">
                            ({item.scientificName})
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-muted-foreground">
                        {Math.round(item.confidence ?? item.probability ?? 0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Non-Vector Lookalikes Evaluated */}
          {lookalikes.length > 0 && (
            <div className="space-y-1.5 border-b border-border/70 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                  Non-Arthropod Lookalikes to Clinically Rule Out (Top Differentials):
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Prioritized by lesion pattern & presentation
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                {lookalikes.slice(0, 4).map((lk) => (
                  <div
                    key={lk.id}
                    className="rounded border border-border/70 bg-card p-2 space-y-1"
                  >
                    <p className="font-semibold text-[11px] text-foreground">{lk.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      <strong>Differentiating Sign:</strong>{" "}
                      {lk.differentiatingFeatures[0]?.lookalikeSign ?? lk.summary}
                    </p>
                    <p className="text-[10px] text-primary font-medium leading-tight">
                      <strong>Workup:</strong> {lk.clinicalEvaluationTips[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rash Journal 24-48h Progression Record (if present) */}
          {rashJournal && (
            <div className="rounded border border-border/80 bg-muted/20 p-2.5 text-xs space-y-1 border-b border-border/70 pb-3">
              <span className="text-[10px] font-bold uppercase text-primary block">
                Patient 24–48h Centrifugal Rash Expansion Log:
              </span>
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                <div>
                  Day 1 Baseline: <strong>{rashJournal.baselineDiameterMm} mm</strong>
                </div>
                {rashJournal.followUpDiameterMm && (
                  <div>
                    Follow-Up Size: <strong>{rashJournal.followUpDiameterMm} mm</strong> (Delta:{" "}
                    <strong>
                      {rashJournal.followUpDiameterMm - rashJournal.baselineDiameterMm >= 0
                        ? `+${rashJournal.followUpDiameterMm - rashJournal.baselineDiameterMm}`
                        : rashJournal.followUpDiameterMm - rashJournal.baselineDiameterMm}{" "}
                      mm
                    </strong>
                    )
                  </div>
                )}
              </div>
            </div>
          )}

          {/* First Aid & Signs Under Observation */}
          {topResult &&
            (topResult.firstAidAdvice?.length || topResult.warningSignsToWatch?.length) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-border/70 pb-3">
                {topResult.firstAidAdvice && topResult.firstAidAdvice.length > 0 && (
                  <div>
                    <span className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                      Standard First Aid Measures:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                      {topResult.firstAidAdvice.map((fa, i) => (
                        <li key={i}>{fa}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {topResult.warningSignsToWatch && topResult.warningSignsToWatch.length > 0 && (
                  <div>
                    <span className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                      Patient Monitored Warning Signs:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                      {topResult.warningSignsToWatch.map((ws, i) => (
                        <li key={i}>{ws}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          {/* Final Legal Disclaimer / Signature Block */}
          <div className="pt-2 text-[10px] leading-relaxed text-muted-foreground border-t border-border/60">
            <p className="font-semibold text-foreground">
              ATTENDING CLINICIAN REVIEW & LEGAL DISCLAIMER:
            </p>
            <p className="mt-0.5">
              BiteID is an informational research and decision-support prototype. It does not
              provide medical diagnoses, treatment prescriptions, or emergency triage triage
              certification. Arthropod bites, stings, and dermatologic presentations can have
              overlapping presentations, atypical morphologies, or dangerous lookalikes (including
              bacterial cellulitis, MRSA, necrotizing fasciitis, fungal ringworm, and allergic
              contact dermatitis). The patient has been informed to seek immediate licensed
              emergency care if experiencing acute signs of anaphylaxis, shock, rapid tissue
              necrosis, or airway obstruction.
            </p>
            <div className="mt-4 flex justify-between items-end pt-4 border-t border-border/40 text-[10px] text-muted-foreground">
              <div>Clinician Signature: ___________________________</div>
              <div>Date: _______________</div>
              <div>BiteID Alpha • Clinician Handout Memo</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
