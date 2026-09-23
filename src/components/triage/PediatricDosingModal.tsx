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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type PediatricDosingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialWeightKg?: number;
};

export function PediatricDosingModal({
  open,
  onOpenChange,
  initialWeightKg = 14,
}: PediatricDosingModalProps) {
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

  // Acetaminophen (160 mg / 5 mL) -> 32 mg/mL
  // Clinical dosing: 10 - 15 mg/kg
  const tylenolMinMg = Math.round(effectiveWeightKg * 10);
  const tylenolMaxMg = Math.round(effectiveWeightKg * 15);
  const tylenolMinMl = (tylenolMinMg / 32).toFixed(1);
  const tylenolMaxMl = (tylenolMaxMg / 32).toFixed(1);

  // Ibuprofen (100 mg / 5 mL) -> 20 mg/mL
  // Clinical dosing: 10 mg/kg
  const motrinMg = Math.round(effectiveWeightKg * 10);
  const motrinMl = (motrinMg / 20).toFixed(1);

  // Cetirizine (5 mg / 5 mL) -> 1 mg/mL
  const cetirizineDose =
    effectiveWeightKg < 10
      ? { mg: 2.5, ml: 2.5, label: "6 to 23 months (once daily)" }
      : effectiveWeightKg < 18
        ? { mg: 2.5, ml: 2.5, label: "2 to 5 years (once daily)" }
        : { mg: 5, ml: 5, label: "6+ years (once daily)" };

  // Diphenhydramine (12.5 mg / 5 mL) -> 2.5 mg/mL
  // Clinical dosing: 1 - 1.25 mg/kg
  const benadrylMg = Math.min(50, Math.round(effectiveWeightKg * 1.1));
  const benadrylMl = (benadrylMg / 2.5).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card rounded-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">
          Pediatric Weight-Based Medication & First Aid Dosing Calculator
        </DialogTitle>

        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-card/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Calculator className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Pediatric Weight-Based Dosing Calculator
              </h2>
              <p className="text-xs text-muted-foreground">
                Weight-adjusted OTC pain, fever & antihistamine oral volumes.
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
              <span>BLACK-BOX PEDIATRIC CONTRAINDICATION (ASPIRIN & PEPTO-BISMOL)</span>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              <strong>NEVER administer Aspirin (acetylsalicylic acid)</strong> or{" "}
              <strong>Pepto-Bismol (bismuth subsalicylate)</strong> to infants, children, or
              teenagers recovering from an insect sting, tick bite, or viral fever due to the risk
              of <strong>Reye&apos;s syndrome</strong> (a rare but frequently fatal condition
              causing acute brain swelling and liver failure).
            </p>
          </div>

          {/* WEIGHT SELECTOR CONTROL */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Baby className="size-4 text-primary" />
                Child&apos;s Body Weight:
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
              <span>
                Typical Age: ~{Math.min(12, Math.max(1, Math.round(effectiveWeightKg / 3.5)))} yrs
              </span>
            </div>
          </div>

          {/* CALCULATED MEDICATION DOSAGES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Acetaminophen / Tylenol */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                  <Pill className="size-3.5 text-primary" />
                  Acetaminophen (Tylenol)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">160 mg / 5 mL</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dosing: <strong>10–15 mg/kg</strong> every 4–6 hours (Max 5 doses per 24 hours).
              </p>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5 text-center space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Recommended Single Oral Dose:
                </span>
                <p className="font-display text-lg font-black text-primary font-mono">
                  {tylenolMinMl} – {tylenolMaxMl} mL
                </p>
                <span className="text-[10px] text-primary font-medium block">
                  ({tylenolMinMg} – {tylenolMaxMg} mg)
                </span>
              </div>
            </div>

            {/* Ibuprofen / Motrin */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                  <Pill className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Ibuprofen (Motrin / Advil)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">100 mg / 5 mL</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dosing: <strong>10 mg/kg</strong> every 6–8 hours.{" "}
                <em>Only for infants &gt; 6 months.</em>
              </p>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Recommended Single Oral Dose:
                </span>
                <p className="font-display text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {motrinMl} mL
                </p>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block">
                  ({motrinMg} mg)
                </span>
              </div>
            </div>

            {/* Cetirizine / Zyrtec */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                  <Pill className="size-3.5 text-purple-600 dark:text-purple-400" />
                  Cetirizine (Zyrtec)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">5 mg / 5 mL</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Non-sedating 2nd-gen antihistamine for localized itch & wheals (
                {cetirizineDose.label}).
              </p>
              <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2 text-center">
                <p className="font-display text-base font-bold text-purple-700 dark:text-purple-300 font-mono">
                  {cetirizineDose.ml} mL ({cetirizineDose.mg} mg) once daily
                </p>
              </div>
            </div>

            {/* Diphenhydramine / Benadryl */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                  <Pill className="size-3.5 text-blue-600 dark:text-blue-400" />
                  Diphenhydramine (Benadryl)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">12.5 mg / 5 mL</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sedating 1st-gen antihistamine for acute stings/hives (1–1.25 mg/kg every 6 hours).
              </p>
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 text-center">
                <p className="font-display text-base font-bold text-blue-700 dark:text-blue-300 font-mono">
                  {benadrylMl} mL ({benadrylMg} mg)
                </p>
              </div>
            </div>
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
              provided by your pharmacy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/80 bg-muted/20 px-5 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Info className="size-3.5 text-primary shrink-0" />
            <span>Consult your pediatrician for children under 2 months or acute emergencies.</span>
          </div>
          <Button size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
