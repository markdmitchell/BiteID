import { AlertTriangle, PhoneCall } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type EmergencyModalProps = {
  open: boolean;
  onDismiss: () => void;
};

export function EmergencyModal({ open, onDismiss }: EmergencyModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden border-0 bg-destructive p-0 text-destructive-foreground sm:max-w-lg"
      >
        <div className="p-6 sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive-foreground/15">
            <AlertTriangle className="size-6" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold leading-tight">
            Seek emergency care now
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-destructive-foreground/90">
            The symptom you selected can signal a life-threatening reaction or infection. Do not wait
            for an assessment from this tool. Call your local emergency number or go to the nearest
            emergency department immediately.
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-destructive-foreground/10 px-4 py-3 text-sm font-medium">
            <PhoneCall className="size-4 shrink-0" />
            Call emergency services or have someone take you in right away.
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-6 w-full rounded-xl bg-destructive-foreground px-4 py-3 text-sm font-semibold text-destructive transition-opacity hover:opacity-90"
          >
            I understand — continue anyway
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
