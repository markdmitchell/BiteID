import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ExternalLink,
  Navigation,
  PhoneCall,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { stateLabel } from "@/lib/us-states";

type UrgentCareLocatorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usState?: string;
  hasEmergencySymptoms?: boolean;
};

export function UrgentCareLocator({
  open,
  onOpenChange,
  usState,
  hasEmergencySymptoms = false,
}: UrgentCareLocatorProps) {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const regionName = usState ? stateLabel(usState) : null;

  const defaultQuery = regionName
    ? `urgent care clinic near ${regionName}`
    : "urgent care clinic near me";

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(defaultQuery)}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(defaultQuery)}`;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const { latitude, longitude } = position.coords;
        const query = `${latitude},${longitude} urgent care`;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError("Location access was denied. You can still search by region below.");
        } else {
          setGeoError("Unable to detect current GPS location. Use standard map search below.");
        }
      },
      { timeout: 8000 },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary">
            <MapPin className="size-5 shrink-0" />
            <DialogTitle className="font-display text-lg font-bold text-foreground">
              Find In-Person Clinical Care
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Search nearby urgent care centers and walk-in clinics to be evaluated by a licensed
            medical professional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {hasEmergencySymptoms && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive-foreground space-y-2">
              <div className="flex items-center gap-2 font-bold text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <span>Emergency Warning: Call 911 Immediately</span>
              </div>
              <p className="text-destructive leading-relaxed">
                You reported potential emergency symptoms (such as airway tightness, facial
                swelling, dizziness, or confusion). Walk-in urgent care clinics are often not
                equipped for life-threatening resuscitation. Please proceed to the nearest Emergency
                Department or dial 911 immediately.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-1 font-semibold"
                onClick={() => window.open("tel:911")}
              >
                <PhoneCall className="size-4 mr-2" />
                Dial 911 Now
              </Button>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Locate Nearby Clinics</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {regionName ? (
                    <span>
                      Exposure region noted as <strong>{regionName}</strong>.
                    </span>
                  ) : (
                    "Opens your preferred navigation service."
                  )}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                className="text-xs"
              >
                <Navigation className="size-3.5 mr-1.5 text-primary" />
                {geoLoading ? "Detecting GPS…" : "Use My GPS"}
              </Button>
            </div>

            {geoError && <p className="text-xs text-caution-foreground">{geoError}</p>}

            <div className="grid gap-2 sm:grid-cols-2 pt-1">
              <Button
                type="button"
                variant="default"
                className="w-full justify-center"
                onClick={() => window.open(googleMapsUrl, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="size-4 mr-2" />
                Open Google Maps
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                onClick={() => window.open(appleMapsUrl, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="size-4 mr-2" />
                Open Apple Maps
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Non-Affiliation & Legal Notice</span>
            </div>
            <p className="leading-relaxed">
              BiteID provides links to third-party mapping applications solely as a patient
              convenience. BiteID is not a healthcare provider, does not operate medical clinics, is
              not affiliated with any medical provider or network, and does not endorse specific
              clinicians. Facility hours, capabilities, insurance acceptance, and triage protocols
              must be verified directly with the facility.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
