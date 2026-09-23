import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Sun,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type CameraGuidanceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  title?: string;
};

export function CameraGuidanceModal({
  open,
  onOpenChange,
  onCapture,
  title = "Skin Lesion",
}: CameraGuidanceModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lightQuality, setLightQuality] = useState<"good" | "dark" | "bright">("good");
  const [isSharp, setIsSharp] = useState<boolean>(true);
  const [analyzingFrame, setAnalyzingFrame] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  // Start camera when open
  useEffect(() => {
    if (!open) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let active = true;

    async function initCamera() {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (active) {
          streamRef.current = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().catch(() => {});
          }
        } else {
          mediaStream.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        if (active) {
          setCameraError(
            err instanceof Error
              ? err.message
              : "Unable to access camera. Please allow camera permissions.",
          );
        }
      }
    }

    initCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [open]);

  // Real-time luminosity & focus analysis loop
  const checkFrameQuality = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(checkFrameQuality);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = 120;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, 120, 120);

    const frame = ctx.getImageData(0, 0, 120, 120);
    const data = frame.data;
    let totalBrightness = 0;
    let variance = 0;
    const sampleStep = 8;
    let samples = 0;

    for (let i = 0; i < data.length; i += 4 * sampleStep) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += lum;
      samples++;
    }

    const avgLum = totalBrightness / Math.max(1, samples);

    // Assess lighting
    if (avgLum < 45) {
      setLightQuality("dark");
    } else if (avgLum > 230) {
      setLightQuality("bright");
    } else {
      setLightQuality("good");
    }

    // Rough contrast / sharpness estimation
    for (let i = 0; i < data.length - 4 * sampleStep; i += 4 * sampleStep) {
      const lum1 = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const lum2 = 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6];
      variance += Math.abs(lum1 - lum2);
    }
    const edgeScore = variance / Math.max(1, samples);
    setIsSharp(edgeScore > 3.5);

    animationFrameRef.current = requestAnimationFrame(checkFrameQuality);
  }, []);

  useEffect(() => {
    if (open) {
      animationFrameRef.current = requestAnimationFrame(checkFrameQuality);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [open, checkFrameQuality]);

  // Capture snapshot
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `biteid-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        onOpenChange(false);
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleFallbackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-hidden p-0 gap-0 border-border bg-slate-950 text-white rounded-3xl">
        <DialogTitle className="sr-only">Clinical Photo Guidance & Framing Reticle</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 z-20">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Camera className="size-3.5" />
            </span>
            <span className="font-display text-sm font-bold text-white">
              Clinical Camera Guide: {title}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Viewfinder or Fallback */}
        <div className="relative w-full aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <AlertTriangle className="size-10 text-amber-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-white">Direct Camera Access Unavailable</p>
                <p className="text-xs text-slate-400">
                  {cameraError}. You can still choose an existing photo or use your standard phone
                  camera.
                </p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => fallbackInputRef.current?.click()}
                className="gap-2 text-xs"
              >
                <Upload className="size-3.5" />
                <span>Upload From Device</span>
              </Button>
              <input
                ref={fallbackInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFallbackUpload}
              />
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* AR Framing Reticle Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Center Target Circle for Lesion */}
                <div className="relative size-44 sm:size-52 rounded-full border-2 border-dashed border-white/80 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center">
                  <span className="absolute -top-7 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white tracking-wide uppercase">
                    Center Bite / Lesion Here
                  </span>
                  <div className="size-2 rounded-full bg-white/60" />
                </div>

                {/* Coin Scale Guide (Quarter Silhouette) */}
                <div className="absolute right-4 bottom-4 size-16 sm:size-20 rounded-full border border-emerald-400/90 bg-emerald-500/10 flex flex-col items-center justify-center text-center p-1 shadow-sm">
                  <Coins className="size-4 text-emerald-400" />
                  <span className="text-[9px] font-bold text-emerald-300 uppercase leading-none mt-0.5">
                    Quarter / Coin
                  </span>
                  <span className="text-[8px] text-emerald-400/80">for scale</span>
                </div>

                {/* Distance Guidance Text */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-xs border border-white/10">
                  Hold camera 4–6 inches (10–15 cm) away
                </div>
              </div>

              {/* Hidden Canvas for Real-time Video Analysis */}
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>

        {/* Quality Indicator Bar */}
        {!cameraError && (
          <div className="flex items-center justify-around border-t border-slate-800 bg-slate-900/80 px-4 py-2.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Sun
                className={`size-3.5 ${lightQuality === "good" ? "text-emerald-400" : "text-amber-400"}`}
              />
              <span
                className={
                  lightQuality === "good" ? "text-slate-300" : "text-amber-300 font-semibold"
                }
              >
                {lightQuality === "good"
                  ? "Good Lighting"
                  : lightQuality === "dark"
                    ? "Too Dark (Turn on Flash)"
                    : "Too Bright / Glare"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Sparkles className={`size-3.5 ${isSharp ? "text-emerald-400" : "text-amber-400"}`} />
              <span className={isSharp ? "text-slate-300" : "text-amber-300 font-semibold"}>
                {isSharp ? "Sharp Focus" : "Hold Steady"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Coins className="size-3.5 text-emerald-400" />
              <span className="text-slate-300">Scale Coin Recommended</span>
            </div>
          </div>
        )}

        {/* Capture Control Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fallbackInputRef.current?.click()}
            className="text-xs text-slate-400 hover:text-white"
          >
            <Upload className="size-3.5 mr-1.5" />
            Choose File Instead
          </Button>

          {!cameraError && (
            <button
              type="button"
              onClick={handleSnap}
              className="flex size-14 items-center justify-center rounded-full border-4 border-white/40 bg-white shadow-lg transition-transform active:scale-95 hover:border-primary"
              aria-label="Take Photo"
            >
              <div className="size-10 rounded-full bg-slate-900 flex items-center justify-center">
                <Camera className="size-5 text-white" />
              </div>
            </button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
