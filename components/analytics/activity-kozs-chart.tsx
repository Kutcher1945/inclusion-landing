"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { ActivityKozs } from "@/lib/api";

interface Props { data: ActivityKozs[] }

export function ActivityKozsChart({ data }: Props) {
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
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h3 className="font-semibold text-neutral-900 text-sm mb-1">Доступность по видам деятельности</h3>
      <p className="text-xs text-neutral-400 mb-5">Число объектов с оценкой «Доступно» по К/О/С/З</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
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
