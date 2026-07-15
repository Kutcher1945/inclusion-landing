"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { ActivityKozs } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

interface Props { data: ActivityKozs[] }

export function ActivityKozsChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const tickFill = resolvedTheme === "dark" ? "rgba(255,255,255,0.4)" : "#9ca3af";
  const tickFillStrong = resolvedTheme === "dark" ? "rgba(255,255,255,0.55)" : "#6b7280";

  const chartData = data
    .filter((d) => d.type_of_activity__name_ru)
    .slice(0, 12)
    .map((d) => ({
      name: (d.type_of_activity__name_ru ?? "")
        .replace(/деятельность$/i, "")
        .replace(/учреждения$/i, "")
        .trim()
        .slice(0, 22),
      К: d.k_access,
      О: d.o_access,
      С: d.s_access,
      З: d.z_access,
      total: d.total,
    }));

  return (
    <div className="bg-surface rounded-2xl border border-foreground/8 p-6">
      <h3 className="font-semibold text-foreground text-sm mb-1">Доступность по видам деятельности</h3>
      <p className="text-xs text-foreground/40 mb-5">Число объектов с оценкой «Доступно» по К/О/С/З</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: tickFill }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 10, fill: tickFillStrong }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px", border: "1px solid var(--border)", fontSize: "12px",
              background: "var(--surface)", color: "var(--foreground)",
            }}
            formatter={(v, name) => [(v as number).toLocaleString("ru-RU"), name]}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Bar dataKey="К" fill="#3772ff" radius={[0, 4, 4, 0]} maxBarSize={10} />
          <Bar dataKey="О" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={10} />
          <Bar dataKey="С" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={10} />
          <Bar dataKey="З" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
