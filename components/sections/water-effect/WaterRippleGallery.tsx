"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RippleEngine } from "./RippleEngine";

type Props = {
  images: { src: string; alt: string }[];
  className?: string;
};

/**
 * Interactive WebGL gallery: hovering/touching a panel zooms it in and ripples the whole
 * row via a pointer-velocity distortion shader. Falls back to a plain static image row
 * when the user prefers reduced motion, or when WebGL/asset loading fails — accessibility
 * matters more than the effect on a platform about accessibility.
 */
export function WaterRippleGallery({ images, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setMode("fallback");
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let engine: RippleEngine | null = null;
    let cancelled = false;

    try {
      engine = new RippleEngine(container, images.map((img) => img.src));
      engine
        .mount()
        .then(() => {
          if (!cancelled) setMode("ready");
        })
        .catch(() => {
          if (!cancelled) setMode("fallback");
        });
    } catch {
      setMode("fallback");
    }

    return () => {
      cancelled = true;
      engine?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- images identity is expected to be stable for this gallery's lifetime
  }, []);

  return (
    <div className={className}>
      <div ref={containerRef} className="relative w-full h-full rounded-2xl overflow-hidden" style={{ touchAction: "none" }}>
        {mode !== "ready" && (
          <div className="absolute inset-0 flex gap-2">
            {images.map((img) => (
              <div key={img.src} className="relative flex-1 rounded-2xl overflow-hidden">
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="33vw" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
