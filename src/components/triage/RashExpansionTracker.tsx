import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  CheckCircle2,
  Clock,
  PenTool,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Camera,
  Plus,
  Trash2,
  SlidersHorizontal,
  Sparkles,
  PhoneCall,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Flame,
  Thermometer,
} from "lucide-react";
import { PhotoComparisonSlider } from "./PhotoComparisonSlider";
import { analyseLesionProgressionFn } from "@/lib/triage.functions";
import type { ProgressionEvaluation } from "@/lib/progression-engine.server";
import type { PatientVulnerabilityProfile } from "@/lib/triage";

export type JournalEntry = {
  id: string;
  date: string;
  dayLabel: string;
  diameterMm: number;
  photoUrl?: string;
  notes?: string;
  aiEvaluation?: ProgressionEvaluation;
};

const STORAGE_KEY = "biteid_rash_journal_record_v2";

type RashExpansionTrackerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLesionFile?: File | null;
  isErythemaMigrans?: boolean;
  suspectedCondition?: string;
  patientProfile?: PatientVulnerabilityProfile;
};

export function RashExpansionTracker({
  open,
  onOpenChange,
  initialLesionFile,
  suspectedCondition = "Insect bite / cutaneous lesion",
  patientProfile = "standard_adult",
}: RashExpansionTrackerProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [diameterInput, setDiameterInput] = useState<string>("");
  const [unit, setUnit] = useState<"mm" | "in">("mm");
  const [notesInput, setNotesInput] = useState<string>("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "ai_delta" | "slider" | "guidance">(
    "timeline",
  );
  const followUpPhotoInputRef = useRef<HTMLInputElement>(null);

  // AI Progression State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>("");
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string>("");
  const [reportedSymptoms, setReportedSymptoms] = useState<string[]>([]);
  const [activeEvaluation, setActiveEvaluation] = useState<ProgressionEvaluation | null>(null);

  // Load from local storage
  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored) as JournalEntry[]);
      } else {
        const v1 = localStorage.getItem("biteid_rash_journal_record");
        if (v1) {
          const parsed = JSON.parse(v1);
          const migrated: JournalEntry[] = [
            {
              id: "baseline",
              date: parsed.baselineDate || new Date().toISOString(),
              dayLabel: "Day 1 (Baseline)",
              diameterMm: parsed.baselineDiameterMm,
              photoUrl: parsed.baselinePhotoUrl,
              notes: parsed.notes,
            },
          ];
          if (parsed.followUpDate && parsed.followUpDiameterMm) {
            migrated.push({
              id: "followup-1",
              date: parsed.followUpDate,
              dayLabel: "Follow-Up (Day 2)",
              diameterMm: parsed.followUpDiameterMm,
              photoUrl: parsed.followUpPhotoUrl,
            });
          }
          setEntries(migrated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
      }
    } catch {
      // ignore
    }
  }, [open]);

  // Handle Initial Lesion photo preview & convert to data URL for persistent journal
  useEffect(() => {
    if (initialLesionFile && entries.length === 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setSelectedPhoto(dataUrl);
      };
      reader.readAsDataURL(initialLesionFile);
    }
  }, [initialLesionFile, entries.length]);

  const handleAddEntry = () => {
    const rawVal = parseFloat(diameterInput);
    if (isNaN(rawVal) || rawVal <= 0) return;
    const mm = unit === "in" ? Math.round(rawVal * 25.4) : Math.round(rawVal);

    const dayNumber = entries.length + 1;
    const dayLabel = dayNumber === 1 ? "Day 1 (Baseline)" : `Day ${dayNumber} Follow-Up`;

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: new Date().toISOString(),
      dayLabel,
      diameterMm: mm,
      photoUrl: selectedPhoto ?? undefined,
      notes: notesInput.trim() || undefined,
    };

    const updated = [...entries, newEntry];
    setEntries(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setDiameterInput("");
    setNotesInput("");
    setSelectedPhoto(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedPhoto(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("biteid_rash_journal_record");
    setEntries([]);
    setDiameterInput("");
    setNotesInput("");
    setSelectedPhoto(null);
    setActiveEvaluation(null);
  };

  // Entries with photos for comparison slider and AI Delta
  const entriesWithPhotos = entries.filter((e) => Boolean(e.photoUrl));

  // Auto-sync selection IDs
  useEffect(() => {
    if (entriesWithPhotos.length >= 2) {
      if (!selectedBaselineId || !entriesWithPhotos.some((e) => e.id === selectedBaselineId)) {
        setSelectedBaselineId(entriesWithPhotos[0].id);
      }
      if (!selectedFollowUpId || !entriesWithPhotos.some((e) => e.id === selectedFollowUpId)) {
        const lastIdx = entriesWithPhotos.length - 1;
        setSelectedFollowUpId(entriesWithPhotos[lastIdx].id);
      }
    }
  }, [entriesWithPhotos, selectedBaselineId, selectedFollowUpId]);

  // Load existing AI evaluation from selected follow-up entry
  useEffect(() => {
    if (selectedFollowUpId) {
      const target = entries.find((e) => e.id === selectedFollowUpId);
      if (target?.aiEvaluation) {
        setActiveEvaluation(target.aiEvaluation);
      }
    }
  }, [selectedFollowUpId, entries]);

  // Trajectory analytics
  const firstEntry = entries[0];
  const latestEntry = entries[entries.length - 1];
  const hasMultiple = entries.length >= 2;

  let totalDeltaMm = 0;
  let expansionRateMmPerDay = 0;
  let hoursElapsed = 0;

  if (hasMultiple && firstEntry && latestEntry) {
    totalDeltaMm = latestEntry.diameterMm - firstEntry.diameterMm;
    const msElapsed = new Date(latestEntry.date).getTime() - new Date(firstEntry.date).getTime();
    hoursElapsed = Math.max(1, Math.round(msElapsed / (1000 * 60 * 60)));
    const daysElapsed = Math.max(0.1, hoursElapsed / 24);
    expansionRateMmPerDay = Math.round((totalDeltaMm / daysElapsed) * 10) / 10;
  }

  // Trajectory classification
  const isRapidCentrifugal =
    totalDeltaMm >= 10 ||
    expansionRateMmPerDay >= 5 ||
    (latestEntry && latestEntry.diameterMm >= 50);
  const isRegressing = totalDeltaMm < -2;

  const toggleSymptom = (sym: string) => {
    setReportedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );
  };

  // Convert image URL to Data URL if needed
  const ensureDataUrl = async (url: string): Promise<string> => {
    if (url.startsWith("data:")) return url;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return url;
    }
  };

  const handleRunAiEvaluation = async () => {
    const baseline = entries.find((e) => e.id === selectedBaselineId);
    const followUp = entries.find((e) => e.id === selectedFollowUpId);

    if (!baseline?.photoUrl || !followUp?.photoUrl) {
      setAiError("Both baseline and follow-up entries must include a photograph.");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const [baselineDataUrl, followUpDataUrl] = await Promise.all([
        ensureDataUrl(baseline.photoUrl),
        ensureDataUrl(followUp.photoUrl),
      ]);

      const result = await analyseLesionProgressionFn({
        data: {
          baselineImage: baselineDataUrl,
          baselineDate: baseline.date,
          baselineDiameterMm: baseline.diameterMm,
          followUpImage: followUpDataUrl,
          followUpDate: followUp.date,
          followUpDiameterMm: followUp.diameterMm,
          suspectedCondition,
          patientProfile,
          reportedSymptoms,
        },
      });

      setActiveEvaluation(result);

      // Save evaluation to follow-up entry
      const updated = entries.map((e) =>
        e.id === followUp.id ? { ...e, aiEvaluation: result } : e,
      );
      setEntries(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("AI progression evaluation error:", err);
      setAiError("Analysis request failed. Please check network connectivity and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card rounded-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">
          AI Lesion Delta &amp; Rash Progression Journal
        </DialogTitle>

        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-card/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Activity className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
                  AI Lesion Delta &amp; Healing Journal
                </h2>
                {entries.length > 0 && (
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {entries.length} {entries.length === 1 ? "Log" : "Logs"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Automated multi-day photo delta comparison, cellulitis screening &amp; millimeter
                tracing.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-muted-foreground"
          >
            Close
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border/60 bg-muted/30 px-5 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "timeline"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="size-4" />
            <span>Timeline Log ({entries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai_delta")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "ai_delta"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-4 text-primary" />
            <span>AI Delta &amp; Cellulitis</span>
            {activeEvaluation && (
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("slider")}
            disabled={entriesWithPhotos.length < 2}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "slider"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground disabled:opacity-40"
            }`}
          >
            <SlidersHorizontal className="size-4" />
            <span>Side-by-Side</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guidance")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "guidance"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <PenTool className="size-4" />
            <span>How to Measure</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Active Trajectory Alert Banner */}
          {hasMultiple && activeTab !== "ai_delta" && (
            <div
              className={`rounded-xl border p-4 text-xs space-y-1.5 ${
                isRapidCentrifugal
                  ? "border-amber-500/40 bg-amber-500/10 text-foreground"
                  : isRegressing
                    ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                    : "border-border bg-muted/20 text-foreground"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 uppercase tracking-wide text-xs">
                  {isRapidCentrifugal ? (
                    <>
                      <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-amber-700 dark:text-amber-400">
                        Active Expansion Detected (+{totalDeltaMm} mm over {hoursElapsed}h)
                      </span>
                    </>
                  ) : isRegressing ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400">
                        Resolving Trajectory ({totalDeltaMm} mm decrease)
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4 text-primary" />
                      <span>Stable Lesion Dimension (Delta: {totalDeltaMm} mm)</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Rate:{" "}
                  {expansionRateMmPerDay > 0 ? `+${expansionRateMmPerDay}` : expansionRateMmPerDay}{" "}
                  mm/day
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {isRapidCentrifugal
                  ? `Expansion rate is averaging +${expansionRateMmPerDay} mm/day. Rapidly expanding erythema >= 50 mm (5 cm) is a clinical warning criteria for Erythema Migrans (Lyme disease) or bacterial cellulitis.`
                  : isRegressing
                    ? `Lesion boundary has receded by ${Math.abs(
                        totalDeltaMm,
                      )} mm since baseline, consistent with normal resolving inflammatory kinetics.`
                    : "Lesion diameter has remained stable over this observation window. Continue to monitor for delayed target bullseye formation or ulceration."}
              </p>
            </div>
          )}

          {/* TAB 1: TIMELINE & LOG INPUT */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              {/* Add New Check-in Form */}
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Plus className="size-4 text-primary" />
                    <span>
                      Log{" "}
                      {entries.length === 0
                        ? "Day 1 Baseline"
                        : `Day ${entries.length + 1} Check-in`}
                    </span>
                  </h3>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-muted-foreground">Unit:</span>
                    <button
                      type="button"
                      onClick={() => setUnit("mm")}
                      className={`px-2 py-0.5 rounded font-bold ${
                        unit === "mm"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      mm
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit("in")}
                      className={`px-2 py-0.5 rounded font-bold ${
                        unit === "in"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      inches
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      Greatest Outer Diameter ({unit}):
                    </label>
                    <Input
                      type="number"
                      step={unit === "in" ? "0.1" : "1"}
                      placeholder={unit === "in" ? "e.g. 1.5" : "e.g. 35"}
                      value={diameterInput}
                      onChange={(e) => setDiameterInput(e.target.value)}
                      className="text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Measure across the widest point of redness/swelling using a ruler or coin.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      Attach Photo:
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => followUpPhotoInputRef.current?.click()}
                        className="text-xs gap-1.5 w-full justify-center"
                      >
                        <Camera className="size-3.5" />
                        <span>{selectedPhoto ? "Photo Attached" : "Take / Choose Photo"}</span>
                      </Button>
                      <input
                        ref={followUpPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </div>
                    {selectedPhoto && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Photo ready for AI progression &amp; comparison
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      Observations / Symptoms (Optional):
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Mild itch, central clearing forming, less tender today"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={handleAddEntry}
                    disabled={!diameterInput || parseFloat(diameterInput) <= 0}
                    className="text-xs font-semibold"
                  >
                    Save Entry
                  </Button>
                </div>
              </div>

              {/* Recorded Timeline Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Progress Timeline
                  </h4>
                  {entries.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="text-destructive hover:bg-destructive/10 text-xs h-7 px-2"
                    >
                      <Trash2 className="size-3 mr-1" />
                      Reset Journal
                    </Button>
                  )}
                </div>

                {entries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground space-y-1">
                    <Clock className="size-6 mx-auto text-muted-foreground/60 mb-2" />
                    <p className="font-medium text-foreground">No entries recorded yet</p>
                    <p>
                      Log your Day 1 baseline measurement above to begin tracking expansion over
                      24–72 hours.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {entries.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="rounded-xl border border-border/80 bg-card p-3 sm:p-4 flex items-center justify-between gap-4 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          {entry.photoUrl ? (
                            <img
                              src={entry.photoUrl}
                              alt={entry.dayLabel}
                              className="size-12 rounded-lg object-cover border border-border/80 shrink-0"
                            />
                          ) : (
                            <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                              <Camera className="size-4" />
                            </span>
                          )}
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{entry.dayLabel}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(entry.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="font-mono text-xs font-semibold text-primary">
                              {entry.diameterMm} mm{" "}
                              <span className="text-[11px] text-muted-foreground font-normal">
                                ({(entry.diameterMm / 25.4).toFixed(2)} in)
                              </span>
                            </p>
                            {entry.notes && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                                &quot;{entry.notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {idx === 0 ? (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                              Baseline
                            </span>
                          ) : (
                            (() => {
                              const prev = entries[idx - 1];
                              const diff = entry.diameterMm - prev.diameterMm;
                              return (
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                    diff > 0
                                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                      : diff < 0
                                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                        : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {diff > 0 ? `+${diff}` : diff} mm
                                </span>
                              );
                            })()
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI DELTA & CELLULITIS EVALUATION */}
          {activeTab === "ai_delta" && (
            <div className="space-y-6">
              {entriesWithPhotos.length < 2 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs space-y-4">
                  <div className="size-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="size-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Two Photos Required for AI Progression Analysis
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      To evaluate margin expansion rate, rule out secondary bacterial cellulitis,
                      and detect advancing necrosis, please attach at least two photos (e.g. Day 1
                      Baseline and Day 2/3 Follow-Up).
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveTab("timeline");
                        followUpPhotoInputRef.current?.click();
                      }}
                      className="gap-1.5 font-semibold"
                    >
                      <Camera className="size-4" />
                      <span>Log Follow-Up Check-in with Photo</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Photo Selection Pair */}
                  <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                      <div>
                        <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                          <Sparkles className="size-4 text-primary" />
                          <span>AI Lesion Delta &amp; Cellulitis Evaluation</span>
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Select baseline and follow-up check-ins to run multimodal vision delta
                          analysis.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Baseline Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground block">
                          1. Baseline Reference:
                        </label>
                        <select
                          value={selectedBaselineId}
                          onChange={(e) => setSelectedBaselineId(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {entriesWithPhotos.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.dayLabel} — {e.diameterMm} mm (
                              {new Date(e.date).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                        {(() => {
                          const item = entries.find((e) => e.id === selectedBaselineId);
                          return item?.photoUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-border/80 aspect-4/3 bg-muted">
                              <img
                                src={item.photoUrl}
                                alt="Baseline"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                                {item.dayLabel} ({item.diameterMm} mm)
                              </span>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      {/* Follow-Up Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground block">
                          2. Follow-Up Comparison:
                        </label>
                        <select
                          value={selectedFollowUpId}
                          onChange={(e) => setSelectedFollowUpId(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {entriesWithPhotos.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.dayLabel} — {e.diameterMm} mm (
                              {new Date(e.date).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                        {(() => {
                          const item = entries.find((e) => e.id === selectedFollowUpId);
                          return item?.photoUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-border/80 aspect-4/3 bg-muted">
                              <img
                                src={item.photoUrl}
                                alt="Follow-Up"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                                {item.dayLabel} ({item.diameterMm} mm)
                              </span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Current Check-in Symptoms Checklist */}
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <label className="text-xs font-semibold text-foreground block">
                        Observed Clinical Signs at Follow-Up (Check all that apply):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          {
                            id: "increasing_pain",
                            label: "Severe or escalating localized pain",
                            icon: Flame,
                          },
                          {
                            id: "spreading_warmth",
                            label: "Localized warmth / hot to touch",
                            icon: Flame,
                          },
                          {
                            id: "red_streaks",
                            label: "Red streaks extending outward (Lymphangitis)",
                            icon: AlertOctagon,
                            critical: true,
                          },
                          {
                            id: "fever",
                            label: "Fever (>100.4°F), rigors, or chills",
                            icon: Thermometer,
                            critical: true,
                          },
                          {
                            id: "pus_drainage",
                            label: "Pus, cloudy yellow drainage, or abscess head",
                            icon: AlertTriangle,
                          },
                        ].map((sym) => {
                          const active = reportedSymptoms.includes(sym.id);
                          const IconComp = sym.icon;
                          return (
                            <button
                              key={sym.id}
                              type="button"
                              onClick={() => toggleSymptom(sym.id)}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                                active
                                  ? sym.critical
                                    ? "border-destructive bg-destructive/15 text-destructive font-bold"
                                    : "border-primary bg-primary/10 text-foreground font-semibold"
                                  : "border-border bg-card/60 text-muted-foreground hover:bg-muted/30"
                              }`}
                            >
                              <IconComp
                                className={`size-3.5 shrink-0 ${
                                  active && sym.critical
                                    ? "text-destructive"
                                    : active
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                }`}
                              />
                              <span className="line-clamp-1">{sym.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <p className="text-[11px] text-muted-foreground italic">
                        Compares vascular erythema spread, tissue induration &amp; central crusting.
                      </p>
                      <Button
                        size="sm"
                        onClick={handleRunAiEvaluation}
                        disabled={
                          aiLoading ||
                          !selectedBaselineId ||
                          !selectedFollowUpId ||
                          selectedBaselineId === selectedFollowUpId
                        }
                        className="w-full sm:w-auto font-semibold gap-2 shadow-xs"
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>Analyzing Dual Photos...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-4" />
                            <span>Run AI Progression Analysis</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {aiError && (
                      <p className="text-xs text-destructive font-medium pt-1">{aiError}</p>
                    )}
                  </div>

                  {/* AI Evaluation Report Display */}
                  {activeEvaluation && (
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-xs animate-fade-in">
                      {/* Trajectory Header Banner */}
                      <div
                        className={`rounded-xl border p-4 text-xs space-y-2 ${
                          activeEvaluation.trajectory === "critical_infection"
                            ? "border-destructive/50 bg-destructive/15 text-destructive-foreground"
                            : activeEvaluation.cellulitisRisk === "high" ||
                                activeEvaluation.trajectory === "rapid_centrifugal_expansion"
                              ? "border-amber-500/40 bg-amber-500/10 text-foreground"
                              : activeEvaluation.trajectory === "resolving"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
                                : "border-border bg-muted/25 text-foreground"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {activeEvaluation.trajectory === "critical_infection" ? (
                              <AlertOctagon className="size-5 text-destructive shrink-0" />
                            ) : activeEvaluation.cellulitisRisk === "high" ? (
                              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                            ) : activeEvaluation.trajectory === "resolving" ? (
                              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <ShieldCheck className="size-5 text-primary shrink-0" />
                            )}
                            <div>
                              <h4 className="font-display text-sm font-bold">
                                {activeEvaluation.trajectoryLabel}
                              </h4>
                              <p className="text-[11px] text-muted-foreground">
                                Elapsed: ~{activeEvaluation.hoursElapsed} hours | Rate:{" "}
                                {activeEvaluation.expansionRateMmPerDay > 0
                                  ? `+${activeEvaluation.expansionRateMmPerDay}`
                                  : activeEvaluation.expansionRateMmPerDay}{" "}
                                mm/day
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                                activeEvaluation.cellulitisRisk === "high"
                                  ? "bg-destructive/20 text-destructive"
                                  : activeEvaluation.cellulitisRisk === "moderate"
                                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                    : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              }`}
                            >
                              Cellulitis Risk: {activeEvaluation.cellulitisRisk}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs leading-relaxed text-muted-foreground pt-1 border-t border-border/40">
                          {activeEvaluation.cellulitisRationale}
                        </p>
                      </div>

                      {/* Morphologic Evolution Breakdown */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Activity className="size-3.5 text-primary" />
                          <span>Morphological Evolution &amp; Tissue Delta</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="rounded-xl border border-border/70 bg-card/60 p-3 space-y-1">
                            <span className="font-bold text-foreground block text-[11px]">
                              Erythematous Margin:
                            </span>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {activeEvaluation.morphologyEvolution.erythemaChange}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/70 bg-card/60 p-3 space-y-1">
                            <span className="font-bold text-foreground block text-[11px]">
                              Central Features:
                            </span>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {activeEvaluation.morphologyEvolution.centralFeaturesChange}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/70 bg-card/60 p-3 space-y-1">
                            <span className="font-bold text-foreground block text-[11px]">
                              Edema &amp; Induration:
                            </span>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {activeEvaluation.morphologyEvolution.edemaChange}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Clinical Action Plan & Recommendations */}
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <ShieldAlert className="size-4 text-primary" />
                            <span>{activeEvaluation.clinicalAction.urgencyTitle}</span>
                          </span>
                        </div>

                        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                          {activeEvaluation.clinicalAction.recommendations.map((rec, i) => (
                            <li key={i} className="leading-relaxed">
                              {rec}
                            </li>
                          ))}
                        </ul>

                        {activeEvaluation.clinicalAction.redFlags.length > 0 && (
                          <div className="pt-2 border-t border-primary/15 space-y-1">
                            <span className="font-bold text-destructive text-[11px] uppercase tracking-wide">
                              Warning Signs Warranting Immediate ER Care:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-destructive/90">
                              {activeEvaluation.clinicalAction.redFlags.map((flag, i) => (
                                <li key={i}>{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Emergency Call-out if high risk */}
                      {(activeEvaluation.trajectory === "critical_infection" ||
                        activeEvaluation.cellulitisRisk === "high") && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <PhoneCall className="size-4 text-destructive shrink-0" />
                            <span className="font-semibold text-foreground">
                              Need immediate emergency assistance or clinical guidance?
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href="tel:911"
                              className="inline-flex items-center gap-1 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-destructive/90"
                            >
                              Call 911
                            </a>
                            <a
                              href="tel:18002221222"
                              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground hover:bg-muted"
                            >
                              Poison Help (1-800-222-1222)
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Medical Disclaimer */}
                      <p className="text-[10px] text-muted-foreground leading-relaxed italic border-t border-border/60 pt-3">
                        {activeEvaluation.disclaimer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SIDE-BY-SIDE PHOTO SLIDER */}
          {activeTab === "slider" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Drag the handle horizontally to compare changes:</span>
                <span className="font-semibold text-primary">
                  {entriesWithPhotos[0]?.dayLabel} vs{" "}
                  {entriesWithPhotos[entriesWithPhotos.length - 1]?.dayLabel}
                </span>
              </div>
              {entriesWithPhotos.length >= 2 &&
              entriesWithPhotos[0]?.photoUrl &&
              entriesWithPhotos[entriesWithPhotos.length - 1]?.photoUrl ? (
                <PhotoComparisonSlider
                  beforeUrl={entriesWithPhotos[0].photoUrl!}
                  afterUrl={entriesWithPhotos[entriesWithPhotos.length - 1].photoUrl!}
                  beforeLabel={entriesWithPhotos[0].dayLabel}
                  afterLabel={entriesWithPhotos[entriesWithPhotos.length - 1].dayLabel}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                  Attach at least two photos with your check-ins to unlock the interactive
                  comparison slider.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLINICAL MEASUREMENT INSTRUCTIONS */}
          {activeTab === "guidance" && (
            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <PenTool className="size-4 text-primary" />
                  How to Trace &amp; Measure a Changing Bite
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pt-1">
                  <li>
                    <strong>Lightly Ink the Border:</strong> Use a ballpoint pen to trace the
                    outermost edge of the redness/swelling. Do not press firmly.
                  </li>
                  <li>
                    <strong>Note the Time:</strong> Write the time or date next to your ink line.
                  </li>
                  <li>
                    <strong>Place a Standard Reference:</strong> Snap a photo with a standard US
                    quarter (24.3 mm diameter) or ruler next to the lesion.
                  </li>
                  <li>
                    <strong>Check in 24 Hours:</strong> If redness spreads significantly past your
                    pen line (&gt; 5 mm/day), contact a physician.
                  </li>
                </ol>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wide">
                  When to Seek Immediate Medical Evaluation
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Rash diameter exceeds 50 mm (2 inches) following a tick bite.</li>
                  <li>
                    Central blistering, purpura, or dark sinking discoloration (spider necrotic
                    hazard).
                  </li>
                  <li>Red streaks spreading toward the heart (lymphangitis / cellulitis).</li>
                  <li>
                    Systemic symptoms develop: fever, chills, joint swelling, or facial droop.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
