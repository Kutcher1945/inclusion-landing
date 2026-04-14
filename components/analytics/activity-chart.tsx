"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ActivityTypeStat } from "@/lib/api";

interface Props { data: ActivityTypeStat[] }

export function ActivityChart({ data }: Props) {
  const chartData = data
    .filter((d) => d.type_of_activity__name_ru)
    .slice(0, 12)
    .map((d) => ({
      name: (d.type_of_activity__name_ru ?? "").split(" ").slice(0, 2).join(" "),
      fullName: d.type_of_activity__name_ru ?? "",
      total: d.total_objects,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="bg-white rounded-2xl p-7 border border-neutral-100">
      <h3 className="font-semibold text-neutral-900 mb-1">По видам деятельности</h3>
      <p className="text-sm text-neutral-400 mb-6">Топ видов деятельности по числу объектов</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={110}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
            cursor={{ fill: "#f9fafb" }}
            formatter={(v) => [(v as number)?.toLocaleString("ru-RU") ?? "0", "Объектов"]}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName ?? label}
          />
          <Bar dataKey="total" fill="#3772ff" radius={[0, 6, 6, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
