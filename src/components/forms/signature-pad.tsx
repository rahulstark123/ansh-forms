"use client";

import React, { useEffect, useRef, useState } from "react";
import SignaturePadLib from "signature_pad";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function SignaturePad({ value, onChange, disabled, className }: SignaturePadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(!value);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const pad = new SignaturePadLib(canvas, {
      minWidth: 0.75,
      maxWidth: 2.75,
      penColor: "#0f172a",
      backgroundColor: "rgba(255, 255, 255, 0)",
      throttle: 8,
      velocityFilterWeight: 0.7,
    });
    padRef.current = pad;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const data = pad.isEmpty() ? null : pad.toDataURL("image/png");

      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      ctx?.scale(ratio, ratio);

      pad.clear();
      if (data) {
        pad.fromDataURL(data, { ratio, width: rect.width, height: rect.height });
        setShowPlaceholder(false);
      } else if (value) {
        pad.fromDataURL(value, { ratio, width: rect.width, height: rect.height });
        setShowPlaceholder(false);
      } else {
        setShowPlaceholder(true);
      }
    };

    const handleEndStroke = () => {
      if (pad.isEmpty()) {
        setShowPlaceholder(true);
        onChange(null);
      } else {
        setShowPlaceholder(false);
        onChange(pad.toDataURL("image/png"));
      }
    };

    pad.addEventListener("endStroke", handleEndStroke);
    resize();
    window.addEventListener("resize", resize);

    return () => {
      pad.removeEventListener("endStroke", handleEndStroke);
      window.removeEventListener("resize", resize);
      pad.off();
      padRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pad lifecycle tied to mount; value synced on resize
  }, []);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;

    if (!value && pad.isEmpty()) {
      setShowPlaceholder(true);
      return;
    }

    if (value && pad.isEmpty()) {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      pad.fromDataURL(value, { ratio, width: rect.width, height: rect.height });
      setShowPlaceholder(false);
    }
  }, [value]);

  const handleClear = () => {
    padRef.current?.clear();
    setShowPlaceholder(true);
    onChange(null);
  };

  return (
    <div className={cn("space-y-2 select-none", className)}>
      <div
        ref={containerRef}
        className="relative h-32 w-full overflow-hidden rounded-xl border border-border/80 bg-white"
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "block h-full w-full touch-none",
            disabled ? "pointer-events-none cursor-not-allowed opacity-60" : "cursor-crosshair"
          )}
        />
        {showPlaceholder && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Sign here with mouse or finger
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
        >
          Clear signature
        </button>
      </div>
    </div>
  );
}
