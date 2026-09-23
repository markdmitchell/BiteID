import { useState } from "react";
import { Wifi, ArrowRight, X, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineStatus, StashedIntake } from "@/lib/offline-manager";

type ReconnectionSyncBannerProps = {
  onSyncIntake?: (intake: StashedIntake) => void;
};

export function ReconnectionSyncBanner({ onSyncIntake }: ReconnectionSyncBannerProps) {
  const { isOffline, queuedIntakes, refreshQueue } = useOfflineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOffline || queuedIntakes.length === 0 || dismissed) {
    return null;
  }

  const newestIntake = queuedIntakes[0];

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-primary text-primary-foreground px-4 py-2.5 shadow-md animate-in slide-in-from-top duration-300"
    >
      <div className="mx-auto max-w-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground">
            <Wifi className="size-3.5" />
          </span>
          <div>
            <p className="font-semibold">
              You&apos;re back online! ({queuedIntakes.length} Backcountry intake waiting)
            </p>
            <p className="text-[11px] opacity-90">
              Saved offline on {newestIntake.timestamp} ({newestIntake.usState}). Ready for full AI
              vision analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onSyncIntake && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                onSyncIntake(newestIntake);
                refreshQueue();
              }}
              className="h-7 px-3 text-xs font-bold gap-1 text-primary shadow-xs"
            >
              <CloudUpload className="size-3.5" />
              <span>Submit Queued Intake</span>
              <ArrowRight className="size-3" />
            </Button>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="rounded p-1 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
