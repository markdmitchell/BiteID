import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  PenTool,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RashJournalEntry = {
  baselineDate: string;
  baselineDiameterMm: number;
  baselinePhotoUrl?: string;
  followUpDate?: string;
  followUpDiameterMm?: number;
  followUpPhotoUrl?: string;
  notes?: string;
};

const STORAGE_KEY = "biteid_rash_journal_record";

type RashExpansionTrackerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLesionFile?: File | null;
  isErythemaMigrans?: boolean;
};

export function RashExpansionTracker({
  open,
  onOpenChange,
  initialLesionFile,
  isErythemaMigrans = false,
}: RashExpansionTrackerProps) {
  const [entry, setEntry] = useState<RashJournalEntry | null>(null);

  // Form states for adding / updating
  const [diameterInput, setDiameterInput] = useState<string>("");
  const [unit, setUnit] = useState<"mm" | "in">("mm");
  const [followUpDiameterInput, setFollowUpDiameterInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntry(JSON.parse(stored) as RashJournalEntry);
      }
    } catch {
      // ignore localStorage errors
    }
  }, [open]);

  // Save Day 1 Baseline
  const handleSaveBaseline = () => {
    const rawVal = parseFloat(diameterInput);
    if (isNaN(rawVal) || rawVal <= 0) return;
    const mm = unit === "in" ? Math.round(rawVal * 25.4) : Math.round(rawVal);

    let photoUrl: string | undefined = undefined;
    if (initialLesionFile) {
      photoUrl = URL.createObjectURL(initialLesionFile);
    }

    const newRecord: RashJournalEntry = {
      baselineDate: new Date().toISOString(),
      baselineDiameterMm: mm,
      baselinePhotoUrl: photoUrl,
      notes: notesInput,
    };

    setEntry(newRecord);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecord));
    } catch {
      // ignore storage quota error
    }
  };

  // Save Follow-Up Check-in
  const handleSaveFollowUp = () => {
    if (!entry) return;
    const rawVal = parseFloat(followUpDiameterInput);
    if (isNaN(rawVal) || rawVal <= 0) return;
    const mm = unit === "in" ? Math.round(rawVal * 25.4) : Math.round(rawVal);

    const updated: RashJournalEntry = {
      ...entry,
      followUpDate: new Date().toISOString(),
      followUpDiameterMm: mm,
    };

    setEntry(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleResetJournal = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEntry(null);
    setDiameterInput("");
    setFollowUpDiameterInput("");
    setNotesInput("");
  };

  // Analysis of expansion
  const hasFollowUp = Boolean(entry?.followUpDiameterMm && entry?.followUpDate);
  const deltaMm =
    hasFollowUp && entry ? (entry.followUpDiameterMm ?? 0) - entry.baselineDiameterMm : null;

  let expansionStatus: "rapid" | "moderate" | "stable" | "regressing" | null = null;
  if (deltaMm !== null) {
    if (deltaMm >= 10) expansionStatus = "rapid";
    else if (deltaMm >= 4) expansionStatus = "moderate";
    else if (deltaMm >= -3) expansionStatus = "stable";
    else expansionStatus = "regressing";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary">
            <Activity className="size-5 shrink-0" />
            <DialogTitle className="font-display text-lg font-bold text-foreground">
              24–48h Centrifugal Rash Expansion Tracker
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            A clinical tool to track whether an annular rash or bite is expanding outward over time,
            which is the single most critical diagnostic indicator of Lyme disease (Erythema
            Migrans) or spreading cellulitis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Clinical Pen Tracing Technique Guide */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <PenTool className="size-4" />
              <span>Standard Clinical Pen-Tracing Technique</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed text-foreground">
              <li>
                <strong>Draw a light margin line:</strong> Use a standard pen to trace the outermost
                visible border of redness.
              </li>
              <li>
                <strong>Include a reference object:</strong> Place a coin (penny/quarter) or small
                ruler beside the lesion and take a clear photo.
              </li>
              <li>
                <strong>Measure the widest diameter:</strong> Record the measurement below for Day
                1.
              </li>
              <li>
                <strong>Re-evaluate at 24 and 48 hours:</strong> Check whether the redness has
                expanded beyond your pen line.
              </li>
            </ol>
          </div>

          {/* Active Record or New Baseline Entry */}
          {!entry ? (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-display text-sm font-bold text-foreground">
                Step 1: Set Your Day 1 Baseline Measurement
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter the approximate widest diameter of the redness or rash today.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Widest Diameter</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder={unit === "mm" ? "e.g. 35" : "e.g. 1.5"}
                      value={diameterInput}
                      onChange={(e) => setDiameterInput(e.target.value)}
                      className="text-sm font-mono"
                    />
                    <div className="flex rounded-lg border border-border p-0.5 bg-muted/30 text-xs">
                      <button
                        type="button"
                        onClick={() => setUnit("mm")}
                        className={cn(
                          "px-2.5 py-1 rounded font-medium",
                          unit === "mm"
                            ? "bg-card text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        mm
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnit("in")}
                        className={cn(
                          "px-2.5 py-1 rounded font-medium",
                          unit === "in"
                            ? "bg-card text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        inches
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <Button
                    type="button"
                    onClick={handleSaveBaseline}
                    disabled={!diameterInput || parseFloat(diameterInput) <= 0}
                    className="w-full"
                  >
                    Save Baseline
                  </Button>
                </div>
              </div>

              {initialLesionFile && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>
                    Your current intake photo will be linked as the Day 1 baseline reference.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              {/* Baseline Summary */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Day 1 Baseline
                  </span>
                  <p className="font-mono text-base font-bold text-foreground">
                    {entry.baselineDiameterMm} mm{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({(entry.baselineDiameterMm / 25.4).toFixed(1)} in)
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Recorded: {new Date(entry.baselineDate).toLocaleDateString()} at{" "}
                    {new Date(entry.baselineDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetJournal}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="size-3 mr-1" />
                  Reset Journal
                </Button>
              </div>

              {/* Follow-up Section */}
              {!hasFollowUp ? (
                <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4">
                  <h4 className="font-display text-sm font-bold text-foreground">
                    Step 2: 24–48 Hour Check-in
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When you inspect the bite tomorrow or the day after, re-measure the widest
                    diameter beyond your initial pen boundary line and record it here.
                  </p>

                  <div className="flex flex-wrap items-end gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        New Diameter (mm)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 50"
                        value={followUpDiameterInput}
                        onChange={(e) => setFollowUpDiameterInput(e.target.value)}
                        className="w-36 text-sm font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleSaveFollowUp}
                      disabled={!followUpDiameterInput || parseFloat(followUpDiameterInput) <= 0}
                    >
                      Calculate Expansion
                    </Button>
                  </div>
                </div>
              ) : (
                /* Follow-up Results Display */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Day 1 Baseline
                      </span>
                      <span className="font-mono text-base font-bold text-foreground">
                        {entry.baselineDiameterMm} mm
                      </span>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Follow-Up Size
                      </span>
                      <span className="font-mono text-base font-bold text-foreground">
                        {entry.followUpDiameterMm} mm
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 rounded-lg border border-border/80 bg-muted/20 p-3">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Expansion Delta
                      </span>
                      <span
                        className={cn(
                          "font-mono text-base font-bold",
                          deltaMm && deltaMm > 0 ? "text-caution-foreground" : "text-primary",
                        )}
                      >
                        {deltaMm && deltaMm > 0 ? `+${deltaMm} mm` : `${deltaMm} mm`}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Interpretation Callout */}
                  {expansionStatus === "rapid" && (
                    <div className="rounded-xl border-2 border-caution/50 bg-caution/10 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-caution-foreground text-sm">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Significant Centrifugal Expansion Detected (+{deltaMm} mm)</span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        An expansion of <strong>{deltaMm} mm outward</strong> past the initial
                        border within 24–48 hours is a key clinical characteristic of{" "}
                        <strong>Erythema Migrans (Lyme disease)</strong> or rapidly spreading
                        bacterial cellulitis. Local allergic bite reactions typically peak within 24
                        hours and do not continuously expand outward.
                      </p>
                      <p className="font-semibold text-foreground">
                        Recommended Action: Present these measurements to a healthcare clinician
                        promptly.
                      </p>
                    </div>
                  )}

                  {expansionStatus === "moderate" && (
                    <div className="rounded-xl border border-caution/40 bg-caution/10 p-4 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-caution-foreground">
                        <TrendingUp className="size-4 shrink-0" />
                        <span>Moderate Expansion (+{deltaMm} mm)</span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        The lesion has enlarged by {deltaMm} mm. Continue careful observation over
                        the next 24 hours. If it continues expanding or reaches &gt; 50 mm (2
                        inches) in diameter, seek clinical evaluation for suspected Erythema
                        Migrans.
                      </p>
                    </div>
                  )}

                  {expansionStatus === "stable" && (
                    <div className="rounded-xl border border-border bg-card p-4 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-primary">
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                        <span>Stable Margin (No Substantial Centrifugal Expansion)</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        The margin has remained within {deltaMm} mm of baseline. Stable boundaries
                        are characteristic of localized arthropod hypersensitivity wheals rather
                        than expanding Erythema Migrans.
                      </p>
                    </div>
                  )}

                  {expansionStatus === "regressing" && (
                    <div className="rounded-xl border border-border bg-card p-4 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-primary">
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                        <span>Lesion Regressing / Decreasing in Size</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        The lesion diameter decreased by {Math.abs(deltaMm ?? 0)} mm from baseline,
                        indicating resolution of the inflammatory reaction.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-[11px] text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Clinical Reference Note</span>
            </div>
            <p className="leading-relaxed">
              Per CDC guidelines, acute Erythema Migrans typically expands over several days, often
              reaching up to 30 cm (12 inches) across with or without central clearing. In contrast,
              immediate hypersensitivity reactions to tick saliva or insect stings usually measure
              &lt; 5 cm (&lt; 2 inches), do not actively expand after 24–48 hours, and fade rapidly.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
