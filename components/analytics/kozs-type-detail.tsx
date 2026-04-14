"use client";
import type { KozsBreakdown } from "@/lib/api";

interface Props {
  kozs: {
    kreslo:   KozsBreakdown;
    opordvig: KozsBreakdown;
    sluh:     KozsBreakdown;
    zrenie:   KozsBreakdown;
  };
  total: number;
}

const META = [
  { key: "kreslo",   short: "К", label: "Кресло-коляска",      color: "#3772ff", bg: "#eff4ff" },
  { key: "opordvig", short: "О", label: "Опорно-двигательная", color: "#8b5cf6", bg: "#f5f3ff" },
  { key: "sluh",     short: "С", label: "Слух",                color: "#10b981", bg: "#f0fdf4" },
  { key: "zrenie",   short: "З", label: "Зрение",              color: "#f59e0b", bg: "#fffbeb" },
] as const;

const ACC_KEY  = "Доступен";
const PART_KEY = "Частично доступен";
const NACC_KEY = "Не доступен";

export function KozsTypeDetail({ kozs, total }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {META.map(({ key, short, label, color, bg }) => {
        const cat  = kozs[key as keyof typeof kozs];
        const dist = cat.distribution as Record<string, number>;
        const acc  = dist[ACC_KEY]  ?? 0;
        const part = dist[PART_KEY] ?? 0;
        const nacc = dist[NACC_KEY] ?? 0;
        const none = total - acc - part - nacc;
        const pctAcc  = total ? ((acc  / total) * 100).toFixed(1) : "0";
        const pctPart = total ? ((part / total) * 100).toFixed(1) : "0";
        const pctNacc = total ? ((nacc / total) * 100).toFixed(1) : "0";

        return (
          <div key={key} className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: bg, color }}>
                {short}
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{label}</div>
                <div className="text-xs text-neutral-400">{total.toLocaleString("ru-RU")} паспортов</div>
              </div>
            </div>

            {/* Stacked bar */}
            <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden flex">
              <div style={{ width: `${pctAcc}%`,  background: color }}           className="h-full" />
              <div style={{ width: `${pctPart}%`, background: color, opacity: 0.35 }} className="h-full" />
              <div style={{ width: `${pctNacc}%`, background: "#ef4444" }}        className="h-full" />
              <div style={{ width: `${total ? (none / total) * 100 : 0}%`, background: "#e5e7eb" }} className="h-full" />
            </div>

            {/* Counts */}
            <div className="space-y-1.5">
              <Row color={color}         label="Доступен"           count={acc}  pct={pctAcc} />
              <Row color={color} opacity  label="Частично доступен"  count={part} pct={pctPart} />
              <Row color="#ef4444"        label="Не доступен"        count={nacc} pct={pctNacc} />
              {none > 0 && (
                <Row color="#9ca3af" label="Нет сведений" count={none} pct={total ? ((none / total) * 100).toFixed(1) : "0"} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Row({ color, opacity, label, count, pct }: {
  color: string; opacity?: boolean; label: string; count: number; pct: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color, opacity: opacity ? 0.4 : 1 }}
      />
      <span className="text-xs text-neutral-500 flex-1 truncate">{label}</span>
      <span className="text-xs tabular-nums text-neutral-600 font-medium">{count.toLocaleString("ru-RU")}</span>
      <span className="text-xs text-neutral-400 w-10 text-right">{pct}%</span>
    </div>
  );
}
