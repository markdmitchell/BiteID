import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import fitz12 from "@/assets/fitz-1-2.jpg";
import fitz34 from "@/assets/fitz-3-4.jpg";
import fitz56 from "@/assets/fitz-5-6.jpg";

const TONES = [
  {
    value: "i-ii",
    label: "Types I–II",
    swatch: "#f2d3c2",
    image: fitz12,
    note: "Very fair to fair skin. Reactions usually read as bright pink or red.",
  },
  {
    value: "iii-iv",
    label: "Types III–IV",
    swatch: "#c99a70",
    image: fitz34,
    note: "Medium to olive skin. Redness can look tan, brown or subtly dusky.",
  },
  {
    value: "v-vi",
    label: "Types V–VI",
    swatch: "#6b4030",
    image: fitz56,
    note: "Deep brown to dark skin. Reactions often appear violet, grey or darker than the surrounding skin.",
  },
];

export function FitzpatrickTabs() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-foreground">Visual reference</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick the skin tone closest to yours to see how these reactions typically present.
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
              src={tone.image}
              alt={`Reference skin reactions shown on Fitzpatrick ${tone.label}`}
              width={1200}
              height={752}
              loading="lazy"
              className="w-full rounded-xl border border-border object-cover"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              AI-generated visual reference — not a clinical example or diagnosis
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{tone.note}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
