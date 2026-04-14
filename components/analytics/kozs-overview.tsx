"use client";
import type { KozsCategory } from "@/lib/api";

interface Props {
  kozs: {
    kreslo: KozsCategory;
    opordvig: KozsCategory;
    sluh: KozsCategory;
    zrenie: KozsCategory;
  };
}

const KOZS_META = [
  { key: "kreslo",   short: "К", label: "Кресло-коляска",      color: "#3772ff", bg: "#eff4ff" },
  { key: "opordvig", short: "О", label: "Опорно-двигательная", color: "#8b5cf6", bg: "#f5f3ff" },
  { key: "sluh",     short: "С", label: "Слух",                color: "#10b981", bg: "#f0fdf4" },
  { key: "zrenie",   short: "З", label: "Зрение",              color: "#f59e0b", bg: "#fffbeb" },
] as const;

const PASSPORT_LABELS: Record<string, string> = {
  objects: "Объекты",
  hotels:  "Гостиницы",
  hostels: "Общежития",
  stops:   "Остановки",
};

export function KozsOverview({ kozs }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {KOZS_META.map(({ key, short, label, color, bg }) => {
        const cat = kozs[key as keyof typeof kozs];
        const pctPartial = cat.pct_partial;
        const pctInaccessible = cat.total
          ? Math.round((cat.inaccessible / cat.total) * 100)
          : 0;

        return (
          <div key={key} className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base"
                style={{ background: bg, color }}
              >
                {short}
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{label}</div>
                <div className="text-xs text-neutral-400">{cat.total.toLocaleString("ru-RU")} объектов с оценкой</div>
              </div>
            </div>

            {/* Main metrics row */}
            <div className="flex items-stretch gap-2">
              <div className="flex-1 rounded-xl px-3 py-2" style={{ background: bg }}>
                <div className="text-xs text-neutral-500 mb-0.5">Доступен</div>
                <div className="text-xl font-bold tabular-nums" style={{ color }}>
                  {cat.accessible.toLocaleString("ru-RU")}
                </div>
              </div>
              <div className="flex-1 rounded-xl px-3 py-2 bg-neutral-50">
                <div className="text-xs text-neutral-500 mb-0.5">Частично</div>
                <div className="text-xl font-bold tabular-nums text-neutral-700">
                  {cat.partial.toLocaleString("ru-RU")}
                </div>
              </div>
              <div className="flex-1 rounded-xl px-3 py-2 bg-red-50">
                <div className="text-xs text-neutral-500 mb-0.5">Не доступен</div>
                <div className="text-xl font-bold tabular-nums text-red-500">
                  {cat.inaccessible.toLocaleString("ru-RU")}
                </div>
              </div>
            </div>

            {/* Stacked bar: Доступен | Частично | Не доступен | Без оценки */}
            {(() => {
              const noInfo = cat.total - cat.accessible - cat.partial - cat.inaccessible;
              const pctAcc  = cat.total ? (cat.accessible   / cat.total) * 100 : 0;
              const pctPart = cat.total ? (cat.partial       / cat.total) * 100 : 0;
              const pctNacc = cat.total ? (cat.inaccessible  / cat.total) * 100 : 0;
              const pctNone = cat.total ? (noInfo            / cat.total) * 100 : 0;
              return (
                <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden flex">
                  <div style={{ width: `${pctAcc}%`,  background: color }}           className="h-full" title="Доступен" />
                  <div style={{ width: `${pctPart}%`, background: color, opacity: 0.35 }} className="h-full" title="Частично доступен" />
                  <div style={{ width: `${pctNacc}%`, background: "#ef4444" }}        className="h-full" title="Не доступен" />
                  <div style={{ width: `${pctNone}%`, background: "#d1d5db" }}        className="h-full" title="Нет сведений" />
                </div>
              );
            })()}

            {/* Per passport mini breakdown */}
            <div className="pt-1 border-t border-neutral-50 space-y-1.5">
              {(Object.entries(cat.by_passport) as [string, { accessible: number; partial: number; total: number }][]).map(
                ([type, d]) => {
                  const pctAcc  = d.total ? (d.accessible / d.total) * 100 : 0;
                  const pctPart = d.total ? (d.partial     / d.total) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400 w-20 shrink-0">{PASSPORT_LABELS[type]}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden flex">
                        <div style={{ width: `${pctAcc}%`,  background: color }}                   className="h-full" />
                        <div style={{ width: `${pctPart}%`, background: color, opacity: 0.35 }} className="h-full" />
                      </div>
                      <span className="text-xs tabular-nums text-neutral-500 w-8 text-right">
                        {Math.round(pctAcc + pctPart)}%
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
