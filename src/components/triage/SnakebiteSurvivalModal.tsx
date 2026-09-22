import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Clock,
  PhoneCall,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Radio,
  XCircle,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  Activity,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { creatureReferenceOf } from "@/lib/creature-images";

type SnakebiteSurvivalModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SwellingLog = {
  id: string;
  time: string;
  location: string;
};

// Simple web audio beep for the 15-min timer alert (works 100% offline without assets)
function playTimerAlertBeep() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio context may be restricted by browser policy before interaction
  }
}

export function SnakebiteSurvivalModal({ open, onOpenChange }: SnakebiteSurvivalModalProps) {
  const [activeTab, setActiveTab] = useState<"action" | "tracker" | "myths" | "id">("action");

  // 15-Minute Countdown Timer State
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Swelling logs
  const [logs, setLogs] = useState<SwellingLog[]>([
    {
      id: "1",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      location: "Initial bite baseline (marked with pen)",
    },
  ]);
  const [newLogLocation, setNewLogLocation] = useState("");

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            playTimerAlertBeep();
            if ("vibrate" in navigator) {
              navigator.vibrate([300, 200, 300]);
            }
            return 15 * 60; // Auto-loop 15 min intervals
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function handleAddLog() {
    if (!newLogLocation.trim()) return;
    const newEntry: SwellingLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      location: newLogLocation.trim(),
    };
    setLogs((prev) => [newEntry, ...prev]);
    setNewLogLocation("");
  }

  function handleDeleteLog(id: string) {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0 sm:max-w-3xl">
        {/* Urgent Header */}
        <div className="bg-destructive px-6 py-5 text-destructive-foreground">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <ShieldAlert className="size-6 text-white" />
              </span>
              <div>
                <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  Immediate Survival Protocol
                </span>
                <DialogTitle className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Snakebite Emergency Fast-Track
                </DialogTitle>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/90 sm:text-sm">
            Do not waste time taking questionnaires. Follow these immediate survival actions, stay
            calm, and coordinate medical transport.
          </p>

          {/* Quick SOS Dialers */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <a
              href="tel:911"
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-destructive shadow-sm transition hover:bg-white/90"
            >
              <PhoneCall className="size-4 shrink-0" />
              <span>Call 911 (Emergency)</span>
            </a>
            <a
              href="tel:18002221222"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/20"
            >
              <PhoneCall className="size-4 shrink-0" />
              <span>Poison Control: 1-800-222-1222</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="p-5 sm:p-6">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as typeof activeTab)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-muted/60 text-xs">
              <TabsTrigger value="action" className="font-semibold">
                First 3 Mins
              </TabsTrigger>
              <TabsTrigger value="tracker" className="font-semibold">
                15-Min Tracker
              </TabsTrigger>
              <TabsTrigger value="myths" className="font-semibold">
                Deadly Myths
              </TabsTrigger>
              <TabsTrigger value="id" className="font-semibold">
                Snake ID
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: FIRST 3 MINUTES */}
            <TabsContent value="action" className="mt-5 space-y-4">
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-destructive">
                  <Clock className="size-5 shrink-0" />
                  Immediate Physical Checklist (Do Right Now)
                </h3>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-bold text-destructive">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Remove all rings, watches, jewelry, tight boots & clothes NOW
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Pit viper venom triggers rapid, massive swelling (edema). Rings or tight
                        boots left on will cut off arterial blood supply and cause ischemic loss of
                        fingers or toes within hours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-bold text-destructive">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Sit down, stay motionless, and keep calm
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <strong className="text-foreground">Do not walk or run.</strong> Muscle
                        contraction pumps venom through the lymphatic vessels into the central
                        circulation. If in the backcountry, have companions carry you if possible.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-bold text-destructive">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Position limb at neutral heart level
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Do not hang the arm/leg down (causes extreme pooling and hydrostatic
                        swelling), and do not elevate it high above the heart (drives venom toward
                        the thoracic organs). Rest it horizontally at heart level.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-bold text-destructive">
                      4
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Draw a pen line around the swelling & write the time
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Use a pen, sharpie, or marker to trace the leading edge of swelling. Switch
                        to the{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("tracker")}
                          className="font-bold text-primary underline"
                        >
                          15-Min Tracker tab
                        </button>{" "}
                        to time your markings for the emergency physician.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wilderness Satellite SOS Box */}
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex items-start gap-3">
                  <Radio className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-foreground">No Cell Service in Backcountry?</p>
                    <p className="text-muted-foreground">
                      Use Apple Emergency SOS via Satellite (Power + Volume buttons on iPhone 14+)
                      or Garmin inReach / SPOT SOS button. Report:{" "}
                      <em>
                        &quot;Snakebite, suspected pit viper envenomation, GPS coordinates,
                        requesting urgent evacuation to antivenom-equipped trauma facility.&quot;
                      </em>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: 15-MINUTE EDEMA PROGRESSION TRACKER */}
            <TabsContent value="tracker" className="mt-5 space-y-4">
              <div className="rounded-2xl border-2 border-primary/40 bg-card p-5 shadow-xs">
                <div className="flex flex-col items-center text-center">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    Doctor&apos;s #1 Metric for Antivenom
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold text-foreground">
                    15-Minute Swelling Progression Timer
                  </h3>
                  <p className="mt-1 max-w-md text-xs text-muted-foreground">
                    Hospital physicians calculate your antivenom dose (CroFab / Anavip) based on how
                    many centimeters swelling advances every 15 minutes.
                  </p>

                  {/* Countdown Clock */}
                  <div className="mt-5 flex items-baseline justify-center gap-1 rounded-2xl border border-primary/20 bg-muted/50 px-8 py-4 font-mono text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">
                    <span>{formatTime(secondsRemaining)}</span>
                  </div>

                  {/* Timer Controls */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      onClick={() => setIsTimerRunning((r) => !r)}
                      variant={isTimerRunning ? "secondary" : "default"}
                      className="gap-2 font-semibold"
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="size-4" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="size-4" /> Start 15-Min Timer
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setSecondsRemaining(15 * 60);
                      }}
                      title="Reset Timer"
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Log entries */}
                <div className="mt-6 border-t border-border pt-5">
                  <h4 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                    <Activity className="size-4 text-primary" />
                    Swelling & Landmark Log
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Mark the skin with a pen, then note the landmark below (e.g. &quot;At ankle
                    bone&quot;, &quot;2 inches above ankle&quot;):
                  </p>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 2 inches above ankle joint..."
                      value={newLogLocation}
                      onChange={(e) => setNewLogLocation(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddLog()}
                      className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                    <Button size="sm" onClick={handleAddLog} className="gap-1 text-xs">
                      <Plus className="size-3.5" /> Log Mark
                    </Button>
                  </div>

                  <div className="mt-3 divide-y divide-border/60 rounded-xl border border-border bg-background">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-primary">{log.time}</span>
                          <span className="font-medium text-foreground">{log.location}</span>
                        </div>
                        {logs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-muted-foreground transition hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: DEADLY MYTHS (HARM REDUCTION) */}
            <TabsContent value="myths" className="mt-5 space-y-4">
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-5 shrink-0" />
                  <h3 className="font-display text-base font-bold">
                    The 5 Deadly Folklore Myths (Never Do These)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-destructive/90">
                  Folklore remedies from movies and old field guides kill tissue and cause severe
                  disability. Hospital toxicology data shows that improper first aid causes more
                  limb amputations than the venom itself.
                </p>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="rounded-xl border border-destructive/20 bg-card p-3.5">
                    <p className="flex items-center gap-1.5 font-bold text-destructive">
                      <XCircle className="size-4 shrink-0" />
                      1. DO NOT apply a tourniquet or tight constriction band
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Pit viper venom is cytolytic and tissue-destroying. Trapping the venom in one
                      small area causes irreversible gangrene, compartment syndrome, and amputation.
                    </p>
                  </div>

                  <div className="rounded-xl border border-destructive/20 bg-card p-3.5">
                    <p className="flex items-center gap-1.5 font-bold text-destructive">
                      <XCircle className="size-4 shrink-0" />
                      2. DO NOT cut, slash, or incise the bite marks
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Pit viper venoms destroy platelets and fibrinogen, stopping blood clotting.
                      Cutting the skin causes uncontrollable arterial hemorrhage, severed tendons,
                      and infection without removing venom.
                    </p>
                  </div>

                  <div className="rounded-xl border border-destructive/20 bg-card p-3.5">
                    <p className="flex items-center gap-1.5 font-bold text-destructive">
                      <XCircle className="size-4 shrink-0" />
                      3. DO NOT use suction pumps, venom extractors, or your mouth
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Rigorous peer-reviewed medical trials show commercial suction pumps remove
                      &lt;0.05% of venom while creating localized mechanical vacuum damage that
                      accelerates bullae and skin sloughing.
                    </p>
                  </div>

                  <div className="rounded-xl border border-destructive/20 bg-card p-3.5">
                    <p className="flex items-center gap-1.5 font-bold text-destructive">
                      <XCircle className="size-4 shrink-0" />
                      4. DO NOT apply ice or submerge in ice water
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Cold causes intense vasoconstriction, compounding tissue ischemia and
                      resulting in severe cryo-gangrene.
                    </p>
                  </div>

                  <div className="rounded-xl border border-destructive/20 bg-card p-3.5">
                    <p className="flex items-center gap-1.5 font-bold text-destructive">
                      <XCircle className="size-4 shrink-0" />
                      5. DO NOT attempt to catch, harass, or decapitate the snake
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Decapitated snake heads have reflexive biting mechanisms that remain lethal
                      for over an hour after decapitation. Emergency doctors do not need the
                      physical carcass—they identify venom syndromes clinically.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: QUICK SNAKE IDENTIFIER & DRY BITES */}
            <TabsContent value="id" className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                    <img
                      src={creatureReferenceOf("pit_viper")?.src}
                      alt={creatureReferenceOf("pit_viper")?.alt ?? "Pit Viper"}
                      className="size-full object-cover"
                    />
                    <span className="absolute top-2 left-2 rounded-md bg-destructive/90 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive-foreground">
                      Venomous (Pit Viper)
                    </span>
                  </div>
                  <h4 className="mt-3 font-display text-sm font-bold text-foreground">
                    Pit Viper Characteristics (Crotalinae)
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                      <span>
                        <strong>Triangular, spade-shaped head</strong> distinctly wider than neck.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                      <span>
                        <strong>Heat-sensing pits</strong> between nostril and eye.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                      <span>
                        <strong>Elliptical (cat-like) vertical pupils</strong> in bright light.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                      <span>
                        <strong>Twin fang punctures</strong> with severe immediate burning & edema.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/60 text-center p-4">
                    <div>
                      <HelpCircle className="mx-auto size-8 text-muted-foreground/60" />
                      <p className="mt-1 font-semibold text-xs text-foreground">
                        Harmless Colubrid Scrape
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        U-shaped horseshoe scrape without twin fangs
                      </p>
                    </div>
                  </div>
                  <h4 className="mt-3 font-display text-sm font-bold text-foreground">
                    Non-Venomous Snake Patterns
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>
                        <strong>Round pupils</strong> and slender head flush with body.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>
                        <strong>Horseshoe rows</strong> of small superficial teeth pricks.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>
                        <strong>No progressive swelling</strong> or severe burning discoloration.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Dry Bite Caution */}
              <div className="rounded-xl border border-amber-600/30 bg-amber-500/10 p-4 text-xs text-amber-950 dark:text-amber-200">
                <p className="font-bold">Important: What about &quot;Dry Bites&quot;?</p>
                <p className="mt-1 leading-relaxed">
                  Approximately 20–25% of pit viper defensive strikes are &quot;dry&quot; (meaning
                  fangs punctured but no venom was discharged). However,{" "}
                  <strong>you must treat all bites as fully envenomed</strong> until monitored in a
                  hospital for at least 8 hours with repeat blood coagulation panels (PT/INR,
                  fibrinogen, platelets).
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Close Survival Guide
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
