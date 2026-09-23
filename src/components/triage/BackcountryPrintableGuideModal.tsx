import {
  Printer,
  X,
  Compass,
  PhoneCall,
  Radio,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Waves,
  Baby,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type BackcountryPrintableGuideModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BackcountryPrintableGuideModal({
  open,
  onOpenChange,
}: BackcountryPrintableGuideModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-border bg-card rounded-2xl sm:rounded-3xl print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full print:max-h-none print:overflow-visible">
        <DialogTitle className="sr-only">
          BiteID Printable Backcountry & Wilderness Pocket Guide
        </DialogTitle>

        {/* Top Control Bar (Hidden when printing) */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-card/95 px-5 py-3.5 backdrop-blur-md no-print">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Printable Backcountry Field Guide
              </h2>
              <p className="text-xs text-muted-foreground">
                2-page laminated pocket reference for packs, scout troops, and wilderness first aid.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="font-semibold gap-1.5 shadow-xs">
              <Printer className="size-4" />
              <span>Print / Save PDF (2 Pages)</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-5 sm:p-7 space-y-6 text-foreground bg-card print:bg-white print:p-4 text-xs leading-relaxed">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-foreground/90 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight uppercase">
                  BiteID Wilderness Pocket Guide
                </span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary print:border print:border-neutral-400">
                  Field First Aid Cheat Sheet
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Zero-cellular offline decision tree: venomous bites, stings, marine hazards, and
                emergency triage.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono font-bold">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">
                Poison Help: 1-800-222-1222
              </span>
              <span className="rounded-full bg-destructive/10 border border-destructive/30 px-2.5 py-1 text-destructive">
                Emergency: 911 / SOS
              </span>
            </div>
          </div>

          {/* PAGE 1: HIGH HAZARD ENVENOMATIONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-1.5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-destructive" />
                <span>
                  Page 1: Venomous Envenomation Protocols (Snakes, Scorpions, Marine, Spiders)
                </span>
              </h3>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Time-Critical
              </span>
            </div>

            {/* Pit Viper vs Coral Snake */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Pit Viper */}
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-destructive text-xs uppercase tracking-wide">
                    Pit Vipers (Rattlesnake, Copperhead, Cottonmouth)
                  </span>
                  <span className="text-[10px] font-semibold bg-destructive/15 text-destructive rounded px-1.5 py-0.5">
                    Cytotoxic / Hemotoxic
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Signs:</strong> 1–2 distinct fang punctures, rapid spreading swelling,
                  intense burning pain, bruising/ecchymosis, systemic coagulopathy.
                </p>
                <div className="text-[11px] space-y-1">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">
                    DO: Keep patient calm & still. Remove all rings, watches & shoes immediately.
                    Position limb at neutral heart level. Mark leading edge of swelling every 15 min
                    with pen.
                  </p>
                  <p className="font-bold text-rose-700 dark:text-rose-400">
                    NEVER: NO tourniquets. NO cutting, suction, or extractor devices. NO ice packs.
                    NO aspirin or NSAIDs (bleeding risk).
                  </p>
                </div>
              </div>

              {/* Coral Snake */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-700 dark:text-amber-400 text-xs uppercase tracking-wide">
                    Coral Snake (Micrurus fulvius)
                  </span>
                  <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded px-1.5 py-0.5">
                    Neurotoxic
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Rhyme:</strong> &quot;Red touch yellow, kill a fellow; red touch black,
                  venom lack&quot; (North America only). Minimal initial pain/swelling.
                </p>
                <div className="text-[11px] space-y-1">
                  <p className="font-bold text-foreground">
                    Action: Delayed respiratory paralysis can occur 1–12 hours later. Pressure
                    immobilization bandage (PIB, 40–70 mmHg) is indicated. Evacuate immediately for
                    equine coral snake antivenom before bulbar palsy begins.
                  </p>
                </div>
              </div>
            </div>

            {/* Bark Scorpion & Marine Envenomations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Bark Scorpion */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                    Bark Scorpion (Centruroides)
                  </span>
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary rounded px-1.5 py-0.5">
                    Neurotoxic
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Tap Test:</strong> Light tap on site causes intense shooting electric
                  pain. Pediatric high risk (&lt; 6 yrs): rapid roving eye movements (nystagmus),
                  excessive drooling, airway secretions.
                </p>
                <p className="text-[11px]">
                  <strong>Protocol:</strong> Cold compress for pain. Wash site. If systemic
                  neurotoxicity occurs (airway/eye spasms), immediate evacuation for Anascorp
                  antivenom. Do not give sedatives or opiates.
                </p>
              </div>

              {/* Marine: Jellyfish & Stingray */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700 dark:text-blue-400 text-xs uppercase tracking-wide flex items-center gap-1">
                    <Waves className="size-3.5" />
                    Marine (Jellyfish & Stingray)
                  </span>
                  <span className="text-[10px] font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-400 rounded px-1.5 py-0.5">
                    Heat-Labile Venoms
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Jellyfish / Man o&apos; War:</strong> Rinse immediately with household
                  vinegar (5% acetic acid) for 30s to arrest nematocysts. (NEVER fresh water or
                  rubbing). Immerse in hot water (110–113°F / 45°C) for 20–45 min.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Stingray Puncture:</strong> Immerse limb in non-scalding hot water
                  (110–115°F / 45°C) for 30–90 min to denature venom protein. Clean puncture;
                  tetanus & antibiotic prophylaxis for Vibrio vulnificus.
                </p>
              </div>
            </div>

            {/* Black Widow vs Brown Recluse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
                <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                  Black Widow Spider (Latrodectus)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Presentation:</strong> Faint twin pinpricks with target halo. Systemic
                  neurotoxin (latrotoxin) triggers intense muscle cramping, board-like rigid abdomen
                  (mimics appendicitis), diaphoresis, and hypertension within 1–3 hours.
                </p>
                <p className="text-[11px]">
                  <strong>Management:</strong> Ice pack to bite site, oral analgesics, transport to
                  ER for IV muscle relaxants (benzodiazepines) and antivenin for refractory spasms.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
                <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                  Brown Recluse Spider (Loxosceles)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Presentation:</strong> Painless initially. Over 24–72 hours develops
                  classic &quot;red, white, and blue&quot; sign: central violaceous bleb surrounded
                  by white ischemia and peripheral erythema, resolving into a sunken necrotic
                  eschar.
                </p>
                <p className="text-[11px]">
                  <strong>Management:</strong> RICE (Rest, Ice, Compression, Elevation). NEVER
                  perform early surgical debridement or excision (worsens scarring).
                </p>
              </div>
            </div>
          </div>

          {/* PAGE BREAK INDICATOR FOR PRINT */}
          <div className="border-t-2 border-dashed border-border/80 my-4 text-center print:page-break-before print:border-neutral-300">
            <span className="bg-card px-3 text-[10px] text-muted-foreground uppercase tracking-widest print:bg-white">
              --- Fold / Page 2: Mechanical Extractions, Anaphylaxis, & Safety Guardrails ---
            </span>
          </div>

          {/* PAGE 2: MECHANICS, ANAPHYLAXIS & VULNERABLE POPULATIONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-1.5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" />
                <span>Page 2: Tick Extraction, Anaphylaxis & Population Safeguards</span>
              </h3>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Wilderness Safety
              </span>
            </div>

            {/* CDC Tick Extraction & Red Flags */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-xs uppercase tracking-wider">
                  CDC Mechanical Tick Extraction Standard
                </span>
                <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                  <Flame className="size-3" /> NO Matches / Vaseline
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-muted/30 p-2 rounded-lg">
                  <strong>1. Grasp at Base:</strong> Use clean, fine-tipped tweezers against the
                  skin surface.
                </div>
                <div className="bg-muted/30 p-2 rounded-lg">
                  <strong>2. Slow Steady Pull:</strong> Pull straight upward with even pressure. Do
                  NOT twist or jerk.
                </div>
                <div className="bg-muted/30 p-2 rounded-lg">
                  <strong>3. Disinfect:</strong> Wash thoroughly with soap & water or rubbing
                  alcohol.
                </div>
                <div className="bg-muted/30 p-2 rounded-lg">
                  <strong>4. Save Specimen:</strong> Bag tick with damp tissue for species
                  identification.
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground bg-muted/20 p-2.5 rounded-lg">
                <strong>Tick Disease Watch (1–30 Days):</strong> (1) <em>Erythema Migrans:</em>{" "}
                expanding circular target rash &gt; 5 cm = early Lyme; evaluate for prompt
                Doxycycline. (2) <em>Rocky Mountain Spotted Fever:</em> sudden high fever, headache,
                petechial spotted rash on wrists/ankles = <strong>medical emergency</strong>;
                requires empiric Doxycycline within 5 days to prevent fatality.
              </div>
            </div>

            {/* Anaphylaxis Protocol */}
            <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-destructive text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="size-4" />
                  Severe Anaphylaxis Emergency (Bees, Wasps, Ants, Fire Ants)
                </span>
                <span className="text-[10px] font-bold bg-destructive/15 text-destructive px-2 py-0.5 rounded">
                  EpiPen First
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                <strong>Symptoms:</strong> Airway wheezing, throat swelling, tongue numbness,
                diffuse hives, vomiting, sudden dizziness/hypotension.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="bg-card p-2 rounded border border-border">
                  <strong>1. Epinephrine:</strong> Inject EpiPen (0.3mg adult / 0.15mg child) into
                  outer mid-thigh. Hold firmly for 3s. Massage.
                </div>
                <div className="bg-card p-2 rounded border border-border">
                  <strong>2. Position Flat:</strong> Lay flat with legs elevated. If vomiting or
                  severe respiratory distress, position on side.
                </div>
                <div className="bg-card p-2 rounded border border-border">
                  <strong>3. Second Dose:</strong> If symptoms fail to improve after 5–15 minutes,
                  administer second auto-injector.
                </div>
              </div>
            </div>

            {/* Vulnerable Population Safeguards Table */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Baby className="size-3.5 text-primary" />
                Vulnerable Populations Backcountry Medication Safeguards
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 space-y-1">
                  <span className="font-bold text-rose-700 dark:text-rose-400 block">
                    Pediatric (&lt; 12 yrs)
                  </span>
                  <p>
                    • <strong>NEVER give Aspirin</strong> or Pepto-Bismol (fatal Reye&apos;s
                    syndrome risk).
                  </p>
                  <p>
                    • Weight-based dosing for Acetaminophen (10–15 mg/kg) via calibrated syringe.
                  </p>
                  <p>• Snakebite antivenom is NOT reduced by body weight.</p>
                </div>
                <div className="p-2.5 rounded-lg border border-purple-500/20 bg-purple-500/5 space-y-1">
                  <span className="font-bold text-purple-700 dark:text-purple-400 block">
                    Pregnancy
                  </span>
                  <p>
                    • <strong>Doxycycline & Ivermectin contraindicated</strong> (bone/dental
                    damage).
                  </p>
                  <p>• Safe alternative for Lyme: Amoxicillin 500mg TID (14–21 days).</p>
                  <p>• Pit viper bite: continuous electronic fetal monitoring required in ICU.</p>
                </div>
                <div className="p-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 space-y-1">
                  <span className="font-bold text-blue-700 dark:text-blue-400 block">
                    Geriatric (65+)
                  </span>
                  <p>
                    • <strong>Beers Criteria:</strong> Avoid Diphenhydramine (Benadryl) due to
                    confusion & fall risk.
                  </p>
                  <p>• Use 2nd-gen non-sedating Cetirizine (Zyrtec) or Loratadine.</p>
                  <p>• High cellulitis/sepsis risk; check for sudden delirium or hypothermia.</p>
                </div>
              </div>
            </div>

            {/* Backcountry Field Log Sheet for Notes */}
            <div className="rounded-xl border border-dashed border-border p-3 space-y-2 print:border-neutral-400 text-[10px]">
              <span className="font-bold uppercase tracking-wider text-muted-foreground block">
                Field Incident Log (Fill out for SAR / Paramedics):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div>Patient Name: _________________</div>
                <div>Time of Bite: _________________</div>
                <div>Limb/Site: ____________________</div>
                <div>GPS Coords: ___________________</div>
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono pt-1">
                <div>Swelling @ 0m: _____ cm</div>
                <div>Swelling @ 15m: _____ cm</div>
                <div>Swelling @ 30m: _____ cm</div>
                <div>Swelling @ 60m: _____ cm</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/80 pt-2 flex flex-col sm:flex-row justify-between text-[10px] text-muted-foreground">
            <span>
              BiteID Wilderness Field Guide • Non-Diagnostic Backcountry First Aid Protocol
            </span>
            <span>Poison Help: 1-800-222-1222 • Satellite SOS: iPhone 14+ / Garmin inReach</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
