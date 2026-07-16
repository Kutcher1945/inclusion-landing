"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { RefItem } from "@/lib/passports/types";

type StatusVariant = "green" | "amber" | "blue" | "red" | "gray";

const VARIANT_BY_ID: Record<number, StatusVariant> = {
  1: "green", 2: "amber", 3: "blue", 4: "red",
};

const PILL: Record<StatusVariant, { bg: string; text: string; dot: string; ring: string }> = {
  green: { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  ring: "ring-green-200" },
  amber: { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500",  ring: "ring-amber-200" },
  blue:  { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   ring: "ring-blue-200" },
  red:   { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500",    ring: "ring-red-200" },
  gray:  { bg: "bg-gray-100",  text: "text-gray-500",   dot: "bg-gray-400",   ring: "ring-gray-200" },
};

type Props = {
  id: number;
  statusId: number | null;
  statuses: RefItem[];
};

export function InlineStatusSelect({ id, statusId, statuses }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [currentId, setCurrentId] = useState(statusId);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const variant: StatusVariant = currentId ? (VARIANT_BY_ID[currentId] ?? "gray") : "gray";
  const s = PILL[variant];
  const label = statuses.find((x) => x.id === currentId)?.name_ru
    ?.replace(/^[\p{Emoji}\s]+/u, "").trim()
    ?? (currentId ? `#${currentId}` : "—");

  async function applyStatus(newId: number) {
    if (newId === currentId) { setOpen(false); return; }
    setOpen(false);
    setPending(true);
    try {
      const { patchPassport } = await import("@/lib/passports/browser-api");
      await patchPassport(id, { status: newId });
      setCurrentId(newId);
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          "transition-all cursor-pointer select-none",
          s.bg, s.text,
          open ? `ring-2 ${s.ring}` : `hover:ring-2 ${s.ring}`,
          pending && "opacity-50 cursor-not-allowed",
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
        {label}
        <svg viewBox="0 0 10 6" className="w-2.5 h-2.5 shrink-0 opacity-40 ml-0.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 left-0 top-full mt-1.5 min-w-[180px] bg-surface border border-foreground/[0.08] rounded-xl shadow-xl py-1 overflow-hidden">
          {statuses.map((item) => {
            const v: StatusVariant = VARIANT_BY_ID[item.id] ?? "gray";
            const p = PILL[v];
            const name = item.name_ru?.replace(/^[\p{Emoji}\s]+/u, "").trim() ?? `#${item.id}`;
            const isActive = item.id === currentId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => applyStatus(item.id)}
                className={cn(
                  "w-full px-3 py-2 flex items-center gap-2 text-left transition-colors",
                  isActive ? "bg-foreground/[0.04]" : "hover:bg-foreground/[0.03]",
                )}
              >
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                  p.bg, p.text,
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", p.dot)} />
                  {name}
                </span>
                {isActive && (
                  <svg viewBox="0 0 16 16" className="w-3 h-3 ml-auto text-foreground/35" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 8l4 4 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
