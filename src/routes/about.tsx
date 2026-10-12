import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  HeartPulse,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  WifiOff,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/navigation/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BiteID | Clinical Rationale & Mission" },
      {
        name: "description",
        content:
          "Discover BiteID's clinical mission: evidence-based outdoor bite & sting triage, Fitzpatrick tone calibration, and zero-connectivity backcountry safety.",
      },
      { property: "og:title", content: "About BiteID | Clinical Rationale & Mission" },
      { property: "og:description", content: "Discover BiteID's clinical mission: evidence-based outdoor bite & sting triage, Fitzpatrick tone calibration, and zero-connectivity backcountry safety." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PageHeader activePage="about" />

      <main className="mx-auto max-w-4xl px-5 py-12">
        {/* Hero Section */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Outdoor Health & Wilderness Medicine</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Triage When Minutes Count,
            <br />
            <span className="text-primary">Especially Where Cell Towers End.</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            BiteID was created to solve a persistent, dangerous gap in outdoor first aid: when
            someone is bitten or stung on a trail, in a park, or in their backyard, they face panic,
            conflicting internet advice, and dangerous folklore remedies. BiteID delivers rapid,
            tone-aware clinical protocols designed to protect life and limb.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Pillar 1: Myth Busting */}
          <div className="rounded-2xl border border-destructive/25 bg-card p-6 shadow-xs space-y-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-5" />
            </span>
            <h3 className="font-display text-lg font-bold">Defeating Deadly Folklore</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Movies and outdated field guides have taught generations to make dangerous mistakes:
              applying tourniquets to snakebites, burning embedded ticks with matches, smothering
              ticks in petroleum jelly, or pinching bee stingers. BiteID replaces panic-driven
              folklore with current toxicology and CDC evidence-based protocols.
            </p>
          </div>

          {/* Pillar 2: Skin Tone Calibration */}
          <div className="rounded-2xl border border-primary/25 bg-card p-6 shadow-xs space-y-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Palette className="size-5" />
            </span>
            <h3 className="font-display text-lg font-bold">Fitzpatrick Multi-Tone Calibration</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Dermatological reference images historically over-represent light skin (Types I–II),
              where erythema appears bright red or pink. On deeper skin tones (Types IV–VI), insect
              and arachnid envenomations frequently present as violaceous duskiness,
              post-inflammatory hyperpigmentation, or subtle induration. BiteID provides authentic
              comparison photos across all six phototypes.
            </p>
          </div>

          {/* Pillar 3: Zero-Connectivity PWA */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
              <WifiOff className="size-5 text-primary" />
            </span>
            <h3 className="font-display text-lg font-bold">Zero-Cell-Service Architecture</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Most venomous snakebites, scorpion stings, and tick attachments occur deep in
              wilderness areas with zero cellular bars. BiteID uses advanced Progressive Web App
              (PWA) service workers to pre-cache the 39-species visual atlas, emergency first-aid
              protocols, and offline intake queues so you are never left without guidance.
            </p>
          </div>

          {/* Pillar 4: The 15-Minute Rule */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
              <HeartPulse className="size-5 text-destructive" />
            </span>
            <h3 className="font-display text-lg font-bold">The 15-Minute Swelling Rule</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Emergency room physicians calculate antivenom doses (CroFab / Anavip) based on how
              quickly edema advances along a limb. BiteID features an integrated 15-minute countdown
              clock and landmark logger, allowing victims or bystanders to track the leading edge of
              swelling to hand directly to the trauma team.
            </p>
          </div>
        </div>

        {/* 20-Species Vector Coverage Section */}
        <div className="mt-14 rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Our 20-Species Clinical Coverage
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            BiteID encompasses the major venomous envenomations, tick-borne pathogens, stings, and
            blistering insects found across North America:
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-medium">
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-destructive font-bold">High Hazard</p>
              <ul className="mt-1.5 space-y-1 text-muted-foreground text-[11px]">
                <li>• Pit Viper (Rattlesnake, Copperhead, Cottonmouth)</li>
                <li>• Arizona Bark Scorpion</li>
                <li>• Black Widow Spider</li>
                <li>• Brown Recluse Spider</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-amber-600 dark:text-amber-400 font-bold">Disease Vectors</p>
              <ul className="mt-1.5 space-y-1 text-muted-foreground text-[11px]">
                <li>• Blacklegged Deer Tick</li>
                <li>• Lone Star Tick</li>
                <li>• American Dog Tick</li>
                <li>• Kissing Bug (Chagas)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-orange-600 dark:text-orange-400 font-bold">Stings & Allergens</p>
              <ul className="mt-1.5 space-y-1 text-muted-foreground text-[11px]">
                <li>• Yellow Jacket / Wasp</li>
                <li>• Honey Bee</li>
                <li>• Red Imported Fire Ant</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-primary font-bold">Biting & Blistering</p>
              <ul className="mt-1.5 space-y-1 text-muted-foreground text-[11px]">
                <li>• Striped Blister Beetle</li>
                <li>• Mosquito, No-See-Um</li>
                <li>• Horse Fly, Black Fly</li>
                <li>• Flea, Bed Bug, Chigger, Lice</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Alpha Disclaimer Callout */}
        <div className="mt-12 rounded-2xl border border-caution/30 bg-caution/10 p-6 text-xs text-caution-foreground leading-relaxed">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 shrink-0 text-caution-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Important Alpha Testing Disclaimer</p>
              <p>
                BiteID is an active experimental prototype developed for technical demonstration and
                research purposes only. It is not approved by the U.S. Food and Drug Administration
                (FDA) or any medical regulatory authority as a diagnostic device. It does not
                replace professional medical judgment, diagnostic laboratory work, or emergency
                medical services (EMS). Always consult a licensed clinician for medical concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-semibold text-sm text-primary hover:underline"
          >
            <Stethoscope className="size-4" />
            <span>Launch Bite & Rash Intake</span>
            <ArrowRight className="size-4" />
          </Link>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-foreground">
              Contact Team
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
