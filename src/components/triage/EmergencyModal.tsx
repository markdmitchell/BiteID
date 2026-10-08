import {
  AlertTriangle,
  PhoneCall,
  Droplets,
  Clock,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type EmergencyModalProps = {
  open: boolean;
  onDismiss: () => void;
  isBatExposure?: boolean;
  isSecondaryInfection?: boolean;
};

export function EmergencyModal({
  open,
  onDismiss,
  isBatExposure = false,
  isSecondaryInfection = false,
}: EmergencyModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-0 bg-destructive p-0 text-destructive-foreground sm:max-w-xl">
        <div className="p-6 sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive-foreground/15">
            <AlertTriangle className="size-6" />
          </div>

          <DialogTitle className="mt-5 font-display text-2xl font-bold leading-tight">
            {isBatExposure
              ? "Critical Medical Alert: Potential Rabies Exposure"
              : isSecondaryInfection
                ? "Urgent: Spreading Bacterial Infection Alert"
                : "Seek Emergency Care Immediately"}
          </DialogTitle>

          <DialogDescription className="mt-3 text-sm leading-relaxed text-destructive-foreground/90">
            {isBatExposure
              ? "You reported contact with a bat or wild mammal, or waking up in a space where a bat was present. Rabies is nearly 100% fatal once symptoms appear, but 100% preventable when Post-Exposure Prophylaxis (PEP) is administered promptly before symptoms start."
              : isSecondaryInfection
                ? "Spreading red streaks leading toward the heart (lymphangitis), expanding circumferential heat, or purulent drainage indicate secondary bacterial superinfection introduced via scratching. Seek immediate urgent care for prescription antibiotics."
                : "The symptom you selected can signal a life-threatening allergic reaction, anaphylaxis, or acute systemic envenomation. Do not wait for an app evaluation. Contact emergency services or proceed to the nearest emergency department right away."}
          </DialogDescription>

          {isBatExposure ? (
            <div className="mt-5 space-y-3">
              {/* Immediate 15-Minute Wash Protocol */}
              <div className="rounded-xl border border-destructive-foreground/20 bg-destructive-foreground/10 p-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Droplets className="size-4 shrink-0 text-amber-200" />
                  <span>Immediate Action: 15-Minute Soap & Water Wash</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-destructive-foreground/85">
                  Immediately wash the suspected contact area thoroughly with soap and copious
                  running warm water for at least 15 continuous minutes. According to the CDC and
                  WHO, this mechanical action inactivates and removes &gt;90% of rabies virus
                  particles at the wound site.
                </p>
              </div>

              {/* The Invisible Bat Bite Warning */}
              <div className="rounded-xl border border-destructive-foreground/20 bg-destructive-foreground/10 p-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <HelpCircle className="size-4 shrink-0 text-amber-200" />
                  <span>The "Invisible" Bat Bite Warning</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-destructive-foreground/85">
                  Bat teeth are razor-fine and microscopic. Punctures often bleed minimally or not
                  at all and can be completely painless or invisible. If you woke up in a room,
                  cabin, or tent with a bat, CDC guidelines classify this as a high-risk exposure
                  even if you feel no bite.
                </p>
              </div>

              {/* Post-Exposure Prophylaxis (PEP) Protocol */}
              <div className="rounded-xl border border-destructive-foreground/20 bg-destructive-foreground/10 p-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Clock className="size-4 shrink-0 text-amber-200" />
                  <span>Post-Exposure Prophylaxis (PEP) Timeline</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-destructive-foreground/85">
                  Proceed to an Emergency Department immediately. Rabies PEP consists of Human
                  Rabies Immune Globulin (HRIG) injected at the site on Day 0 plus a 4-dose rabies
                  vaccine series (Days 0, 3, 7, and 14). It is virtually 100% effective when started
                  before symptoms.
                </p>
              </div>

              {/* Specimen Safety */}
              <div className="rounded-xl border border-destructive-foreground/20 bg-destructive-foreground/10 p-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldAlert className="size-4 shrink-0 text-amber-200" />
                  <span>Specimen Quarantine Safety</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-destructive-foreground/85">
                  If the animal or bat is captured, DO NOT damage its head or brain, as public
                  health authorities need intact brain tissue to test for rabies. Never touch the
                  animal with bare hands. Call animal control or public health to collect it.
                </p>
              </div>

              {/* Emergency Click to Call Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <a
                  href="tel:911"
                  className="flex items-center justify-center gap-2 rounded-xl bg-destructive-foreground px-4 py-3 text-sm font-bold text-destructive shadow transition hover:bg-destructive-foreground/90"
                >
                  <PhoneCall className="size-4" />
                  <span>Call 911 Emergency</span>
                </a>
                <a
                  href="tel:18002221222"
                  className="flex items-center justify-center gap-2 rounded-xl border border-destructive-foreground/30 bg-destructive-foreground/15 px-4 py-3 text-sm font-bold text-destructive-foreground transition hover:bg-destructive-foreground/25"
                >
                  <PhoneCall className="size-4" />
                  <span>Poison Help (1-800-222-1222)</span>
                </a>
              </div>

              <div className="text-center pt-1">
                <a
                  href="https://www.cdc.gov/rabies/exposure/index.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-destructive-foreground/80 underline hover:text-destructive-foreground"
                >
                  <span>Read Official CDC Rabies Exposure Guidelines</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-destructive-foreground/10 px-4 py-3 text-sm font-medium">
              <PhoneCall className="size-4 shrink-0" />
              <span>
                {isSecondaryInfection
                  ? "Contact your primary physician, urgent care clinic, or call 911 immediately."
                  : "Call emergency services (911) or have someone take you to the ER right away."}
              </span>
            </div>
          )}

          <Button
            type="button"
            onClick={onDismiss}
            className="mt-6 w-full bg-destructive-foreground/20 text-destructive-foreground border border-destructive-foreground/40 hover:bg-destructive-foreground/30 font-medium"
          >
            Close alert: I understand these life-critical instructions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
