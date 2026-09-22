import { useEffect, useState, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, AlertTriangle, CheckCircle2, FileText, ShieldAlert } from "lucide-react";
import {
  type TriageResponse,
  type TriageFormState,
  normalizeResults,
  BODY_LOCATION_OPTIONS,
  SENSATION_OPTIONS,
  EMERGENCY_SYMPTOMS,
  ENVIRONMENT_OPTIONS,
  DURATION_OPTIONS,
} from "@/lib/triage";
import { stateLabel } from "@/lib/us-states";

type ClinicalSummaryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: TriageResponse;
  form: TriageFormState;
  isErythemaMigrans: boolean;
};

export function ClinicalSummaryModal({
  open,
  onOpenChange,
  response,
  form,
  isErythemaMigrans,
}: ClinicalSummaryModalProps) {
  const [lesionUrl, setLesionUrl] = useState<string | null>(null);
  const [bugUrl, setBugUrl] = useState<string | null>(null);
  const [nowDate, setNowDate] = useState<string>("");
  const uniqueId = useId().replace(/:/g, "").slice(0, 8).toUpperCase();

  useEffect(() => {
    if (form.lesionImage) {
      const url = URL.createObjectURL(form.lesionImage);
      setLesionUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLesionUrl(null);
    }
  }, [form.lesionImage]);

  useEffect(() => {
    if (form.bugImage) {
      const url = URL.createObjectURL(form.bugImage);
      setBugUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBugUrl(null);
    }
  }, [form.bugImage]);

  useEffect(() => {
    if (open) {
      setNowDate(
        new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      );
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

  const reportedEmergencies = EMERGENCY_SYMPTOMS.filter((sym) => form.symptoms.includes(sym.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Action Header (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-border pb-3 no-print">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Clinical Handout & Doctor Summary
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Print or save as PDF to present to your urgent care or primary care clinician.
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="font-medium">
              <Printer className="size-4 mr-1.5" />
              Print / Save PDF
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

        {/* The Print-Optimized Document Container */}
        <div
          id="clinical-summary-print-root"
          className="clinical-document space-y-4 pt-3 print:pt-0 text-foreground bg-card print:bg-white text-[13px] leading-normal"
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
