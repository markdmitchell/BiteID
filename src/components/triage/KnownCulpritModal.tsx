import { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  HelpCircle,
  Info,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VECTOR_DATABASE, type VectorInfo } from "@/lib/geo-pest.server";
import { creatureReferenceOf } from "@/lib/creature-images";
import { bitePatternOf, type TemporalStageKey } from "@/lib/bite-pattern-images";

type KnownCulpritModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialVectorId?: string | null;
  onOpenSnakebiteSurvival?: () => void;
  onOpenTracker?: () => void;
  onOpenLocator?: () => void;
};

type HazardCategory = {
  id: string;
  label: string;
  icon: string;
  badgeClass: string;
  speciesIds: string[];
};

const HAZARD_CATEGORIES: HazardCategory[] = [
  {
    id: "high_hazard",
    label: "High-Hazard Envenomations",
    icon: "🚨",
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
    speciesIds: [
      "pit_viper",
      "coral_snake",
      "scorpion",
      "black_widow",
      "brown_recluse",
      "giant_centipede",
    ],
  },
  {
    id: "disease_vectors",
    label: "Disease Vectors & Parasites",
    icon: "🦠",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    speciesIds: ["blacklegged_tick", "lone_star_tick", "dog_tick", "kissing_bug"],
  },
  {
    id: "stings_allergens",
    label: "Stings & Severe Allergens",
    icon: "🐝",
    badgeClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
    speciesIds: ["wasp", "honey_bee", "fire_ant", "asp_caterpillar"],
  },
  {
    id: "nuisance_blister",
    label: "Biting & Blistering Insects",
    icon: "🦟",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    speciesIds: [
      "blister_beetle",
      "mosquito",
      "no_see_um",
      "horse_fly",
      "black_fly",
      "flea",
      "bed_bug",
      "chigger",
      "lice",
    ],
  },
];

