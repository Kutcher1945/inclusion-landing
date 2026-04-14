"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { DistrictStat } from "@/lib/api";

interface Props { data: DistrictStat[] }

const COLORS = ["#3772ff", "#4d85ff", "#6a9aff", "#87afff", "#a3c3ff", "#bfd8ff", "#dbeaff", "#f0f5ff"];

export function DistrictChart({ data }: Props) {
  const chartData = data
    .filter((d) => d.district__name_ru)
    .slice(0, 10)
    .map((d) => ({
      name: (d.district__name_ru ?? "").replace(/ский$/, "").replace(/инский$/, "").trim(),
      total: d.total_objects,
      adapted: d.adapted_objects,
    }));

  return (
    <div className="bg-white rounded-2xl p-7 border border-neutral-100">
      <h3 className="font-semibold text-neutral-900 mb-1">Объекты по районам</h3>
      <p className="text-sm text-neutral-400 mb-6">Количество паспортов на район</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
            cursor={{ fill: "#f9fafb" }}
            formatter={(v, name) => [
              (v as number)?.toLocaleString("ru-RU") ?? "0",
              name === "total" ? "Всего" : "Адаптировано",
            ]}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
