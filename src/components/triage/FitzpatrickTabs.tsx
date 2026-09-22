import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bitePatternOf } from "@/lib/bite-pattern-images";
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
    note: "Fair skin: Classic bright red expanding circular plaque with distinct central clearing (bullseye). Readily evident.",
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

  const activeId = isTickRelated ? selectedPattern : resultId;
  const isEmActive = activeId === "erythema_migrans";
  const reference = bitePatternOf(activeId, isEmActive);
  const tones = isEmActive ? ERYTHEMA_MIGRANS_TONES : STANDARD_TONES;
  const referenceName = isEmActive
    ? "Erythema Migrans (Lyme Rash)"
    : resultId
      ? (resultName ?? reference.label)
      : reference.label;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Visual reference</h2>
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
              src={reference.images[tone.value as keyof typeof reference.images]}
              alt={`AI-generated reference showing ${reference.pattern} on Fitzpatrick ${tone.label} skin`}
              width={1200}
              height={752}
              loading="lazy"
              className="w-full rounded-xl border border-border object-cover"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              AI-generated visual reference — not confirmation or diagnosis
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tone.note}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