// Clinical folklore myth-busters mapped per vector category
const CREATURE_MYTH_BUSTERS: Record<string, { myth: string; fact: string }[]> = {
  pit_viper: [
    {
      myth: "Apply a tourniquet or pressure wrap to keep venom in the limb.",
      fact: "Tourniquets trap cytolytic enzymes, causing massive tissue necrosis, compartment syndrome, and amputation.",
    },
    {
      myth: "Cut an 'X' over the fang marks and suck venom with your mouth or a pump.",
      fact: "Cutting severs tendons and causes severe arterial bleeding (venom prevents clotting). Suction extractors remove 0% venom.",
    },
    {
      myth: "Submerge the limb in an ice bath.",
      fact: "Freezing causes acute vascular constriction, creating severe ischemic cryo-gangrene and permanent nerve loss.",
    },
  ],
  blacklegged_tick: [
    {
      myth: "Cover the tick in petroleum jelly (Vaseline) or nail polish to suffocate it.",
      fact: "Ticks breathe only 3–15 times per hour. Smothering takes hours and stresses the tick, causing it to vomit saliva and Borrelia spirochetes directly into your bloodstream.",
    },
    {
      myth: "Burn the tick's rear with a lit match or hot needle.",
      fact: "Heat induces reflexive thermal regurgitation of gut contents into the host and burns your skin.",
    },
    {
      myth: "Twist or jerk the tick to unscrew its mouthparts.",
      fact: "Twisting shears the barbed hypostome, leaving mouthparts embedded in the skin. Pull straight up perpendicular with fine-tipped tweezers.",
    },
  ],
  lone_star_tick: [
    {
      myth: "If there is no classic bullseye rash, you cannot get sick.",
      fact: "Lone Star ticks transmit STARI (which causes expanding circular rash) and Alpha-Gal syndrome (delayed red meat allergy). Testing is based on tick exposure, not just bullseyes.",
    },
    {
      myth: "Smother the tick with essential oils (tea tree, peppermint).",
      fact: "Chemical irritants cause the tick to regurgitate pathogens before detaching.",
    },
  ],
  dog_tick: [
    {
      myth: "Crush the tick between your fingers after removing it.",
      fact: "Infectious fluids containing Rickettsia rickettsii (Rocky Mountain Spotted Fever) can penetrate micro-abrasions in human skin or eye mucosa.",
    },
  ],
  honey_bee: [
    {
      myth: "Pinch the stinger with tweezers or fingertips to pull it out.",
      fact: "Pinching squeezes the venom sac like a medicine dropper, injecting all remaining venom. Scrape it off sideways with a fingernail or credit card.",
    },
    {
      myth: "Apply meat tenderizer or baking soda paste to neutralize venom.",
      fact: "Topical pastes cannot penetrate the deep dermis where venom is deposited. Focus on stinger removal, cold pack, and oral antihistamines.",
    },
  ],
  wasp_yellow_jacket: [
    {
      myth: "Wasps only sting once like honey bees.",
      fact: "Wasps and yellow jackets have smooth, unbarbed stingers and can sting repeatedly, injecting venom with every strike.",
    },
    {
      myth: "If you don't feel dizzy in the first 5 minutes, you're safe from anaphylaxis.",
      fact: "Biphasic anaphylactic reactions can occur up to 4–8 hours after multiple stings. Keep an epinephrine auto-injector accessible if previously allergic.",
    },
  ],
  fire_ant: [
    {
      myth: "Pop or squeeze the sterile white pustules to drain the poison.",
      fact: "The white fluid is dead epidermal cells and sterile piperidine alkaloid, not bacterial pus. Popping breaks the skin barrier and causes Staphylococcus aureus cellulitis and scars.",
    },
    {
      myth: "Pouring gasoline, bleach, or ammonia on ant stings neutralizes venom.",
      fact: "Harsh chemicals cause severe chemical burns and chemical dermatitis on compromised skin without neutralizing subcutaneous venom.",
    },
  ],
  brown_recluse: [
    {
      myth: "Apply a heating pad to draw out the poison.",
      fact: "The destructive enzyme Sphingomyelinase D is exponentially activated by heat. Heat accelerates deep dermonecrosis. Use cold packs only.",
    },
    {
      myth: "Immediately rush to a surgeon to cut out the bite area.",
      fact: "Early surgical excision in the first 3 weeks leads to delayed wound dehiscence and large skin grafts. Most recluse bites heal well with conservative wound care.",
    },
  ],
  black_widow: [
    {
      myth: "A black widow bite always leaves two gigantic bloody puncture holes.",
      fact: "The initial bite is frequently a faint pinprick with minimal local reaction. The severe symptom is systemic muscular rigidity (latrodectism) hours later.",
    },
  ],
  scorpion: [
    {
      myth: "Submerge the sting in freezing ice water to freeze the venom.",
      fact: "Direct ice causes frostbite. Use a cool damp cloth. The critical risk is neurotoxicity in infants (roving eyes, tongue fasciculations).",
    },
  ],
  blister_beetle: [
    {
      myth: "Smack or crush the beetle when you feel it crawling on your skin.",
      fact: "Crushing ruptures the beetle's hemolymph containing cantharidin, which causes linear blistering across the skin. Gently blow or flick it off alive.",
    },
  ],
  coral_snake: [
    {
      myth: "If there is no immediate agony or massive swelling like a rattlesnake bite, it was a harmless dry bite.",
      fact: "Coral snake venom is purely neurotoxic (postsynaptic bungarotoxin). It causes almost zero local tissue destruction or swelling, yet can trigger lethal respiratory paralysis hours later without warning.",
    },
    {
      myth: "The rhyme 'Red on yellow kill a fellow, red on black friend of Jack' is 100% dependable.",
      fact: "Color morphs (anerythristic, melanistic, or incomplete banding) occur in nature. Never handle or pick up any banded snake.",
    },
  ],
  giant_centipede: [
    {
      myth: "Centipedes bite using jaws inside their mouth.",
      fact: "They inject venom through modified front legs called forcipules (toxicognaths) that pinch like hypodermic venom claws.",
    },
    {
      myth: "Ice packs are the only remedy for the intense burning pain.",
      fact: "Many centipede venom proteins are heat-labile. Non-scalding hot water immersion (104°F–113°F / 40°C–45°C) is clinically demonstrated to relieve pain faster than cold.",
    },
  ],
  asp_caterpillar: [
    {
      myth: "Vigorously scrub the skin with a washcloth to wipe off the hairs.",
      fact: "Rubbing crushes the hollow urticating spines deeper into the dermis and breaks additional venom sacs. Use adhesive tape (cellophane or duct tape) to gently lift spines off.",
    },
    {
      myth: "The sting is just an annoying minor fuzzy bug itch.",
      fact: "Puss caterpillar envenomation is among the most painful stings in North America, frequently causing radiating neuropathic pain to the torso, nausea, and lymphadenopathy.",
    },
  ],
};

