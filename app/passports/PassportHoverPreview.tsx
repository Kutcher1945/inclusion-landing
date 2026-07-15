"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar } from "lucide-react";
import { StatusPill, DeliveryPill, criteriaBarColor, type StatusVariant } from "./StatusPill";

const CARD_WIDTH = 440;
const GAP = 10;
const VIEWPORT_MARGIN = 16;
const MIN_HEIGHT = 520;

type HoverInfo = {
  id: number;
  name: string | null;
  address: string | null;
  district: string | null;
  activityType: string | null;
  statusLabel: string | null;
  statusVariant: StatusVariant;
  deliveryLabel: string | null;
  deliverySent: boolean;
  criteriaFilled: number;
  criteriaTotal: number;
  updatedAt: string | null;
};

type Props = {
  photos: string[];
  info: HoverInfo;
  className?: string;
  children: React.ReactNode;
};

type Coords = { top: number; left: number; maxHeight: number };

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" });

export function PassportHoverPreview({ photos, info, className, children }: Props) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  function handleEnter() {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - GAP - VIEWPORT_MARGIN;
    const openBelow = spaceBelow >= MIN_HEIGHT || spaceBelow >= spaceAbove;
    const top = openBelow ? rect.bottom + GAP : VIEWPORT_MARGIN;
    const maxHeight = Math.max(MIN_HEIGHT, openBelow ? spaceBelow : spaceAbove);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - CARD_WIDTH - 16));
    setCoords({ top, left, maxHeight });
  }

  const hasContent = photos.length > 0 || info.address || info.district || info.activityType;
  if (!hasContent) {
    return <div className={className}>{children}</div>;
  }

  const pct = info.criteriaTotal > 0 ? Math.round((info.criteriaFilled / info.criteriaTotal) * 100) : 0;
  const remaining = info.criteriaTotal - info.criteriaFilled;
  const barColor = criteriaBarColor(pct);
  const updatedLabel = info.updatedAt ? dateFormatter.format(new Date(info.updatedAt)) : null;

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setCoords(null)} className={className}>
      {children}
      {coords &&
        createPortal(
          <div
            className="fixed z-50 rounded-2xl bg-surface border border-foreground/10 shadow-2xl overflow-y-auto pointer-events-none"
            style={{ top: coords.top, left: coords.left, width: CARD_WIDTH, maxHeight: coords.maxHeight }}
          >
            {/* Brief info — sticky so the name stays visible while the rest scrolls underneath */}
            <div className="sticky top-0 z-10 bg-surface p-5 border-b border-foreground/8 space-y-2.5">
              <span className="text-[11px] font-mono text-foreground/35">ID {info.id}</span>
              {info.name && (
                <div className="text-lg font-semibold text-foreground/90 leading-snug">{info.name}</div>
              )}
              {info.address && (
                <div className="text-base text-foreground/55 leading-snug">{info.address}</div>
              )}
              {(info.district || info.activityType) && (
                <div className="text-sm text-foreground/35">
                  {[info.district, info.activityType].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>

            {/* Status rows */}
            <div className="px-5 py-4 border-b border-foreground/8 space-y-2.5">
              {info.statusLabel && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/35">Согласование</span>
                  <StatusPill label={info.statusLabel} variant={info.statusVariant} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/35">Отправка</span>
                <DeliveryPill label={info.deliveryLabel ?? "Не отправлено"} sent={info.deliverySent} />
              </div>
            </div>

            {/* Criteria progress */}
            {info.criteriaTotal > 0 && (
              <div className="px-5 py-4 border-b border-foreground/8">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground/70">Критерии</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: barColor }}>
                    {info.criteriaFilled}/{info.criteriaTotal}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-foreground/8 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-xs text-foreground/40">
                  <span>{pct}% выполнено</span>
                  <span>{remaining} осталось</span>
                </div>
              </div>
            )}

            {/* Updated date */}
            {updatedLabel && (
              <div className="px-5 py-3 border-b border-foreground/8 flex items-center gap-2 text-sm text-foreground/45">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {updatedLabel}
              </div>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 p-4">
                {photos.slice(0, 4).map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" className="w-full h-48 object-cover rounded-xl" />
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
