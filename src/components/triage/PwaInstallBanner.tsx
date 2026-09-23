import { useState, useEffect } from "react";
import { Download, Smartphone, X, ShieldCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Check if user dismissed recently (in last 7 days)
      const lastDismissed = localStorage.getItem("biteid_pwa_banner_dismissed");
      if (lastDismissed && Date.now() - Number(lastDismissed) < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }

      // Detect iOS Safari
      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua);
      const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
      setIsIos(isIosDevice && isSafari);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
    return undefined;
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("biteid_pwa_banner_dismissed", Date.now().toString());
  };

  if (isStandalone || dismissed || (!deferredPrompt && !isIos)) {
    return null;
  }

  return (
    <aside aria-label="Install BiteID Application" className="mx-auto max-w-3xl px-5 pt-3 no-print">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3.5 sm:p-4 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
            <Smartphone className="size-5" />
          </span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">
                Install BiteID for 100% Offline Wilderness Access
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                <ShieldCheck className="size-3" />
                Zero-Cell Ready
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Add to your phone home screen to access the 32-species field kit, snakebite timers,
              and protocols on trails without cellular coverage.
            </p>
            {isIos && (
              <p className="text-[11px] text-primary font-medium flex items-center gap-1 pt-0.5">
                <Share2 className="size-3" />
                <span>On iPhone: Tap Share, then &quot;Add to Home Screen&quot;</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {deferredPrompt && (
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Download className="size-3.5" />
              <span>Install App</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="size-7 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Dismiss banner"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
