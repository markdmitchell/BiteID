import { useEffect, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Compass,
  Download,
  Flame,
  HeartPulse,
  Info,
  Printer,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  Waves,
  WifiOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VECTOR_DATABASE } from "@/lib/geo-pest.server";
import { creatureReferenceOf } from "@/lib/creature-images";
import { getOfflineIntakes, removeOfflineIntake, type StashedIntake } from "@/lib/offline-manager";
import { checkOfflineCacheStatus, forceRefreshCache, type CacheStatus } from "@/lib/offline-cache";
import { BackcountryPrintableGuideModal } from "./BackcountryPrintableGuideModal";

type OfflineFieldKitModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOffline?: boolean;
  onOpenSnakebiteSurvival?: () => void;
};

export function OfflineFieldKitModal({
  open,
  onOpenChange,
  isOffline = false,
  onOpenSnakebiteSurvival,
}: OfflineFieldKitModalProps) {
  const [activeTab, setActiveTab] = useState<
    "snakes_scorpions" | "marine" | "atlas" | "tick_firstaid" | "rabies_mammal" | "queue"
  >("snakes_scorpions");
  const [searchQuery, setSearchQuery] = useState("");
  const [habitatFilter, setHabitatFilter] = useState<string>("all");
  const [queuedItems, setQueuedItems] = useState<StashedIntake[]>(getOfflineIntakes());
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [printableGuideOpen, setPrintableGuideOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setQueuedItems(getOfflineIntakes());
      checkOfflineCacheStatus().then(setCacheStatus);
    }
  }, [open]);

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    try {
      await forceRefreshCache();
      const status = await checkOfflineCacheStatus();
      setCacheStatus(status);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRemoveQueueItem = (id: string) => {
    removeOfflineIntake(id);
    setQueuedItems(getOfflineIntakes());
  };

  const vectors = Object.values(VECTOR_DATABASE);
  const filteredVectors = vectors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.associatedPathogens.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (habitatFilter === "all") return true;
    if (habitatFilter === "woods") return (v.habitatScores?.["tall_grass_woods"] ?? 0) >= 0.7;
    if (habitatFilter === "yard") return (v.habitatScores?.["yard_garden"] ?? 0) >= 0.7;
    if (habitatFilter === "water")
      return (
        (v.habitatScores?.["outdoor_other"] ?? 0) >= 0.8 ||
        v.id === "jellyfish" ||
        v.id === "stingray" ||
        v.id === "mosquito" ||
        v.id === "black_fly"
      );
    if (habitatFilter === "indoor")
      return (
        (v.habitatScores?.["indoor_other"] ?? 0) >= 0.5 ||
        (v.habitatScores?.["bed"] ?? 0) >= 0.5 ||
        v.id === "bed_bug" ||
        v.id === "brown_recluse" ||
        v.id === "scabies" ||
        v.id === "bird_rodent_mite" ||
        v.id === "lice" ||
        v.id === "brown_dog_tick"
      );
    return true;
  });

  const pitViperRef = creatureReferenceOf("pit_viper");
  const coralSnakeRef = creatureReferenceOf("coral_snake");
  const scorpionRef = creatureReferenceOf("scorpion");
  const jellyfishRef = creatureReferenceOf("jellyfish");
  const stingrayRef = creatureReferenceOf("stingray");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border bg-card rounded-2xl sm:rounded-3xl">
          <DialogTitle className="sr-only">BiteID Backcountry Offline Field Kit</DialogTitle>

          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-card/95 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Compass className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
                    Backcountry Offline Field Kit
                  </h2>
                  {isOffline ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <WifiOff className="size-3" />
                      Offline Mode
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="size-3" />
                      Offline Ready: {cacheStatus?.cachedCount ?? 32} Species Cached
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Zero-cellular emergency protocols, 32-species vector atlas, marine hazards, and ER
                  handoff.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrintableGuideOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
              >
                <Printer className="size-3.5" />
                <span>Pocket Guide (PDF)</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-full text-muted-foreground"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/60 bg-muted/30 px-5 pt-2 gap-2 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("snakes_scorpions")}
              className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "snakes_scorpions"
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldAlert className="size-4" />
              <span>Snakes & Scorpions</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("marine")}
              className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "marine"
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Waves className="size-4" />
              <span>Marine Envenomations</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("atlas")}
              className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "atlas"
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Compass className="size-4" />
              <span>{vectors.length}-Species Vector Atlas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tick_firstaid")}
              className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "tick_firstaid"
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <HeartPulse className="size-4" />
              <span>Tick Removal & Anaphylaxis</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rabies_mammal")}
              className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "rabies_mammal"
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertTriangle className="size-4 text-amber-500" />
              <span>Rabies & Mammalian Bites</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("queue")}
              className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "queue"
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Download className="size-4" />
              <span>Saved Intakes ({queuedItems.length})</span>
            </button>
          </div>

          {/* Tab 1: Snakes & Scorpions Protocol */}
          {activeTab === "snakes_scorpions" && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Critical Warning Box */}
              <div className="rounded-2xl border-2 border-red-500/40 bg-red-500/10 p-4 sm:p-5 text-xs sm:text-sm text-foreground space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  <AlertOctagon className="size-5" />
                  <span>Time-Critical Backcountry Envenomation Protocol</span>
                </div>
                <p className="leading-relaxed">
                  Venomous snakebites (Pit Vipers & Coral Snakes) and Bark Scorpion stings require
                  immediate medical evaluation and potential antivenom (CroFab, Anavip, Coralmin, or
                  Anascorp). In backcountry zones without cell reception, trigger your{" "}
                  <strong>Satellite SOS</strong> immediately.
                </p>
              </div>

              {/* Pit Viper / Snakebite Emergency Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {pitViperRef && (
                    <img
                      src={pitViperRef.src}
                      alt={pitViperRef.alt}
                      className="w-full sm:w-44 h-36 object-cover rounded-xl border border-border shrink-0 shadow-xs"
                    />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Pit Viper Snakebites (Copperhead, Cottonmouth, Rattlesnake)
                      </h3>
                      <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                        High Emergency
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Morphology:</strong> Distinct <em>twin fang puncture marks</em> spaced
                      ~1–2 cm apart, rapid progressive swelling, severe burning pain, and spreading
                      purpura / ecchymosis.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Venom:</strong> Cytotoxic and hemotoxic enzymes destroy capillary
                      tissue and alter blood clotting.
                    </p>
                  </div>
                </div>

                {onOpenSnakebiteSurvival && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        onOpenChange(false);
                        onOpenSnakebiteSurvival();
                      }}
                      className="w-full gap-2 text-xs font-bold shadow-sm"
                    >
                      <ShieldAlert className="size-4" />
                      Launch Live 15-Minute Snakebite Survival Mode & Timer
                    </Button>
                  </div>
                )}

                {/* Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="size-4" />
                      Essential Immediate First Aid (DO THIS)
                    </h4>
                    <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                      <li>
                        • <strong>Keep Calm & Still:</strong> Movement accelerates venom lymph
                        circulation. Lie down or rest.
                      </li>
                      <li>
                        • <strong>Remove Rings & Jewelry:</strong> Swelling can be rapid and
                        massive; remove constricting rings, watches, and shoes immediately.
                      </li>
                      <li>
                        • <strong>Position at Neutral Heart Level:</strong> Do NOT elevate above
                        heart (spreads venom) and do NOT let limb hang down (worsens edema).
                      </li>
                      <li>
                        • <strong>Mark the Swelling:</strong> Use a pen to outline the leading edge
                        of swelling and write the time every 15 minutes.
                      </li>
                      <li>
                        • <strong>Gently Clean:</strong> Wash surface gently with clean water and
                        cover with a sterile, loose dressing.
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
                    <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="size-4" />
                      Deadly Folklore Myths (NEVER DO THIS)
                    </h4>
                    <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                      <li>
                        • <strong>NO Tourniquets or Bands:</strong> Trapping venom in a limb causes
                        concentrated necrosis and limb amputation.
                      </li>
                      <li>
                        • <strong>NO Cutting or Sucking:</strong> Mouth bacteria causes severe wound
                        infection; suction extractors are completely ineffective.
                      </li>
                      <li>
                        • <strong>NO Ice or Cold Packs:</strong> Cryotherapy combined with hemotoxic
                        venom accelerates irreversible tissue necrosis.
                      </li>
                      <li>
                        • <strong>NO Alcohol or Aspirin:</strong> Blood thinners exacerbate
                        venom-induced coagulopathy and internal bleeding.
                      </li>
                      <li>
                        • <strong>DO NOT Chase Snake:</strong> Dead snakes can still inject venom
                        via reflex bite. Leave the area safely.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Satellite SOS Instructions */}
                <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-foreground text-xs uppercase tracking-wide">
                    <Radio className="size-4 text-primary" />
                    <span>How to Dispatch Backcountry Satellite SOS (No Cell Service)</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>iPhone 14+ (Emergency SOS via Satellite):</strong> Swipe down Control
                    Center or attempt to call 911. Follow onscreen prompts to align with an overhead
                    satellite. Select <em>&quot;Bite / Envenomation&quot;</em>, state:
                    <em>
                      {" "}
                      &quot;Suspected pit viper bite on [limb]. Swelling rapidly expanding. Need
                      ground/air evacuation to hospital with CroFab antivenom.&quot;
                    </em>
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Garmin inReach / ZOLEO / SPOT:</strong> Trigger physical SOS slider.
                    When rescue coordinates confirm, message local SAR:{" "}
                    <em>
                      &quot;Snakebite envenomation. Patient immobilized. Coordinates attached.&quot;
                    </em>
                  </p>
                </div>
              </div>

              {/* Coral Snake Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {coralSnakeRef && (
                    <img
                      src={coralSnakeRef.src}
                      alt={coralSnakeRef.alt}
                      className="w-full sm:w-44 h-36 object-cover rounded-xl border border-border shrink-0 shadow-xs"
                    />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Eastern & Western Coral Snake (Micrurus)
                      </h3>
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Potent Neurotoxin
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Identification:</strong> &quot;Red touch yellow, kill a fellow; red
                      touch black, friend of Jack.&quot; (Valid for North American native elapids).
                      Coral snakes have short fixed fangs and often chew on the bite site.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Clinical Presentation:</strong> Minimal early pain or swelling!
                      Symptoms are delayed by 1–12 hours: ptosis (drooping eyelids), slurred speech,
                      generalized paralysis, and respiratory arrest.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs space-y-2">
                  <h4 className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                    Coral Snake Field Action (Different from Pit Vipers)
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Unlike pit vipers where pressure bandages worsen necrosis, a{" "}
                    <strong>Pressure Immobilization Bandage (PIB)</strong> wrapped firmly (similar
                    to an elastic sprain wrap, 40–70 mmHg) around the entire bitten limb can slow
                    coral snake neurotoxin dissemination through the lymphatics. Immediate emergency
                    evacuation to an ICU with equine coral snake antivenom is mandatory before
                    respiratory paralysis begins.
                  </p>
                </div>
              </div>

              {/* Bark Scorpion Protocol */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {scorpionRef && (
                    <img
                      src={scorpionRef.src}
                      alt={scorpionRef.alt}
                      className="w-full sm:w-44 h-36 object-cover rounded-xl border border-border shrink-0 shadow-xs"
                    />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Bark Scorpion Envenomation (Centruroides)
                      </h3>
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        Neurotoxic Hazard
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Morphology:</strong> Minimal visible puncture mark or puncture wheal.
                      The hallmark sign is
                      <strong> extreme hypersensitivity</strong>: even a light tap on the skin
                      creates intense shooting electric pain.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Critical Signs:</strong> Involuntary muscle twitching, rapid eye
                      roving movements (nystagmus), slurred speech, and excessive foaming or
                      salivation. <em>Highest mortality risk is in children under 6.</em>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Scorpion First Aid Steps
                    </h4>
                    <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                      <li>
                        • <strong>Apply Cold Compress:</strong> Unlike snakebites, cold compresses
                        wrapped in a cloth (15 min on, 15 min off) reduce localized pain.
                      </li>
                      <li>
                        • <strong>Wash Thoroughly:</strong> Use mild soap and water to prevent
                        secondary skin infection.
                      </li>
                      <li>
                        • <strong>Avoid Opiates or Sedatives:</strong> Do not administer sedatives
                        which compound neurotoxic respiratory depression. Use oral acetaminophen.
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                    <h4 className="font-bold text-destructive uppercase tracking-wider text-[11px]">
                      When Antivenom (Anascorp) is Required
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      If the patient exhibits Grade 3 or 4 systemic neurotoxicity (airway
                      compromise, cranial nerve dysfunction, loss of muscle coordination, roving eye
                      movements), immediately transport to an emergency facility equipped with{" "}
                      <strong>Anascorp</strong> (equine F(ab&apos;)2 scorpion antivenom).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Marine Envenomations */}
          {activeTab === "marine" && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Marine Notice */}
              <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/10 p-4 sm:p-5 text-xs sm:text-sm text-foreground space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                  <Waves className="size-5" />
                  <span>Marine Wilderness & Coastal Envenomation Protocols</span>
                </div>
                <p className="leading-relaxed">
                  Marine toxins (Jellyfish nematocysts and Stingray barb venoms) contain heat-labile
                  proteins that respond to specific thermal and biochemical first-aid actions. Using
                  the wrong fluid (e.g. fresh water on a jellyfish) triggers widespread nematocyst
                  discharge and severe envenomation.
                </p>
              </div>

              {/* Jellyfish & Portuguese Man o' War */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {jellyfishRef && (
                    <img
                      src={jellyfishRef.src}
                      alt={jellyfishRef.alt}
                      className="w-full sm:w-44 h-36 object-cover rounded-xl border border-border shrink-0 shadow-xs"
                    />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Jellyfish & Portuguese Man o&apos; War (Physalia physalis)
                      </h3>
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Nematocyst Hazard
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Morphology:</strong> Whiplike linear erythematous tracks, painful
                      vesicular wheals, intense burning, radiating extremity pain.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Systemic Risks:</strong> Irukandji syndrome, severe backache,
                      autonomic instability, tachycardia, or cardiac arrest in severe oceanic
                      stings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="size-4" />
                      Evidence-Based First Aid (DO THIS)
                    </h4>
                    <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                      <li>
                        • <strong>Rinse Liberally with Vinegar:</strong> Douse with 5% acetic acid
                        (vinegar) for at least 30 seconds to inactivate unfired nematocysts. If
                        vinegar is absent, rinse with saltwater.
                      </li>
                      <li>
                        • <strong>Hot Water Immersion:</strong> Immerse the affected limb in hot,
                        tolerable non-scalding water (110–113°F / 43–45°C) for 20–45 minutes to
                        denature venom proteins.
                      </li>
                      <li>
                        • <strong>Carefully Remove Tentacles:</strong> Use tweezers or the edge of a
                        credit card to lift remaining tentacles. Never touch barehanded.
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
                    <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="size-4" />
                      Dangerous Myths (NEVER DO THIS)
                    </h4>
                    <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                      <li>
                        • <strong>NEVER Rinse with Fresh Tap Water:</strong> Osmotic shock causes
                        millions of unfired nematocysts to fire simultaneously into the skin.
                      </li>
                      <li>
                        • <strong>NEVER Rub with Sand or Towels:</strong> Physical friction
                        discharges all dormant venom capsules.
                      </li>
                      <li>
                        • <strong>DO NOT Urinate on Stings:</strong> Urine lacks sufficient acetic
                        acid and often triggers further nematocyst firing.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stingray Puncture */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {stingrayRef && (
                    <img
                      src={stingrayRef.src}
                      alt={stingrayRef.alt}
                      className="w-full sm:w-44 h-36 object-cover rounded-xl border border-border shrink-0 shadow-xs"
                    />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Stingray Envenomation & Barb Puncture (Dasyatidae)
                      </h3>
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Puncture & Heat-Labile Venom
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Mechanism:</strong> Stepping on a ray concealed in shallow sand
                      triggers a reflex caudal spine strike. The serrated retroserrated barb
                      lacerates flesh and deposits an integumentary venom sheath.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Pain:</strong> Disproportionately agonizing, peaking at 30–90 minutes,
                      often causing syncope (fainting) or severe distress.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Immediate Hot Water Treatment
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Submerge the wounded extremity in <strong>hot, non-scalding water</strong>{" "}
                      (110–115°F / 43–46°C) as quickly as possible for{" "}
                      <strong>30 to 90 minutes</strong>. The venom protein is strictly heat-labile;
                      hot water produces immediate, dramatic pain relief that returns if the limb is
                      removed too early.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Infection & Retained Barb Warning
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Seek ER evaluation for deep punctures. Plain radiographs or ultrasound are
                      essential to rule out retained radiopaque barb fragments. Tetanus prophylaxis
                      and antibiotics covering marine bacteria (such as <em>Vibrio vulnificus</em>{" "}
                      and <em>Aeromonas</em>) with ciprofloxacin or doxycycline are routinely
                      indicated.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 32-Species Vector Atlas */}
          {activeTab === "atlas" && (
            <div className="p-5 sm:p-6 space-y-5">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Search ${vectors.length} species, diseases...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {[
                    { id: "all", label: `All (${vectors.length})` },
                    { id: "woods", label: "Woods & Trails" },
                    { id: "yard", label: "Yard & Garden" },
                    { id: "water", label: "Water & Coastal" },
                    { id: "indoor", label: "Indoor & Home" },
                  ].map((hab) => (
                    <button
                      key={hab.id}
                      type="button"
                      onClick={() => setHabitatFilter(hab.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                        habitatFilter === hab.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {hab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vector Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVectors.map((vector) => {
                  const imgRef = creatureReferenceOf(vector.id);
                  return (
                    <div
                      key={vector.id}
                      className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs hover:border-primary/40 transition-colors"
                    >
                      <div className="flex gap-3.5 items-start">
                        {imgRef ? (
                          <img
                            src={imgRef.src}
                            alt={imgRef.alt}
                            className="size-20 rounded-xl object-cover border border-border shrink-0 shadow-xs"
                            loading="lazy"
                          />
                        ) : (
                          <div className="size-20 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 text-xs">
                            Specimen
                          </div>
                        )}
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h4 className="font-display text-sm font-bold text-foreground truncate">
                            {vector.name}
                          </h4>
                          <p className="text-[11px] text-muted-foreground italic truncate">
                            {vector.scientificName}
                          </p>
                          <div className="pt-1 flex flex-wrap gap-1">
                            {vector.associatedPathogens.slice(0, 2).map((p, i) => (
                              <span
                                key={i}
                                className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground truncate"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs border-t border-border/60 pt-2.5">
                        <div>
                          <span className="font-semibold text-[11px] uppercase tracking-wide text-primary block">
                            First Aid:
                          </span>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {vector.firstAidAdvice.join(" ")}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-[11px] uppercase tracking-wide text-caution-foreground block">
                            Watch For:
                          </span>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {vector.warningSigns.join(" ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Tick Removal & Anaphylaxis */}
          {activeTab === "tick_firstaid" && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* CDC Tick Removal Protocol */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="size-4" />
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground">
                    CDC-Approved Mechanical Tick Extraction Protocol
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                      1
                    </span>
                    <p className="font-semibold text-foreground">Grasp at Skin Surface</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Use fine-tipped tweezers to grasp the tick as close to the skin&apos;s surface
                      as possible.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                      2
                    </span>
                    <p className="font-semibold text-foreground">Steady Upward Pull</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Pull upward with steady, even pressure. <strong>Do not jerk or twist</strong>,
                      which tears mouthparts.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                      3
                    </span>
                    <p className="font-semibold text-foreground">Cleanse Thoroughly</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Disinfect the bite site and your hands with rubbing alcohol, iodine, or warm
                      soap and water.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                      4
                    </span>
                    <p className="font-semibold text-foreground">Preserve for Testing</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Place tick in a sealed plastic bag with a damp cotton ball. Label with date
                      and anatomical site.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-caution/30 bg-caution/10 p-3 text-xs text-caution-foreground space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Flame className="size-4" />
                    Harmful Folklore Practices to AVOID:
                  </p>
                  <p className="leading-relaxed">
                    Never use a glowing hot match, petroleum jelly (Vaseline), nail polish, or
                    essential oils to &quot;smother&quot; a tick. Irritating the tick causes it to
                    regurgitate stomach contents into your bloodstream, drastically accelerating
                    pathogen transmission.
                  </p>
                </div>
              </div>

              {/* Severe Anaphylaxis Protocol */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-4" />
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Severe Allergic Anaphylaxis Emergency Response
                  </h3>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                  <p>
                    Hymenoptera stings (bees, wasps, hornets, fire ants) can trigger systemic
                    IgE-mediated anaphylaxis within minutes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                      <span className="font-bold text-foreground block text-[11px] uppercase">
                        1. Red Flag Symptoms
                      </span>
                      <p className="text-[11px]">
                        Hoarseness, difficulty swallowing, throat tightness, diffuse hives,
                        wheezing, dizziness, syncope.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                      <span className="font-bold text-foreground block text-[11px] uppercase">
                        2. Inject Epinephrine
                      </span>
                      <p className="text-[11px]">
                        Inject EpiPen (0.3mg adult / 0.15mg child) into middle outer thigh. Hold
                        firmly for 3 seconds. Massage site.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                      <span className="font-bold text-foreground block text-[11px] uppercase">
                        3. Positioning
                      </span>
                      <p className="text-[11px]">
                        Lay patient flat on back with legs elevated. If vomiting or breathing
                        difficulty, position on side.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Rabies & Mammalian Bites Backcountry Protocol */}
          {activeTab === "rabies_mammal" && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Critical Alert Box */}
              <div className="rounded-2xl border-2 border-red-500/40 bg-red-500/10 p-4 sm:p-5 text-xs sm:text-sm text-foreground space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  <AlertOctagon className="size-5" />
                  <span>Time-Critical Rabies & Mammalian Bite Protocol</span>
                </div>
                <p className="leading-relaxed">
                  Rabies is an acute viral encephalomyelitis with a{" "}
                  <strong>~100% fatality rate</strong> once clinical symptoms appear. However, it is{" "}
                  <strong>100% preventable</strong> with prompt post-exposure prophylaxis (PEP)
                  administered before the virus enters peripheral nerves. In backcountry
                  environments, initiate the 15-minute wound wash immediately and coordinate
                  evacuation to an emergency medical facility.
                </p>
              </div>

              {/* Step 1: Immediate Backcountry Wound Wash */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs">
                    1
                  </span>
                  <span>Immediate First Aid: The 15-Minute Wash (Critical Life-Saving Step)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  According to the CDC and World Health Organization, vigorous mechanical cleansing
                  of animal bite or scratch wounds with copious water and soap can reduce the viral
                  inoculum by <strong>greater than 90%</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="font-bold text-foreground">Soap & Copious Running Water:</span>
                    <p className="text-muted-foreground">
                      Irrigate the wound vigorously for a minimum of{" "}
                      <strong>15 continuous minutes</strong> using camp soap, iodophor solution
                      (povidone-iodine), or potable water from a hydration bladder.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="font-bold text-foreground">
                      Do NOT Suture / Bandage Tight:
                    </span>
                    <p className="text-muted-foreground">
                      Leave animal bite wounds open to drain unless severe arterial bleeding demands
                      direct pressure. Never seal or butterfly-bandage an animal puncture in the
                      backcountry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: The Invisible Bat Bite Rule */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>The CDC "Bat in the Sleeping Area" Rule</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  Bat teeth are razor-fine (often &lt;1 mm long). Punctures can be{" "}
                  <strong>completely invisible, painless, and produce zero bleeding</strong>. Bats
                  cause ~70% of human rabies cases in the United States.
                </p>
                <div className="rounded-xl bg-card border border-border p-3 text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground">
                    High-Risk Scenarios Requiring Immediate Rabies PEP:
                  </span>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Waking up to find a bat in your tent, cabin, sleeping bag, or bedroom.</li>
                    <li>
                      A bat found in the same room as an unattended child, intoxicated adult, or
                      sleeping person.
                    </li>
                    <li>Direct bare-skin contact with a bat, even if no bite mark is seen.</li>
                  </ul>
                </div>
              </div>

              {/* Step 3: High-Risk vs Low-Risk North American Species */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <h4 className="font-display text-sm font-bold text-foreground">
                  North American Wildlife Rabies Reservoir Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                      <AlertOctagon className="size-4" />
                      <span>HIGH-RISK CARRIERS (Assume Rabid Until Tested)</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      <li>
                        <strong>Bats:</strong> All species nationwide.
                      </li>
                      <li>
                        <strong>Raccoons:</strong> Eastern Seaboard from Maine to Florida.
                      </li>
                      <li>
                        <strong>Skunks:</strong> Midwest, Central Plains, California, Texas.
                      </li>
                      <li>
                        <strong>Foxes:</strong> Southwest, Eastern US, and Alaska.
                      </li>
                      <li>
                        <strong>Coyotes &amp; Bobcat:</strong> Occasional regional spillover.
                      </li>
                      <li>
                        <strong>Feral Dogs &amp; Cats:</strong> High risk if vaccination status is
                        unknown.
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="size-4" />
                      <span>ALMOST NEVER RABID (Low Rabies Risk)</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      <li>
                        <strong>Small Rodents:</strong> Squirrels, chipmunks, mice, rats, voles.
                      </li>
                      <li>
                        <strong>Lagomorphs:</strong> Rabbits, hares, pikas.
                      </li>
                      <li>
                        <strong>Opossums:</strong> Body temperature is usually too low for rabies
                        virus replication.
                      </li>
                      <li>
                        <em>Note:</em> Small rodent bites still require wound disinfection and
                        tetanus booster evaluation (Rat-Bite Fever risk).
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4: Backcountry Evacuation & Medical Action */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Compass className="size-4" />
                  <span>Evacuation &amp; Clinical PEP Schedule</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    <strong>Rabies Post-Exposure Prophylaxis (PEP)</strong> should be initiated as
                    soon as possible, ideally within <strong>24 to 72 hours</strong>:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-foreground/90">
                    <li>
                      <strong>Human Rabies Immune Globulin (HRIG):</strong> 20 IU/kg infiltrated
                      directly into and around the wound on Day 0 for immediate passive antibody
                      coverage.
                    </li>
                    <li>
                      <strong>Rabies Vaccine (4 doses):</strong> 1.0 mL intramuscularly in the
                      deltoid muscle on <strong>Days 0, 3, 7, and 14</strong> (Day 28 added for
                      immunocompromised patients).
                    </li>
                  </ol>
                  <p className="mt-2 text-muted-foreground">
                    <strong>Wildlife Quarantine:</strong> If safe, contain the animal without
                    endangering yourself. <em>Never damage the head or brain</em>, as public health
                    laboratories require intact neural tissue for the Direct Fluorescent Antibody
                    (DFA) test.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Saved Intakes (Pending Queue) */}
          {activeTab === "queue" && (
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Stashed Backcountry Intakes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Intakes captured without cellular service are stored safely on your device.
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {queuedItems.length} Stashed
                </span>
              </div>

              {queuedItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                  <Smartphone className="size-8 mx-auto text-muted-foreground" />
                  <p className="font-semibold text-foreground text-sm">No Pending Intakes</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    When you submit an assessment while in offline backcountry mode, your photos and
                    answers are preserved here until you return to coverage.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queuedItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-4 items-start justify-between shadow-xs"
                    >
                      <div className="flex gap-3 items-center">
                        {item.lesionPreviewUrl ? (
                          <img
                            src={item.lesionPreviewUrl}
                            alt="Stashed lesion"
                            className="size-16 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="size-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No Photo
                          </div>
                        )}
                        <div className="space-y-0.5 text-xs">
                          <p className="font-bold text-foreground">Intake {item.id}</p>
                          <p className="text-muted-foreground">Captured: {item.timestamp}</p>
                          <p className="text-muted-foreground">
                            Site:{" "}
                            <span className="capitalize">
                              {item.bodyLocation.replace(/_/g, " ")}
                            </span>{" "}
                            | Sensation:{" "}
                            <span className="capitalize">{item.sensation.replace(/_/g, " ")}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="text-destructive hover:bg-destructive/10 text-xs"
                        >
                          <Trash2 className="size-3.5 mr-1" />
                          Discard
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border/80 bg-muted/20 px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info className="size-3.5 text-primary shrink-0" />
              <span>
                {cacheStatus?.cachedCount ?? 32}/32 species and field protocols pre-cached in local
                browser storage.
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshCache}
                disabled={isRefreshing}
                className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                title="Verify or re-download cache"
              >
                <RefreshCw className={`size-3 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="ml-1 hidden sm:inline">Check Cache</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPrintableGuideOpen(true)}
                className="text-xs"
              >
                <Printer className="size-3 mr-1" />
                Pocket Guide
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Close Field Kit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BackcountryPrintableGuideModal
        open={printableGuideOpen}
        onOpenChange={setPrintableGuideOpen}
      />
    </>
  );
}
