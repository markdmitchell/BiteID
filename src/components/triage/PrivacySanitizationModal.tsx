import { useState, useEffect } from "react";
import { ShieldCheck, Trash2, X, AlertTriangle, HardDrive, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { clearAllBiteIdLocalData, RASH_JOURNAL_STORAGE_KEY } from "@/lib/triage";

type PrivacySanitizationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PrivacySanitizationModal({ open, onOpenChange }: PrivacySanitizationModalProps) {
  const [journalCount, setJournalCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [purged, setPurged] = useState(false);

  useEffect(() => {
    if (!open) {
      setPurged(false);
      return;
    }
    try {
      const journalRaw =
        localStorage.getItem(RASH_JOURNAL_STORAGE_KEY) ||
        localStorage.getItem("biteid_rash_entries_v2") ||
        localStorage.getItem("biteid_rash_journal_record");
      const journals = journalRaw ? JSON.parse(journalRaw) : [];
      setJournalCount(Array.isArray(journals) ? journals.length : 0);

      const offlineRaw = localStorage.getItem("biteid_offline_intake_queue");
      const offline = offlineRaw ? JSON.parse(offlineRaw) : [];
      setOfflineCount(Array.isArray(offline) ? offline.length : 0);
    } catch {
      // Ignore
    }
  }, [open]);

  const handlePurge = () => {
    clearAllBiteIdLocalData();
    setJournalCount(0);
    setOfflineCount(0);
    setPurged(true);
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 border-border bg-card rounded-2xl sm:rounded-3xl overflow-hidden">
        <DialogTitle className="sr-only">Device Privacy & Health Data Sanitization</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-card px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-foreground">
                Device Privacy & Data Hygiene
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Local storage controls for shared or private devices.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-muted-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            BiteID stores clinical triage intakes, lesion progression photos, and offline field logs
            directly in your browser&apos;s local storage. This enables 100% offline backcountry
            use, but data remains on this device until purged.
          </p>

          <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <HardDrive className="size-4 text-primary" />
              <span>Current Data on This Device:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-card p-2.5 border border-border/80">
                <span className="text-muted-foreground block">Progression Photos:</span>
                <span className="font-bold text-foreground text-sm font-mono">{journalCount}</span>
              </div>
              <div className="rounded-lg bg-card p-2.5 border border-border/80">
                <span className="text-muted-foreground block">Queued Offline Intakes:</span>
                <span className="font-bold text-foreground text-sm font-mono">{offlineCount}</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Automated Retention: BiteID automatically expires records older than 30 days.
            </p>
          </div>

          {purged ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-1 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="font-bold text-xs">All Health Data & Photos Wiped Clean</p>
              <p className="text-[11px] text-muted-foreground">
                Local storage is completely empty.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Using a shared or borrowed device? Erasing your data immediately removes all skin
                  photos and history from this browser.
                </span>
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={handlePurge}
                className="w-full flex items-center justify-center gap-2 shadow-xs"
              >
                <Trash2 className="size-4" />
                <span>Erase All BiteID Photos & Health Data Now</span>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
