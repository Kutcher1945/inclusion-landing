"use client";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Trends } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  data: Trends;
  onPeriodChange: (p: string) => void;
  period: string;
  loading?: boolean;
}

const PERIODS = [
  { value: "day",   label: "30 дней" },
  { value: "month", label: "3 месяца" },
  { value: "week",  label: "12 недель" },
  { value: "year",  label: "Год" },
];

export function TrendsChart({ data, onPeriodChange, period, loading }: Props) {
  const { resolvedTheme } = useTheme();
  const tickFill = resolvedTheme === "dark" ? "rgba(255,255,255,0.4)" : "#9ca3af";

  const mergedDates = new Set([
    ...data.created_objects.map((d) => d.date),
    ...data.updated_objects.map((d) => d.date),
  ]);

  const createdMap = Object.fromEntries(data.created_objects.map((d) => [d.date, d.count]));
  const updatedMap = Object.fromEntries(data.updated_objects.map((d) => [d.date, d.count]));

  const chartData = Array.from(mergedDates)
    .sort()
    .map((date) => ({
      date: new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
      created: createdMap[date] ?? 0,
      updated: updatedMap[date] ?? 0,
    }));

  return (
    <div className="bg-surface rounded-2xl p-7 border border-foreground/8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Динамика активности</h3>
          <p className="text-sm text-foreground/40">Создание и обновление паспортов</p>
        </div>
        <div className="flex items-center gap-1 bg-foreground/8 p-1 rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                period === p.value
                  ? "bg-surface shadow-sm text-foreground"
                  : "text-foreground/50 hover:text-foreground/75"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[240px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#3772ff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: tickFill }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: tickFill }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.16)",
                background: "var(--surface)", color: "var(--foreground)",
              }}
              formatter={(v, name) => [(v as number), name === "created" ? "Создано" : "Обновлено"]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => value === "created" ? "Создано" : "Обновлено"}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="created"
              stroke="#3772ff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="updated"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
