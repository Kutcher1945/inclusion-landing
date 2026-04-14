"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { AdaptationStats } from "@/lib/api";

interface Props { data: AdaptationStats }

const LEVELS = [
  { key: "fully_adapted",      label: "Полностью (87–97)",  color: "#10b981" },
  { key: "highly_adapted",     label: "Высоко (70–86)",     color: "#3772ff" },
  { key: "moderately_adapted", label: "Средне (40–69)",     color: "#f59e0b" },
  { key: "poorly_adapted",     label: "Слабо (1–39)",       color: "#f97316" },
  { key: "not_adapted",        label: "Не адаптировано (0)", color: "#ef4444" },
] as const;

export function AdaptationChart({ data }: Props) {
  const chartData = LEVELS
    .map((l) => ({ ...l, value: data.adaptation_levels[l.key] }))
    .filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-2xl p-7 border border-neutral-100">
      <h3 className="font-semibold text-neutral-900 mb-1">Уровни адаптации</h3>
      <p className="text-sm text-neutral-400 mb-2">По числу адаптированных показателей из 97</p>

      {/* Average badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#eff4ff] mb-5">
        <span className="text-xs text-neutral-500">Средний уровень:</span>
        <span className="text-sm font-bold text-[#3772ff]">{data.average_adaptation_percentage}%</span>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
              formatter={(v) => [(v as number)?.toLocaleString("ru-RU") ?? "0", "объектов"]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-2.5">
          {chartData.map((d) => (
            <div key={d.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-neutral-600">{d.label}</span>
              </div>
              <span className="text-xs font-semibold text-neutral-800 tabular-nums">
                {d.value.toLocaleString("ru-RU")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
