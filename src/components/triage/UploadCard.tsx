"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

type UploadCardProps = {
  title: string;
  hint: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

  const accept = (list: FileList | null) => {
    const next = list?.[0];
    if (next && next.type.startsWith("image/")) onChange(next);
  };

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
        accept(e.dataTransfer.files);
      }}
      className={`relative rounded-2xl border-2 border-dashed bg-card p-5 transition-colors ${
        dragging ? "border-primary bg-accent" : "border-border"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          {required ? "Required" : "Optional"}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>

      {preview ? (
        <div className="mt-4">
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img src={preview} alt={`${title} preview`} className="h-44 w-full object-cover" />
            <button
              type="button"
              aria-label={`Remove ${title}`}
              onClick={() => onChange(null)}
              className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow-sm transition-colors hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {file?.name} · {file ? formatSize(file.size) : ""}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl bg-muted/60 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ImagePlus className="h-7 w-7" />
          <span className="text-sm font-medium">Choose a photo or drop it here</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => accept(e.target.files)}
      />
    </div>
  );
}
