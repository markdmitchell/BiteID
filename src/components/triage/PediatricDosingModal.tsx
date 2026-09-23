import { useState, useMemo } from "react";
import {
  Baby,
  X,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Pill,
  BookOpen,
  Info,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type PediatricDosingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialWeightKg?: number;
};

export type AgeTier = "under_6mo" | "6_to_23mo" | "2_to_11yr" | "12_plus";

export function PediatricDosingModal({
  open,
  onOpenChange,
  initialWeightKg = 14,
}: PediatricDosingModalProps) {
  const [ageTier, setAgeTier] = useState<AgeTier>("2_to_11yr");
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [weightValue, setWeightValue] = useState<number>(() =>
    unit === "lbs" ? Math.round(initialWeightKg * 2.20462) : initialWeightKg,
  );

  const effectiveWeightKg = useMemo(() => {
    return unit === "lbs" ? weightValue / 2.20462 : weightValue;
  }, [weightValue, unit]);

  const effectiveWeightLbs = useMemo(() => {
    return unit === "lbs" ? weightValue : weightValue * 2.20462;
  }, [weightValue, unit]);

  const isUnder6Mo = ageTier === "under_6mo";
  const isUnder2Yr = ageTier === "under_6mo" || ageTier === "6_to_23mo";

  // FDA & Manufacturer standard packaging brackets
  const tylenolBracket = useMemo(() => {
    if (effectiveWeightLbs < 24 || isUnder2Yr) {
      return {
        bracket: "Under 24 lbs (< 2 yrs)",
        dose: "Ask a doctor",
        note: "Pediatrician consultation required",
      };
    }
    if (effectiveWeightLbs <= 35) {
      return {
        bracket: "24–35 lbs (2–3 yrs)",
        dose: "5 mL (160 mg)",
        note: "Every 4–6 hrs as needed (Max 5 doses/day)",
      };
    }
    if (effectiveWeightLbs <= 47) {
      return {
        bracket: "36–47 lbs (4–5 yrs)",
        dose: "7.5 mL (240 mg)",
        note: "Every 4–6 hrs as needed (Max 5 doses/day)",
      };
    }
    if (effectiveWeightLbs <= 59) {
      return {
        bracket: "48–59 lbs (6–8 yrs)",
        dose: "10 mL (320 mg)",
        note: "Every 4–6 hrs as needed (Max 5 doses/day)",
      };
    }
    if (effectiveWeightLbs <= 71) {
      return {
        bracket: "60–71 lbs (9–10 yrs)",
        dose: "12.5 mL (400 mg)",
        note: "Every 4–6 hrs as needed (Max 5 doses/day)",
      };
    }
    return {
      bracket: "72–95 lbs (11 yrs)",
      dose: "15 mL (480 mg)",
      note: "Every 4–6 hrs as needed (Max 5 doses/day)",
    };
  }, [effectiveWeightLbs, isUnder2Yr]);

  const motrinBracket = useMemo(() => {
    if (isUnder6Mo) {
      return {
        bracket: "Under 6 Months",
        dose: "CONTRAINDICATED",
        note: "Immature renal clearance",
      };
    }
    if (effectiveWeightLbs < 18) {
      return {
        bracket: "12–17 lbs (6–11 mos)",
        dose: "Ask doctor / 2.5 mL (50 mg)",
        note: "Confirm with pediatrician",
      };
    }
    if (effectiveWeightLbs < 24) {
      return {
        bracket: "18–23 lbs (12–23 mos)",
        dose: "Ask doctor / 4 mL (80 mg)",
        note: "Confirm with pediatrician",
      };
    }
    if (effectiveWeightLbs <= 35) {
      return {
        bracket: "24–35 lbs (2–3 yrs)",
        dose: "5 mL (100 mg)",
        note: "Every 6–8 hrs (Max 4 doses/day)",
      };
    }
    if (effectiveWeightLbs <= 47) {
      return {
        bracket: "36–47 lbs (4–5 yrs)",
        dose: "7.5 mL (150 mg)",
        note: "Every 6–8 hrs (Max 4 doses/day)",
      };
    }
    if (effectiveWeightLbs <= 59) {
      return {
        bracket: "48–59 lbs (6–8 yrs)",
        dose: "10 mL (200 mg)",
        note: "Every 6–8 hrs (Max 4 doses/day)",
      };
    }
    if (effectiveWeightLbs <= 71) {
      return {
        bracket: "60–71 lbs (9–10 yrs)",
        dose: "12.5 mL (250 mg)",
        note: "Every 6–8 hrs (Max 4 doses/day)",
      };
    }
    return {
      bracket: "72–95 lbs (11 yrs)",
      dose: "15 mL (300 mg)",
      note: "Every 6–8 hrs (Max 4 doses/day)",
    };
  }, [effectiveWeightLbs, isUnder6Mo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card rounded-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">
          Pediatric OTC Medication Safety &amp; Packaging Reference Guide
        </DialogTitle>

        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-card/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <BookOpen className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Pediatric Medication Safety &amp; Packaging Guide
              </h2>
              <p className="text-xs text-muted-foreground">
                Manufacturer OTC packaging tables &amp; pediatric safety limits. Not a prescription.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-muted-foreground"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {/* CRITICAL BLACK-BOX SAFETY WARNING */}
          <div className="rounded-xl border-2 border-destructive/40 bg-destructive/10 p-3.5 space-y-1 text-foreground">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-destructive text-[11px]">
              <AlertOctagon className="size-4 shrink-0" />
              <span>BLACK-BOX PEDIATRIC CONTRAINDICATION (ASPIRIN &amp; PEPTO-BISMOL)</span>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              <strong>NEVER administer Aspirin (acetylsalicylic acid)</strong> or{" "}
              <strong>Pepto-Bismol (bismuth subsalicylate)</strong> to infants, children, or
              teenagers recovering from an insect sting, tick bite, or viral fever due to the risk
              of <strong>Reye&apos;s syndrome</strong> (a rare but frequently fatal condition
              causing acute brain swelling and liver failure).
            </p>
          </div>

          {/* AGE TIER SELECTOR */}
          <div className="rounded-2xl border border-border bg-muted/20 p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Baby className="size-4 text-primary" />
                Child&apos;s Age Group:
              </span>
              <span className="text-[10px] text-muted-foreground">Enforces FDA age minimums</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "under_6mo", label: "< 6 Months", sub: "Infant" },
                { id: "6_to_23mo", label: "6–23 Months", sub: "Toddler" },
                { id: "2_to_11yr", label: "2–11 Years", sub: "Child" },
                { id: "12_plus", label: "12+ Years", sub: "Adolescent" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => {
                    setAgeTier(tier.id as AgeTier);
                    if (tier.id === "under_6mo" && effectiveWeightKg > 8) {
                      setWeightValue(unit === "lbs" ? 13 : 6);
                    }
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    ageTier === tier.id
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/40"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="block text-xs font-semibold">{tier.label}</span>
                  <span className="text-[10px] text-muted-foreground block">{tier.sub}</span>
                </button>
              ))}
            </div>

            {isUnder6Mo && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-destructive space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Neonatal Sepsis Warning (&lt; 12 Weeks)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-foreground">
                  Fever &ge; 100.4&deg;F (38.0&deg;C) in an infant under 3 months is a medical
                  emergency. Do not self-treat with antipyretics without direct emergency physician
                  or pediatrician evaluation.
                </p>
              </div>
            )}
          </div>

          {/* WEIGHT BRACKET LOOKUP */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BookOpen className="size-4 text-primary" />
                Child&apos;s Body Weight (Packaging Lookup):
              </span>
              <div className="flex items-center gap-1 bg-card rounded-lg p-0.5 border border-border">
                <button
                  type="button"
                  onClick={() => {
                    if (unit !== "lbs") {
                      setUnit("lbs");
                      setWeightValue(Math.round(weightValue * 2.20462));
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    unit === "lbs"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pounds (lbs)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (unit !== "kg") {
                      setUnit("kg");
                      setWeightValue(Math.round(weightValue / 2.20462));
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    unit === "kg"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Kilograms (kg)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min={unit === "lbs" ? 11 : 5}
                max={unit === "lbs" ? 110 : 50}
                step={unit === "lbs" ? 1 : 0.5}
                value={weightValue}
                onChange={(e) => setWeightValue(parseFloat(e.target.value))}
                className="flex-1 accent-primary cursor-pointer"
              />
              <div className="flex items-baseline gap-1 bg-card px-3 py-1.5 rounded-xl border border-border font-mono font-bold text-sm min-w-24 justify-center">
                <span>{weightValue}</span>
                <span className="text-xs text-muted-foreground">{unit}</span>
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>
                Equivalent:{" "}
                {unit === "lbs"
                  ? `${effectiveWeightKg.toFixed(1)} kg`
                  : `${effectiveWeightLbs.toFixed(0)} lbs`}
              </span>
              <span>Weight Bracket: {effectiveWeightLbs.toFixed(0)} lbs</span>
            </div>
          </div>

          {/* OFFICIAL MANUFACTURER OTC PACKAGING REFERENCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Acetaminophen / Tylenol */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                  <Pill className="size-3.5 text-primary" />
                  Children&apos;s Acetaminophen (Tylenol)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">160 mg / 5 mL</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Standard FDA manufacturer packaging label reference.
              </p>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Package Label Dosing for {tylenolBracket.bracket}:
                </span>
                <p className="font-display text-lg font-black text-primary font-mono">
                  {tylenolBracket.dose}
                </p>
                <span className="text-[10px] text-primary font-medium block">
                  {tylenolBracket.note}
                </span>
              </div>
            </div>

            {/* Ibuprofen / Motrin */}
            {isUnder6Mo ? (
              <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-destructive/20 pb-1.5">
                  <span className="font-bold text-destructive text-xs uppercase flex items-center gap-1.5">
                    <AlertOctagon className="size-3.5 text-destructive" />
                    Children&apos;s Ibuprofen (Motrin) — LOCKED
                  </span>
                  <span className="text-[10px] font-bold text-destructive uppercase">
                    Contraindicated
                  </span>
                </div>
                <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-foreground space-y-1">
                  <p className="font-bold text-destructive text-[11px]">
                    DO NOT USE UNDER 6 MONTHS
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Infant kidneys under 6 months cannot excrete ibuprofen safely, creating risk of
                    acute renal toxicity. Consult your pediatrician.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                    <Pill className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Children&apos;s Ibuprofen (Motrin / Advil)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">100 mg / 5 mL</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Standard FDA manufacturer packaging label reference.
                </p>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Package Label Dosing for {motrinBracket.bracket}:
                  </span>
                  <p className="font-display text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {motrinBracket.dose}
                  </p>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block">
                    {motrinBracket.note}
                  </span>
                </div>
              </div>
            )}

            {/* Cetirizine / Zyrtec */}
            {isUnder2Yr ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-muted-foreground text-xs uppercase flex items-center gap-1.5">
                    <Pill className="size-3.5 text-muted-foreground" />
                    Cetirizine (Zyrtec) — LOCKED
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">Under 2 Years</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Cetirizine is not approved for OTC self-administration in children under 2 years.
                  Consult your pediatrician.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                    <Pill className="size-3.5 text-purple-600 dark:text-purple-400" />
                    Children&apos;s Cetirizine (Zyrtec)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">5 mg / 5 mL</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Non-sedating antihistamine packaging reference for allergic itch.
                </p>
                <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2.5 text-center space-y-0.5">
                  <p className="font-display text-sm font-bold text-purple-700 dark:text-purple-300 font-mono">
                    2 to 5 yrs: 2.5 mL (2.5 mg) once daily
                  </p>
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 font-mono">
                    6+ yrs: 5 mL to 10 mL (5–10 mg) once daily
                  </p>
                </div>
              </div>
            )}

            {/* Diphenhydramine / Benadryl */}
            {isUnder2Yr ? (
              <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                  <span className="font-bold text-amber-900 dark:text-amber-200 text-xs uppercase flex items-center gap-1.5">
                    <AlertOctagon className="size-3.5 text-amber-600" />
                    Diphenhydramine (Benadryl) — LOCKED
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                    &lt; 2 Years
                  </span>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-2.5 text-xs text-foreground space-y-1">
                  <p className="font-bold text-amber-800 dark:text-amber-200 text-[11px]">
                    CONTRAINDICATED UNDER 2 YEARS
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    FDA and AAP black-box guidelines strongly warn against OTC first-gen
                    antihistamines in toddlers under 2 due to risks of fatal respiratory depression
                    and severe CNS toxicity.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                    <Pill className="size-3.5 text-blue-600 dark:text-blue-400" />
                    Children&apos;s Diphenhydramine (Benadryl)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    12.5 mg / 5 mL
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Sedating antihistamine packaging reference for acute hives.
                </p>
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 text-center space-y-0.5">
                  <p className="font-display text-sm font-bold text-blue-700 dark:text-blue-300 font-mono">
                    2 to 5 yrs: Do not use unless directed by doctor
                  </p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 font-mono">
                    6 to 11 yrs: 5 mL to 10 mL (12.5–25 mg) every 4–6 hrs
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* MEASUREMENT SYRINGE SAFEGUARD */}
          <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Use Calibrated Oral Syringes Only</span>
            </div>
            <p className="leading-relaxed">
              Never use kitchen teaspoons or tablespoons to measure pediatric liquid medications.
              Household silverware spoons vary in volume from 2.5 mL to over 9 mL, resulting in
              dangerous under- or overdosing. Always use the calibrated oral syringe or dosing cup
              provided with the bottle.
            </p>
          </div>

          {/* POISON CONTROL EMERGENCY BAR */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                Questions About Child Dosing or Accidental Ingestion?
              </p>
              <p className="text-[11px] text-muted-foreground">
                Free, expert pediatric toxicologists and nurses available 24/7.
              </p>
            </div>
            <a
              href="tel:18002221222"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 shrink-0 self-start sm:self-auto"
            >
              <PhoneCall className="size-3.5" />
              <span>Call 1-800-222-1222</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/80 bg-muted/20 px-5 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Info className="size-3.5 text-primary shrink-0" />
            <span>
              Consult your pediatrician before administering any new medication to a child.
            </span>
          </div>
          <Button size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
