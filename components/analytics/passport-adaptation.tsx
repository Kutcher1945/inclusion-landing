"use client";
import type { AdaptationBreakdown } from "@/lib/api";

interface PassportType {
  label: string;
  color: string;
  adaptation: AdaptationBreakdown;
}

interface Props {
  types: PassportType[];
}

const LEVEL_META = [
  { key: "fully",      label: "Полностью (87–97)", color: "#10b981" },
  { key: "highly",     label: "Высоко (70–86)",    color: "#3772ff" },
  { key: "moderately", label: "Средне (40–69)",     color: "#f59e0b" },
  { key: "poorly",     label: "Слабо (1–39)",       color: "#f97316" },
  { key: "none",       label: "Не адаптировано",    color: "#ef4444" },
] as const;

function AdaptCard({ label, color, adaptation }: PassportType) {
  const levels = adaptation.levels;
  const total = adaptation.total || 1;

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-neutral-900">{label}</div>
          <div className="text-xs text-neutral-400 mt-0.5">{adaptation.total.toLocaleString("ru-RU")} паспортов</div>
        </div>
        <div
          className="text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {adaptation.average_pct}%
        </div>
      </div>

      {/* Stacked full-width bar */}
      <div className="w-full h-3 rounded-full overflow-hidden flex mb-4">
        {LEVEL_META.map(({ key, color: c }) => {
          const pct = (levels[key as keyof typeof levels] / total) * 100;
          return pct > 0 ? (
            <div key={key} style={{ width: `${pct}%`, background: c }} className="h-full" title={key} />
          ) : null;
        })}
      </div>

      {/* Legend */}
      <div className="space-y-1.5">
        {LEVEL_META.map(({ key, label: lbl, color: c }) => {
          const count = levels[key as keyof typeof levels];
          const pct = Math.round((count / total) * 100);
          if (count === 0) return null;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
              <span className="text-xs text-neutral-500 flex-1">{lbl}</span>
              <span className="text-xs tabular-nums text-neutral-600 font-medium">{count.toLocaleString("ru-RU")}</span>
              <span className="text-xs text-neutral-400 w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PassportAdaptation({ types }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {types.map((t) => (
        <AdaptCard key={t.label} {...t} />
      ))}
    </div>
  );
}
