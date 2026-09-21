import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bitePatternOf } from "@/lib/bite-pattern-images";

const TONES = [
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

type FitzpatrickTabsProps = {
  resultId?: string | undefined;
  resultName?: string | undefined;
};

export function FitzpatrickTabs({ resultId, resultName }: FitzpatrickTabsProps) {
  const reference = bitePatternOf(resultId);
  const referenceName = resultId ? resultName ?? reference.label : reference.label;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-foreground">Visual reference</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {resultId
          ? `Compare one possible ${referenceName} reaction pattern across skin tones.`
          : "Compare a general mild reaction across skin tones."}
      </p>

      <Tabs defaultValue="i-ii" className="mt-4">
        <TabsList className="w-full">
          {TONES.map((tone) => (
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

        {TONES.map((tone) => (
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
            <p className="mt-3 text-sm text-muted-foreground">{tone.note}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
