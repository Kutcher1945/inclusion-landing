"use client";
import type { AccessibilityStats } from "@/lib/api";

interface Props {
  data: AccessibilityStats;
  total: number;
}

const ROWS = [
  { code: "К", label: "Кресло-коляска",      color: "#3772ff", bg: "#eff4ff", accKey: "wheelchair_accessible", partKey: "wheelchair_partial" },
  { code: "О", label: "Опорно-двигательная", color: "#8b5cf6", bg: "#f5f3ff", accKey: "motor_accessible",       partKey: "motor_partial"       },
  { code: "С", label: "Слух",                color: "#10b981", bg: "#f0fdf4", accKey: "hearing_accessible",     partKey: "hearing_partial"     },
  { code: "З", label: "Зрение",              color: "#f59e0b", bg: "#fffbeb", accKey: "vision_accessible",      partKey: "vision_partial"      },
] as const;

export function AccessibilityChart({ data, total }: Props) {
  return (
    <div className="bg-white rounded-2xl p-7 border border-neutral-100">
      <h3 className="font-semibold text-neutral-900 mb-1">Доступность по категориям К/О/С/З</h3>
      <p className="text-sm text-neutral-400 mb-6">Только учреждения (ObjectPassport)</p>
      <div className="space-y-5">
        {ROWS.map((r) => {
          const acc  = data[r.accKey]  ?? 0;
          const part = data[r.partKey] ?? 0;
          const nacc = total - acc - part;
          const pctAcc  = total ? (acc  / total) * 100 : 0;
          const pctPart = total ? (part / total) * 100 : 0;

          return (
            <div key={r.code}>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: r.bg, color: r.color }}
                >
                  {r.code}
                </div>
                <span className="text-sm text-neutral-700 flex-1">{r.label}</span>
                <span className="text-xs text-neutral-400">
                  {acc.toLocaleString("ru-RU")} / {part.toLocaleString("ru-RU")} / {nacc.toLocaleString("ru-RU")}
                </span>
              </div>
              {/* Stacked bar */}
              <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden flex">
                <div style={{ width: `${pctAcc}%`,  background: r.color }}                   className="h-full transition-all duration-700" />
                <div style={{ width: `${pctPart}%`, background: r.color, opacity: 0.35 }}    className="h-full transition-all duration-700" />
              </div>
              <div className="flex gap-3 mt-1 text-[11px] text-neutral-400">
                <span style={{ color: r.color }}>{pctAcc.toFixed(1)}% доступен</span>
                <span style={{ color: r.color, opacity: 0.6 }}>{pctPart.toFixed(1)}% частично</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-2 gap-3">
        <div className="text-center p-3 rounded-xl bg-green-50">
          <div className="text-lg font-bold text-green-700">{data.fully_accessible.toLocaleString("ru-RU")}</div>
          <div className="text-xs text-green-600 mt-0.5">Доступен по всем 4</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-blue-50">
          <div className="text-lg font-bold text-blue-600">{data.fully_partial.toLocaleString("ru-RU")}</div>
          <div className="text-xs text-blue-500 mt-0.5">Хотя бы частично по всем 4</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-neutral-50">
          <div className="text-lg font-bold text-neutral-600">{data.not_accessible.toLocaleString("ru-RU")}</div>
          <div className="text-xs text-neutral-400 mt-0.5">Без оценки (все null)</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-neutral-50">
          <div className="text-lg font-bold text-neutral-700">{total.toLocaleString("ru-RU")}</div>
          <div className="text-xs text-neutral-400 mt-0.5">Всего объектов</div>
        </div>
      </div>
    </div>
  );
}
