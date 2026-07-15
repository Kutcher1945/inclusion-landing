"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { DistrictStat } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

interface Props { data: DistrictStat[] }

// Recharts needs real color values (SVG fill), not Tailwind classes — the light palette's
// tail end fades to near-white, which would be invisible on a dark card, so dark mode gets
// its own fade-to-navy palette instead of relying on a single shared array.
const COLORS_LIGHT = ["#3772ff", "#4d85ff", "#6a9aff", "#87afff", "#a3c3ff", "#bfd8ff", "#dbeaff", "#f0f5ff"];
const COLORS_DARK  = ["#5b8fff", "#5285f0", "#4a7cd6", "#4572bd", "#3f68a3", "#3a5e8a", "#345470", "#2e4a57"];

export function DistrictChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === "dark" ? COLORS_DARK : COLORS_LIGHT;
  const tickFill = resolvedTheme === "dark" ? "rgba(255,255,255,0.4)" : "#9ca3af";
  const cursorFill = resolvedTheme === "dark" ? "rgba(255,255,255,0.04)" : "#f9fafb";

  const chartData = data
    .filter((d) => d.district__name_ru)
    .slice(0, 10)
    .map((d) => ({
      name: (d.district__name_ru ?? "").replace(/ский$/, "").replace(/инский$/, "").trim(),
      total: d.total_objects,
      adapted: d.adapted_objects,
    }));

  return (
    <div className="bg-surface rounded-2xl p-7 border border-foreground/8">
      <h3 className="font-semibold text-foreground mb-1">Объекты по районам</h3>
      <p className="text-sm text-foreground/40 mb-6">Количество паспортов на район</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: tickFill }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: tickFill }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.16)",
              background: "var(--surface)", color: "var(--foreground)",
            }}
            cursor={{ fill: cursorFill }}
            formatter={(v, name) => [
              (v as number)?.toLocaleString("ru-RU") ?? "0",
              name === "total" ? "Всего" : "Адаптировано",
            ]}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
