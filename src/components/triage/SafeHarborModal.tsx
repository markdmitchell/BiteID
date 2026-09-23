import { ShieldCheck, Camera, AlertTriangle, FileText, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type SafeHarborModalProps = {
  open: boolean;
  onAcknowledge: () => void;
};

export function SafeHarborModal({ open, onAcknowledge }: SafeHarborModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onAcknowledge()}>
      <DialogContent className="overflow-hidden border border-border bg-card p-0 text-foreground sm:max-w-xl max-h-[92vh] overflow-y-auto">
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Informed Consent & Safe Harbor
              </span>
              <DialogTitle className="font-display text-xl sm:text-2xl font-bold leading-tight text-foreground">
                Your Patient Advocate & Clinical Scribe
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Welcome to BiteID. We created this tool to help you document skin changes, check for
            emergency warning signs, and walk into your doctor&apos;s office prepared. Please review
            our intended role:
          </DialogDescription>

          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 p-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/15 p-1.5 text-primary shrink-0 mt-0.5">
                <Camera className="size-4" />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  1. Objective Evidence & Timeline Journal
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Helps you capture calibrated photos with a coin scale, track expansion velocity
                  (mm/day), and log symptoms so you don&apos;t have to rely on guesswork.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-md bg-destructive/15 p-1.5 text-destructive shrink-0 mt-0.5">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <p className="font-bold text-foreground">2. Hospital Red Flag Screener</p>
                <p className="text-muted-foreground mt-0.5">
                  Helps identify life-threatening emergencies (anaphylaxis, rabies exposure,
                  venomous envenomation, and spreading bacterial lymphangitis) that require
                  immediate 911 or ER care.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-md bg-emerald-500/15 p-1.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <FileText className="size-4" />
              </div>
              <div>
                <p className="font-bold text-foreground">3. Doctor-Ready Clinical Handoff (SBAR)</p>
                <p className="text-muted-foreground mt-0.5">
                  Synthesizes your photos, travel history, and vitals into a structured note and
                  scannable QR matrix that your physician can import directly into your medical
                  record.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
              <Stethoscope className="size-4" />
              <span>Non-Device Safe Harbor & Medical Reality</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              <strong>BiteID is not a doctor.</strong> Diagnosis is a licensed medical act requiring
              physical examination. BiteID provides educational visual comparisons and
              record-keeping tools only. It does not provide medical diagnoses, treatment plans, or
              prescription orders. Always consult a qualified physician or healthcare provider for
              medical concerns.
            </p>
          </div>

          <Button
            type="button"
            onClick={onAcknowledge}
            className="w-full text-sm font-semibold shadow-xs"
          >
            I Understand &amp; Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
