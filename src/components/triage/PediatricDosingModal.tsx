import { useState, useMemo } from "react";
import {
  Baby,
  X,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Pill,
  Calculator,
  Info,
  PhoneCall,
  ShieldAlert,
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

  // Precision Weight-Based Calculations
  // Acetaminophen (160 mg / 5 mL = 32 mg/mL) -> 10 to 15 mg/kg per dose (Max single pediatric dose: 650 mg)
  const tylenolMinMg = Math.min(650, Math.round(effectiveWeightKg * 10));
  const tylenolMaxMg = Math.min(650, Math.round(effectiveWeightKg * 15));
  const tylenolMinMl = (tylenolMinMg / 32).toFixed(1);
  const tylenolMaxMl = (tylenolMaxMg / 32).toFixed(1);

  // Ibuprofen (100 mg / 5 mL = 20 mg/mL) -> 10 mg/kg per dose (only >= 6 months, Max single pediatric dose: 400 mg)
  const motrinMg = Math.min(400, Math.round(effectiveWeightKg * 10));
  const motrinMl = (motrinMg / 20).toFixed(1);

  // Cetirizine (5 mg / 5 mL = 1 mg/mL)
  const cetirizineDose = useMemo(() => {
    if (isUnder2Yr) return null;
    if (effectiveWeightKg < 10) return { mg: 2.5, ml: 2.5, frequency: "once daily" };
    if (effectiveWeightKg < 18) return { mg: 2.5, ml: 2.5, frequency: "once daily" };
    return {
      mg: 5,
      ml: 5.0,
      frequency: "once daily (may increase to 10 mL under physician advice)",
    };
  }, [effectiveWeightKg, isUnder2Yr]);

  // Diphenhydramine (12.5 mg / 5 mL = 2.5 mg/mL) -> 1.0 - 1.25 mg/kg
  const benadrylMg = Math.min(50, Math.round(effectiveWeightKg * 1.1));
  const benadrylMl = (benadrylMg / 2.5).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card rounded-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">
          Pediatric Precision Weight-Based Dosing Engine
        </DialogTitle>

        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-card/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Calculator className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Pediatric Weight-Based Dosing Engine
              </h2>
              <p className="text-xs text-muted-foreground">
                Precision clinical weight calculations with FDA black-box contraindication gates.
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
                Child&apos;s Biological Age Group:
              </span>
              <span className="text-[10px] text-muted-foreground">
                Enforces renal &amp; CNS safety locks
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "under_6mo", label: "< 6 Months", sub: "Infant (Renal Gate)" },
                { id: "6_to_23mo", label: "6–23 Months", sub: "Toddler (CNS Gate)" },
                { id: "2_to_11yr", label: "2–11 Years", sub: "Young Child" },
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
                  emergency requiring immediate pediatric blood culture and lumbar puncture
                  rule-out. Do not treat at home.
                </p>
              </div>
            )}
          </div>

          {/* WEIGHT SLIDER CONTROL */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calculator className="size-4 text-primary" />
                Child&apos;s Measured Body Weight:
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
                Calculated Metric Weight: {effectiveWeightKg.toFixed(1)} kg (
                {effectiveWeightLbs.toFixed(0)} lbs)
              </span>
              <span>
                Pediatric Target Bracket: ~
                {Math.min(12, Math.max(0.5, effectiveWeightKg / 3.5)).toFixed(0)} years
              </span>
            </div>
          </div>

          {/* PRECISION WEIGHT-BASED DOSAGES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Acetaminophen / Tylenol */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                  <Pill className="size-3.5 text-primary" />
                  Acetaminophen (Tylenol)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  160 mg / 5 mL (32 mg/mL)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Clinical standard: <strong>10–15 mg/kg</strong> every 4–6 hours (Max 5 doses / 24
                hrs).
              </p>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Calculated Single Oral Dose:
                </span>
                <p className="font-display text-2xl font-black text-primary font-mono tracking-tight">
                  {tylenolMinMl} – {tylenolMaxMl} mL
                </p>
                <span className="text-xs font-semibold text-primary block font-mono">
                  {tylenolMinMg} – {tylenolMaxMg} mg
                </span>
              </div>
            </div>

            {/* Ibuprofen / Motrin */}
            {isUnder6Mo ? (
              <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-destructive/20 pb-1.5">
                  <span className="font-bold text-destructive text-xs uppercase flex items-center gap-1.5">
                    <AlertOctagon className="size-3.5 text-destructive" />
                    Ibuprofen (Motrin) — LOCKED
                  </span>
                  <span className="text-[10px] font-bold text-destructive uppercase">
                    Contraindicated
                  </span>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 text-xs text-foreground space-y-1">
                  <p className="font-bold text-destructive text-xs">
                    DO NOT ADMINISTER UNDER 6 MONTHS
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Infant kidneys under 6 months have immature glomerular filtration and cannot
                    excrete ibuprofen safely, risking acute renal toxicity. Use Acetaminophen under
                    physician guidance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                    <Pill className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Ibuprofen (Motrin / Advil)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    100 mg / 5 mL (20 mg/mL)
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Clinical standard: <strong>10 mg/kg</strong> every 6–8 hours (Max 4 doses / 24
                  hrs).
                </p>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Calculated Single Oral Dose:
                  </span>
                  <p className="font-display text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight">
                    {motrinMl} mL
                  </p>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block font-mono">
                    {motrinMg} mg
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
                  Cetirizine is not approved for OTC self-administration in children under 2 years
                  without direct pediatrician guidance.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                    <Pill className="size-3.5 text-purple-600 dark:text-purple-400" />
                    Cetirizine (Zyrtec)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    5 mg / 5 mL (1 mg/mL)
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Non-sedating 2nd-gen H1 antihistamine for localized swelling and histamine itch.
                </p>
                <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2.5 text-center space-y-0.5">
                  <p className="font-display text-lg font-bold text-purple-700 dark:text-purple-300 font-mono">
                    {cetirizineDose?.ml} mL ({cetirizineDose?.mg} mg)
                  </p>
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 font-mono">
                    {cetirizineDose?.frequency}
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
                    Diphenhydramine — LOCKED
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
                    FDA and AAP black-box guidelines warn against OTC first-gen antihistamines in
                    toddlers under 2 due to risks of fatal respiratory depression and paradoxical
                    CNS excitation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                    <Pill className="size-3.5 text-blue-600 dark:text-blue-400" />
                    Diphenhydramine (Benadryl)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    12.5 mg / 5 mL (2.5 mg/mL)
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Clinical standard: <strong>1.0–1.25 mg/kg</strong> every 6 hours for acute
                  allergic wheals.
                </p>
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 text-center space-y-0.5">
                  <p className="font-display text-lg font-bold text-blue-700 dark:text-blue-300 font-mono">
                    {benadrylMl} mL ({benadrylMg} mg)
                  </p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 font-mono">
                    Every 6 hours as needed
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
              Never use kitchen silverware teaspoons or tablespoons to measure pediatric liquid
              medications. Household spoons vary from 2.5 mL to over 9 mL, causing severe accidental
              overdosing. Always measure oral liquid with the calibrated oral syringe provided with
              the medication bottle.
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
            <ShieldAlert className="size-3.5 text-primary shrink-0" />
            <span>Confirm exact child dosing with your pediatrician or pharmacist.</span>
          </div>
          <Button size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
