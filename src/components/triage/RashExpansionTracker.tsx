import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  AlertTriangle,
  Camera,
  Plus,
  Trash2,
  SlidersHorizontal,
  FileText,
} from "lucide-react";
import { PhotoComparisonSlider } from "./PhotoComparisonSlider";

export type JournalEntry = {
  id: string;
  date: string;
  dayLabel: string;
  diameterMm: number;
  photoUrl?: string;
  notes?: string;
};

const STORAGE_KEY = "biteid_rash_journal_record_v2";

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
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [diameterInput, setDiameterInput] = useState<string>("");
  const [unit, setUnit] = useState<"mm" | "in">("mm");
  const [notesInput, setNotesInput] = useState<string>("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "slider" | "guidance">("timeline");
  const followUpPhotoInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage
  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored) as JournalEntry[]);
      } else {
        // Check if v1 existed and migrate
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

  // Handle Initial Lesion photo preview
  useEffect(() => {
    if (initialLesionFile && entries.length === 0) {
      const url = URL.createObjectURL(initialLesionFile);
      setSelectedPhoto(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
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
  };

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
  const isStable = hasMultiple && Math.abs(totalDeltaMm) <= 2;

  // Entries with photos for comparison slider
  const entriesWithPhotos = entries.filter((e) => Boolean(e.photoUrl));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card rounded-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">
          Multi-Day Rash Expansion & Healing Progression Journal
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
                  Multi-Day Photo Progression & Healing Journal
                </h2>
                {entries.length > 0 && (
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {entries.length} {entries.length === 1 ? "Log" : "Logs"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Serial millimeter tracing & visual photo comparisons across 24–96 hours.
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
        <div className="flex border-b border-border/60 bg-muted/30 px-5 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
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
            onClick={() => setActiveTab("slider")}
            disabled={entriesWithPhotos.length < 2}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
              activeTab === "slider"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground disabled:opacity-40"
            }`}
          >
            <SlidersHorizontal className="size-4" />
            <span>Side-by-Side Comparison</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guidance")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
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
          {hasMultiple && (
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
                  ? `Expansion rate is averaging +${expansionRateMmPerDay} mm/day. Expanding erythema >= 50 mm (5 cm) following outdoor exposure is the CDC hallmark diagnostic criteria for Erythema Migrans (Lyme disease) or bacterial cellulitis. Immediate medical evaluation recommended.`
                  : isRegressing
                    ? `Lesion boundary has receded by ${Math.abs(totalDeltaMm)} mm since baseline. This pattern reflects normal post-sting histamine resolution.`
                    : "Lesion diameter has remained unchanged over this observation window. Continue to monitor for delayed target bullseye formation or ulceration."}
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
                        ✓ Photo ready for side-by-side comparison
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
                    <p className="font-semibold text-foreground">No Journal Entries Logged Yet</p>
                    <p>
                      Log your baseline diameter above to track whether your bite expands or heals.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {entries.map((item, idx) => {
                      const prev = idx > 0 ? entries[idx - 1] : undefined;
                      const delta = prev ? item.diameterMm - prev.diameterMm : 0;
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-border bg-card p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            {item.photoUrl ? (
                              <img
                                src={item.photoUrl}
                                alt="Lesion check-in"
                                className="size-14 rounded-lg object-cover border border-border shrink-0"
                              />
                            ) : (
                              <div className="size-14 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
                                No photo
                              </div>
                            )}
                            <div className="space-y-0.5 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">{item.dayLabel}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(item.date).toLocaleString([], {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })}
                                </span>
                              </div>
                              <p className="text-muted-foreground font-mono">
                                Diameter:{" "}
                                <strong className="text-foreground">{item.diameterMm} mm</strong> (~
                                {(item.diameterMm / 25.4).toFixed(1)} in)
                                {idx > 0 && (
                                  <span
                                    className={`ml-2 text-[11px] font-bold ${
                                      delta > 0
                                        ? "text-amber-600 dark:text-amber-400"
                                        : delta < 0
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-muted-foreground"
                                    }`}
                                  >
                                    ({delta > 0 ? `+${delta}` : delta} mm)
                                  </span>
                                )}
                              </p>
                              {item.notes && (
                                <p className="text-[11px] text-muted-foreground italic truncate max-w-sm">
                                  &quot;{item.notes}&quot;
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SIDE-BY-SIDE PHOTO SLIDER */}
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

          {/* TAB 3: CLINICAL MEASUREMENT INSTRUCTIONS */}
          {activeTab === "guidance" && (
            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <PenTool className="size-4 text-primary" />
                  How to Trace & Measure a Changing Bite
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