const DEFAULT_MYTH_BUSTERS = [
  {
    myth: "Applying caustic household chemicals (bleach, gasoline, ammonia) will cure the reaction.",
    fact: "Household chemicals cause acute chemical burns on inflamed skin without neutralizing systemic or subcutaneous toxins.",
  },
  {
    myth: "Aggressively scratching the bite relieves the itching.",
    fact: "Excoriation introduces skin bacteria (Staph and Strep), leading to secondary impetigo or cellulitis.",
  },
];

export function KnownCulpritModal({
  open,
  onOpenChange,
  initialVectorId = null,
  onOpenSnakebiteSurvival,
  onOpenTracker,
  onOpenLocator,
}: KnownCulpritModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialVectorId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"protocol" | "myths" | "tones" | "risks">("protocol");

  // If initialVectorId changes from parent, sync state
  if (initialVectorId && initialVectorId !== selectedId) {
    setSelectedId(initialVectorId);
  }

  const selectedVector: VectorInfo | undefined = useMemo(() => {
    return selectedId ? VECTOR_DATABASE[selectedId] : undefined;
  }, [selectedId]);

  const filteredCategories = useMemo(() => {
    return HAZARD_CATEGORIES.map((cat) => {
      const species = cat.speciesIds
        .map((id) => VECTOR_DATABASE[id])
        .filter((v): v is VectorInfo => Boolean(v))
        .filter((v) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            v.name.toLowerCase().includes(q) ||
            v.scientificName.toLowerCase().includes(q) ||
            v.associatedPathogens.some((p) => p.toLowerCase().includes(q)) ||
            v.delayedRisks.some((r) => r.toLowerCase().includes(q))
          );
        });

      return {
        ...cat,
        species,
      };
    }).filter((cat) => {
      if (selectedCategory !== "all" && cat.id !== selectedCategory) return false;
      return cat.species.length > 0;
    });
  }, [searchQuery, selectedCategory]);

  const mythBusters = useMemo(() => {
    if (!selectedId) return DEFAULT_MYTH_BUSTERS;
    return CREATURE_MYTH_BUSTERS[selectedId] ?? DEFAULT_MYTH_BUSTERS;
  }, [selectedId]);

  const [selectedStage, setSelectedStage] = useState<TemporalStageKey>("peak");

  const creaturePhoto = selectedId ? creatureReferenceOf(selectedId) : undefined;
  const lesionSet = selectedId ? bitePatternOf(selectedId) : undefined;

  const hasTemporalProgression = Boolean(lesionSet?.temporalStages);
  const currentStageInfo = lesionSet?.temporalStages?.[selectedStage];
  const activeImages = currentStageInfo?.images ?? lesionSet?.images;

  const lesionI_II = activeImages
    ? {
        src: activeImages["i-ii"],
        alt: `${lesionSet?.label}: ${currentStageInfo ? currentStageInfo.label : lesionSet?.pattern} on Fitzpatrick I–II skin`,
      }
    : undefined;
  const lesionIII_IV = activeImages
    ? {
        src: activeImages["iii-iv"],
        alt: `${lesionSet?.label}: ${currentStageInfo ? currentStageInfo.label : lesionSet?.pattern} on Fitzpatrick III–IV skin`,
      }
    : undefined;
  const lesionV_VI = activeImages
    ? {
        src: activeImages["v-vi"],
        alt: `${lesionSet?.label}: ${currentStageInfo ? currentStageInfo.label : lesionSet?.pattern} on Fitzpatrick V–VI skin`,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        {selectedVector ? (
          /* ========================================================================= */
          /* CREATURE CLINICAL ACTION SHEET VIEW                                       */
          /* ========================================================================= */
          <div>
            {/* Header with specimen photo & danger status */}
            <div className="relative border-b border-border bg-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {creaturePhoto && (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border shadow-xs">
                      <img
                        src={creaturePhoto.src}
                        alt={creaturePhoto.alt}
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Direct First-Aid Protocol
                      </span>
                      {selectedVector.id === "pit_viper" && (
                        <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-bold text-destructive">
                          Emergency Envenomation
                        </span>
                      )}
                    </div>
                    <DialogTitle className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
                      {selectedVector.name}
                    </DialogTitle>
                    <p className="font-mono text-xs italic text-muted-foreground">
                      {selectedVector.scientificName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                    className="text-xs font-medium"
                  >
                    ← Choose Different Critter
                  </Button>
                </div>
              </div>

              {/* Special Fast-Track for Venomous Snakes (Pit Viper / Coral Snake) */}
              {(selectedVector.id === "pit_viper" || selectedVector.id === "coral_snake") &&
                onOpenSnakebiteSurvival && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="size-4 shrink-0" />
                        <span className="font-bold">Active snakebite emergency?</span>
                        <span className="hidden sm:inline">
                          Launch the live 15-minute edema timer and survival protocol.
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          onOpenChange(false);
                          onOpenSnakebiteSurvival();
                        }}
                        className="shrink-0 text-xs font-bold shadow-xs"
                      >
                        Open Snakebite SOS
                      </Button>
                    </div>
                  </div>
                )}
            </div>

            {/* Content Tabs */}
            <div className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 bg-muted/60 text-xs">
                  <TabsTrigger value="protocol" className="font-semibold">
                    First 3 Mins
                  </TabsTrigger>
                  <TabsTrigger value="myths" className="font-semibold">
                    Deadly Myths
                  </TabsTrigger>
                  <TabsTrigger value="tones" className="font-semibold">
                    Skin Tone Guide
                  </TabsTrigger>
                  <TabsTrigger value="risks" className="font-semibold">
                    Red Flags & ER
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: PROTOCOL */}
                <TabsContent value="protocol" className="mt-5 space-y-4">
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
                    <h4 className="flex items-center gap-2 font-display text-base font-bold text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      Immediate Physical First Aid (DO THIS NOW)
                    </h4>
                    <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-foreground">
                      {selectedVector.firstAidAdvice.map((advice, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg border border-primary/20 bg-card p-3 shadow-2xs"
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                            {idx + 1}
                          </span>
                          <span className="text-muted-foreground">{advice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Emergency Actions */}
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-xs font-semibold text-foreground">Next Immediate Actions:</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {onOpenTracker && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            onOpenTracker();
                          }}
                          className="text-xs font-medium"
                        >
                          <Activity className="mr-1.5 size-3.5 text-primary" />
                          Track Swelling (24–48h)
                        </Button>
                      )}
                      {onOpenLocator && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            onOpenLocator();
                          }}
                          className="text-xs font-medium"
                        >
                          <MapPin className="mr-1.5 size-3.5 text-primary" />
                          Find Urgent Care
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 2: DEADLY MYTHS */}
                <TabsContent value="myths" className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                    <h4 className="flex items-center gap-2 font-display text-base font-bold text-destructive">
                      <AlertTriangle className="size-5 shrink-0" />
                      Dangerous Folklore Myths to Avoid
                    </h4>
                    <p className="mt-1 text-xs text-destructive/90">
                      Popular internet remedies and movie folklore often make reactions worse or
                      cause permanent tissue injury.
                    </p>

                    <div className="mt-4 space-y-3">
                      {mythBusters.map((mb, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-destructive/20 bg-card p-3.5 text-xs shadow-2xs space-y-1.5"
                        >
                          <p className="flex items-start gap-1.5 font-bold text-destructive">
                            <XCircle className="mt-0.5 size-3.5 shrink-0" />
                            <span>MYTH: &quot;{mb.myth}&quot;</span>
                          </p>
                          <p className="flex items-start gap-1.5 text-muted-foreground pl-5">
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>
                              <strong>REALITY:</strong> {mb.fact}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 3: SKIN TONE GUIDE */}
                <TabsContent value="tones" className="mt-5 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-base font-bold text-foreground">
                          Multi-Tone Visual Verification
                        </h4>
                        {hasTemporalProgression && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            <Clock className="size-3" />
                            <span>Multi-Stage Evolution</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Compare your reaction against verified clinical references across different
                        Fitzpatrick skin tones.
                      </p>
                    </div>

                    {/* Timeline Progression Selector */}
                    {hasTemporalProgression && lesionSet?.temporalStages && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2.5">
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
                            const stage = lesionSet.temporalStages?.[stageKey];
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
                                    isSelected
                                      ? "text-primary-foreground"
                                      : "text-muted-foreground",
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {lesionI_II && (
                        <div className="overflow-hidden rounded-xl border border-border bg-card">
                          <div className="aspect-square bg-muted">
                            <img
                              src={lesionI_II.src}
                              alt={lesionI_II.alt}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                              Phototypes I–II
                            </span>
                            <p className="mt-1 text-xs font-medium text-foreground">
                              Fair to Light Skin
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              Erythema presents bright pink or red with distinct borders.
                            </p>
                          </div>
                        </div>
                      )}

                      {lesionIII_IV && (
                        <div className="overflow-hidden rounded-xl border border-border bg-card">
                          <div className="aspect-square bg-muted">
                            <img
                              src={lesionIII_IV.src}
                              alt={lesionIII_IV.alt}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                              Phototypes III–IV
                            </span>
                            <p className="mt-1 text-xs font-medium text-foreground">
                              Olive to Medium Skin
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              Erythema appears deeper red or copper; swelling is palpable.
                            </p>
                          </div>
                        </div>
                      )}

                      {lesionV_VI && (
                        <div className="overflow-hidden rounded-xl border border-border bg-card">
                          <div className="aspect-square bg-muted">
                            <img
                              src={lesionV_VI.src}
                              alt={lesionV_VI.alt}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                              Phototypes V–VI
                            </span>
                            <p className="mt-1 text-xs font-medium text-foreground">
                              Dark to Deep Skin
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              Presents with violaceous, plum or hyperpigmented tones and localized
                              heat.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 4: RED FLAGS & ER CRITERIA */}
                <TabsContent value="risks" className="mt-5 space-y-4">
                  <div className="rounded-lg border border-caution/30 bg-caution/10 p-5 text-xs">
                    <h4 className="flex items-center gap-2 font-display text-base font-bold text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      When to Go to Urgent Care or Emergency Room
                    </h4>
                    <p className="mt-1 text-muted-foreground">
                      Seek immediate professional medical evaluation if you experience any of the
                      following:
                    </p>

                    <div className="mt-3 space-y-2">
                      {selectedVector.warningSigns.map((sign, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-lg border border-caution/20 bg-card p-2.5 text-foreground"
                        >
                          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>{sign}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedVector.delayedRisks.length > 0 && (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs">
                      <p className="font-semibold text-foreground">
                        Potential Delayed Complications:
                      </p>
                      <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                        {selectedVector.delayedRisks.map((risk, idx) => (
                          <li key={idx}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-between border-t border-border pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedId(null)}
                  className="text-xs"
                >
                  ← Back to Bug List
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 20-SPECIES SEARCH & DIRECTORY SELECTOR                                    */
          /* ========================================================================= */
          <div className="p-6">
            <div className="space-y-1 border-b border-border pb-5">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Skip AI Analysis
              </span>
              <DialogTitle className="font-display text-2xl font-bold tracking-tight text-foreground">
                I Know What Bit Me
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Select your insect, spider, or viper to see immediate, definitive first-aid steps,
                dangerous folklore myths, and emergency red flags.
              </p>

              {/* Search & Category Filter */}
              <div className="pt-3">
                <div className="relative">
                  <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by bug or sting (e.g. 'deer tick', 'recluse', 'bee', 'rattlesnake')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background py-2 pr-4 pl-9 text-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      selectedCategory === "all"
                        ? "bg-foreground text-background font-semibold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All (20)
                  </button>
                  {HAZARD_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        selectedCategory === cat.id
                          ? "bg-foreground text-background font-semibold"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Species Grid Grouped by Category */}
            <div className="mt-5 space-y-6">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <h3 className="font-display text-sm font-bold text-foreground">{cat.label}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {cat.species.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {cat.species.map((species) => {
                      const photo = creatureReferenceOf(species.id);
                      return (
                        <button
                          key={species.id}
                          type="button"
                          onClick={() => setSelectedId(species.id)}
                          className="group flex items-center justify-between rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/50 hover:bg-muted/30 shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            {photo ? (
                              <img
                                src={photo.src}
                                alt={photo.alt}
                                className="size-11 shrink-0 rounded-lg object-cover border border-border/80"
                              />
                            ) : (
                              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-xs">
                                🐛
                              </span>
                            )}
                            <div>
                              <p className="font-semibold text-xs text-foreground group-hover:text-primary transition">
                                {species.name}
                              </p>
                              <p className="font-mono text-[10px] italic text-muted-foreground">
                                {species.scientificName}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="size-4 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
