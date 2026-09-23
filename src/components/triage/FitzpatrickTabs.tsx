import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bitePatternOf, type TemporalStageKey } from "@/lib/bite-pattern-images";
import { Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const STANDARD_TONES = [
  {
    value: "i-ii",
    label: "Types I–II",
    swatch: "#f2d3c2",
    note: "Very fair to fair skin. Reactions usually read as bright pink or red.",
  },
  {
    value: "iii-iv",
    label: "Types III–IV",
    swatch: "#c99a70",
    note: "Medium to olive skin. Redness can look tan, brown or subtly dusky.",
  },
  {
    value: "v-vi",
    label: "Types V–VI",
    swatch: "#6b4030",
    note: "Deep brown to dark skin. Reactions often appear violet, grey or darker than the surrounding skin.",
  },
];

const ERYTHEMA_MIGRANS_TONES = [
  {
    value: "i-ii",
    label: "Types I–II",
    swatch: "#f2d3c2",
    note: "Fair skin: Classic bright red circular plaque with distinct central clearing (bullseye). Readily evident.",
  },
  {
    value: "iii-iv",
    label: "Types III–IV",
    swatch: "#c99a70",
    note: "Medium to olive skin: Expanding dusky red, tan, or brownish ring. Central clearing may be less distinct or slightly shaded.",
  },
  {
    value: "v-vi",
    label: "Types V–VI",
    swatch: "#6b4030",
    note: "Dark skin: Expanding slate-gray, violaceous (purple), or dark brown ring. Often lacks bright redness and can be mistaken for hyperpigmentation, bruising, or ringworm. Palpation often reveals warmth or a subtly indurated border.",
  },
];

type FitzpatrickTabsProps = {
  resultId?: string | undefined;
  resultName?: string | undefined;
  isErythemaMigrans?: boolean | undefined;
};

export function FitzpatrickTabs({
  resultId,
  resultName,
  isErythemaMigrans = false,
}: FitzpatrickTabsProps) {
  const isTickRelated = resultId === "blacklegged_tick" || isErythemaMigrans;
  const [selectedPattern, setSelectedPattern] = useState<string>(
    isErythemaMigrans ? "erythema_migrans" : (resultId ?? "general"),
  );
  const [selectedStage, setSelectedStage] = useState<TemporalStageKey>("peak");

  const activeId = isTickRelated ? selectedPattern : resultId;
  const isEmActive = activeId === "erythema_migrans";
  const reference = bitePatternOf(activeId, isEmActive);
  const tones = isEmActive ? ERYTHEMA_MIGRANS_TONES : STANDARD_TONES;
  const referenceName = isEmActive
    ? "Erythema Migrans (Lyme Rash)"
    : resultId
      ? (resultName ?? reference.label)
      : reference.label;

  const hasTemporalProgression = Boolean(reference.temporalStages);
  const currentStageInfo = reference.temporalStages?.[selectedStage];
  const activeImages = currentStageInfo?.images ?? reference.images;

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">Visual reference</h2>
            {hasTemporalProgression && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <Clock className="size-3" />
                <span>Multi-Stage Evolution</span>
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare one possible {referenceName} reaction pattern across skin tones.
          </p>
        </div>

        {isTickRelated && (
          <div className="flex rounded-lg border border-border bg-muted/50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedPattern("erythema_migrans")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-all",
                isEmActive
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Erythema Migrans (Target Rash)
            </button>
            <button
              type="button"
              onClick={() => setSelectedPattern("blacklegged_tick")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-all",
                !isEmActive
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Early Bite Punctum
            </button>
          </div>
        )}
      </div>

      {/* Temporal Timeline Evolution Selector (when available) */}
      {hasTemporalProgression && reference.temporalStages && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Clock className="size-3.5" />
              <span>Timeline / Progression Stage</span>
            </div>
            {currentStageInfo && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Typical Onset: {currentStageInfo.timeframe}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-border/70 bg-card p-1">
            {(["early", "peak", "late"] as const).map((stageKey) => {
              const stage = reference.temporalStages?.[stageKey];
              if (!stage) return null;
              const isSelected = selectedStage === stageKey;

              return (
                <button
                  key={stageKey}
                  type="button"
                  onClick={() => setSelectedStage(stageKey)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md px-2 py-1.5 text-center transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <span className="text-xs leading-tight">{stage.label}</span>
                  <span
                    className={cn(
                      "text-[10px] opacity-80",
                      isSelected ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {stage.timeframe}
                  </span>
                </button>
              );
            })}
          </div>

          {currentStageInfo && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed pt-0.5">
              <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>{currentStageInfo.description}</span>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="i-ii" className="mt-4">
        <TabsList className="w-full">
          {tones.map((tone) => (
            <TabsTrigger key={tone.value} value={tone.value} className="flex-1 gap-2">
              <span
                className="size-3 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: tone.swatch }}
                aria-hidden
              />
              <span className="text-xs sm:text-sm">{tone.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tones.map((tone) => (
          <TabsContent key={tone.value} value={tone.value} className="mt-4">
            <img
              src={activeImages[tone.value as keyof typeof activeImages]}
              alt={`AI-generated reference showing ${currentStageInfo ? `${currentStageInfo.label} (${currentStageInfo.timeframe})` : reference.pattern} on Fitzpatrick ${tone.label} skin`}
              width={1200}
              height={752}
              loading="lazy"
              className="w-full rounded-md border border-border object-cover"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>AI-generated visual reference — not confirmation or diagnosis</span>
              {currentStageInfo && (
                <span className="font-medium text-foreground">
                  Showing: {currentStageInfo.label} ({currentStageInfo.timeframe})
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tone.note}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
