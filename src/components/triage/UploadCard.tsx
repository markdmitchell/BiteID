import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadCardProps = {
  title: string;
  hint: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
};

export function UploadCard({ title, hint, required, file, onChange }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

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
        const dropped = e.dataTransfer.files?.[0];
        if (dropped && dropped.type.startsWith("image/")) onChange(dropped);
      }}
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-5 transition-colors",
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
          <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
            <img src={preview} alt={`${title} preview`} className="h-48 w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <Trash2 className="size-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Camera className="size-7" />
            <span className="text-sm font-medium">Take or choose a photo</span>
            <span className="text-xs">or drag an image here</span>
          </button>
        )}
      </div>

      {file && (
        <p className="mt-3 truncate text-xs text-muted-foreground">
          {file.name} · {(file.size / 1024).toFixed(0)} KB
        </p>
      )}

      {preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 inline-flex items-center gap-1.5 self-start text-xs font-medium text-primary hover:underline"
        >
          <Upload className="size-3.5" />
          Replace photo
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
