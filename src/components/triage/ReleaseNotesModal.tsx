import { Sparkles, CheckCircle2, ShieldAlert, Cpu, Layers, BookOpen, Bug, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type ReleaseNotesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReleaseNotesModal({ open, onOpenChange }: ReleaseNotesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border border-border bg-card p-0 text-foreground sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Sparkles className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  BiteID Changelog
                </span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  v1.2.0 • Latest
                </span>
              </div>
              <DialogTitle className="font-display text-xl sm:text-2xl font-bold leading-tight text-foreground">
                Release &amp; Version Notes
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Transparent release history detailing our clinical decision support updates, evidence-based
            entomological expansions, and diagnostic safety safeguards.
          </DialogDescription>

          <div className="space-y-6">
            {/* Version 1.2.0 */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/15 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold">
                    v1.2.0
                  </span>
                  <span className="font-display text-sm font-bold text-foreground">
                    Ethical Expansion &amp; Multi-Tone Library Verification
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">September 2026</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <Bug className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Ethical Vector Expansion (39 Species Total):</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                      <li>
                        <span className="text-foreground font-medium">Bird &amp; Rodent Mites (<em>Ornithonyssus / Dermanyssus</em>):</span> Solves a major clinical dilemma where non-burrowing avian/rodent mites cause severe nocturnal papules often misdiagnosed as scabies or bed bugs. Clarifies environmental nest remediation over toxic scabicide overuse.
                      </li>
                      <li>
                        <span className="text-foreground font-medium">Pacific Coast Tick (<em>Dermacentor occidentalis</em>):</span> Adds dedicated West Coast coverage for <em>Rickettsia 364D</em> (Pacific Coast tick fever) with its pathognomonic black inoculation eschar (<em>tache noire</em>). Hard-fenced to CA, OR, and WA to prevent nationwide false alarms.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Layers className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">100% Multi-Tone Photographic Parity:</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Completed photographic reference assets across all three Fitzpatrick skin tone tiers (I–II, III–IV, V–VI) for 100% of vectors (117 total tone-specific reaction patterns + 30 temporal progression stages). Verified by 674 automated passing test assertions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">4-Pillar Clinical Decision Support Framework:</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Established formal criteria for candidate inclusion (pathogen reality, pre-test probability geo-fencing, actionable clinical divergence, and melanin calibration). Intentionally dispels debunked folklore (e.g. hobo spider necrotic myths) to protect patients from delayed MRSA/staph care.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Header &amp; Layout Polish:</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Cleaned top navigation bar to prevent title wrapping on mobile displays; added direct footer access to release notes and privacy wiping tools.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Version 1.1.0 */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-muted text-foreground px-2 py-0.5 text-xs font-semibold">
                    v1.1.0
                  </span>
                  <span className="font-display text-sm font-semibold text-foreground">
                    Backcountry Offline Protocol &amp; Pediatric Locks
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">September 2026</span>
              </div>

              <ul className="space-y-1.5 text-xs text-muted-foreground list-inside list-disc">
                <li><strong className="text-foreground">0-Cell-Service Backcountry Kit:</strong> Offline intake queueing, localized GPS state inference, and printable pocket triage card.</li>
                <li><strong className="text-foreground">Pediatric &amp; Vulnerable Safety Engine:</strong> Strict weight-based dosing calculators, immutable &lt;6 mo ibuprofen blocks, &lt;2 yr antihistamine safeguards, and Reye&apos;s syndrome aspirin alerts.</li>
                <li><strong className="text-foreground">Mammalian / Bat Rabies Screener:</strong> Mandatory screening for bat contact and painless nocturnal bites requiring urgent Post-Exposure Prophylaxis (PEP).</li>
              </ul>
            </div>

            {/* Version 1.0.0 */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-muted text-foreground px-2 py-0.5 text-xs font-semibold">
                    v1.0.0
                  </span>
                  <span className="font-display text-sm font-semibold text-foreground">
                    Initial Alpha Engine Deployment
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">September 2026</span>
              </div>

              <ul className="space-y-1.5 text-xs text-muted-foreground list-inside list-disc">
                <li><strong className="text-foreground">Vision &amp; Vector Scoring Engine:</strong> Server-side Bayesian geo-pest prior ranking across North American vectors.</li>
                <li><strong className="text-foreground">Red-Flag Emergency Gating:</strong> Immediate modal alerts for systemic anaphylaxis, respiratory distress, and spreading lymphangitis.</li>
                <li><strong className="text-foreground">Safe Harbor Architecture:</strong> Clear non-physician visual scribe framing to prevent uncalibrated self-diagnosis.</li>
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <Button
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Close Release Notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
