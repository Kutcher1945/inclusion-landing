"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toAbsoluteUrl } from "@/lib/passports/cdn";

export { toAbsoluteUrl };

// ─── Lightbox ──────────────────────────────────────────────────────────────────

type LightboxProps = {
  urls: string[];
  initialIndex: number;
  onClose: () => void;
};

function Lightbox({ urls, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + urls.length) % urls.length),
    [urls.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % urls.length),
    [urls.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фото"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex items-center justify-center w-full max-w-5xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition"
        >
          <X className="w-7 h-7" />
        </button>

        {/* Prev */}
        {urls.length > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Предыдущее фото"
            className="absolute left-0 -translate-x-14 text-white/70 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={urls[current]}
          src={urls[current]}
          alt=""
          className="max-h-[88vh] max-w-full object-contain rounded-xl shadow-2xl"
        />

        {/* Next */}
        {urls.length > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Следующее фото"
            className="absolute right-0 translate-x-14 text-white/70 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Counter */}
        {urls.length > 1 && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/80 text-sm tabular-nums bg-black/40 px-3 py-1 rounded-full select-none">
            {current + 1} / {urls.length}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ─── PhotoStrip ────────────────────────────────────────────────────────────────

type PhotoStripProps = {
  urls: (string | null)[];
  className?: string;
};

export function PhotoStrip({ urls, className }: PhotoStripProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const valid = urls.filter((u): u is string => Boolean(u)).map(toAbsoluteUrl);

  if (valid.length === 0) return null;

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {valid.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="shrink-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
            aria-label={`Фото ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="h-20 w-28 object-cover rounded-lg border border-foreground/10 hover:opacity-80 transition cursor-zoom-in"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          urls={valid}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
