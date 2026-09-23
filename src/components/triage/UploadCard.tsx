import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CameraGuidanceModal } from "./CameraGuidanceModal";

type UploadCardProps = {
  title: string;
  hint: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  compact?: boolean;
};

export function UploadCard({
  title,
  hint,
  required,
  file,
  onChange,
  compact = false,
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  function acceptFile(nextFile: File | undefined) {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Choose a JPG, PNG, HEIC, or another image file.");
      return;
    }
    if (nextFile.size > 15 * 1024 * 1024) {
      setError("Choose an image smaller than 15 MB.");
      return;
    }
    setError(null);
    onChange(nextFile);
  }

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        acceptFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex flex-col rounded-lg border bg-card p-4 transition-colors sm:p-5",
        dragging ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {required ? "Required" : "Optional"}
        </span>
      </div>

      <div className="mt-4 flex-1">
        {preview ? (
          <div className="relative overflow-hidden rounded-md border border-border bg-muted">
            <img
              src={preview}
              alt={`${title} preview`}
              className={cn("w-full object-cover", compact ? "h-28" : "h-48")}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange(null)}
              className="absolute right-2 top-2 h-9 bg-background/90 text-foreground shadow-sm backdrop-blur hover:bg-background"
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCameraModalOpen(true)}
              className={cn(
                "flex-1 flex-col gap-1.5 border-dashed border-primary/40 bg-primary/5 text-primary shadow-none hover:border-primary hover:bg-primary/10",
                compact ? "h-24 sm:h-28" : "h-36 sm:h-40",
              )}
            >
              <Camera className={compact ? "size-5" : "size-6"} />
              <span className="text-xs sm:text-sm font-semibold">Camera with Coin Reticle</span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                Guides distance & lighting
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex-1 flex-col gap-1.5 border-dashed bg-muted/30 text-muted-foreground shadow-none hover:border-primary hover:bg-primary/5 hover:text-primary",
                compact ? "h-24 sm:h-28" : "h-36 sm:h-40",
              )}
            >
              <Upload className={compact ? "size-5" : "size-6"} />
              <span className="text-xs sm:text-sm font-medium">Choose Existing File</span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                or drag image here
              </span>
            </Button>
          </div>
        )}
      </div>

      <CameraGuidanceModal
        open={cameraModalOpen}
        onOpenChange={setCameraModalOpen}
        onCapture={(capturedFile) => acceptFile(capturedFile)}
        title={title}
      />

      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      {file && (
        <p className="mt-3 truncate text-xs text-muted-foreground">
          {file.name} · {(file.size / 1024).toFixed(0)} KB
        </p>
      )}

      {preview && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="mt-2 h-9 self-start px-0 text-xs"
        >
          <Upload className="size-3.5" />
          Replace photo
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label={`Choose ${title.toLowerCase()} image`}
        className="hidden"
        onChange={(e) => acceptFile(e.target.files?.[0])}
      />
    </div>
  );
}
