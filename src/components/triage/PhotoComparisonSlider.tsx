import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";

type PhotoComparisonSliderProps = {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
};

export function PhotoComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Baseline (Day 1)",
  afterLabel = "Follow-Up",
  className = "",
}: PhotoComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl border border-border bg-muted ${className}`}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
      style={{ touchAction: "none" }}
    >
      {/* After image (Background / Full view) */}
      <img
        src={afterUrl}
        alt={afterLabel}
        className="block h-64 sm:h-80 w-full object-cover"
        draggable={false}
      />
      <span className="absolute bottom-2 right-2 z-10 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-xs shadow-xs">
        {afterLabel}
      </span>

      {/* Before image (Foreground / Clipped by slider) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="block h-64 sm:h-80 w-full object-cover max-w-none"
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%" }}
          draggable={false}
        />
        <span className="absolute bottom-2 left-2 z-10 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-xs shadow-xs">
          {beforeLabel}
        </span>
      </div>

      {/* Vertical Divider Line & Drag Handle */}
      <div
        className="absolute bottom-0 top-0 z-20 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-md ring-2 ring-primary cursor-ew-resize">
          <ArrowLeftRight className="size-4" />
        </div>
      </div>
    </div>
  );
}
