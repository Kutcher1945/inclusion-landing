"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ActivityKozsDetail } from "@/lib/api";

interface Props { data: ActivityKozsDetail[] }

function KozsBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-1.5 min-w-[70px]">
      <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
        <div style={{ width: `${pct}%`, background: color }} className="h-full" />
      </div>
      <span className="text-xs tabular-nums text-neutral-500 w-6 text-right">{pct}%</span>
    </div>
  );
}

export function ActivityDetailTable({ data }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Group by type_of_activity
  const grouped = new Map<string, ActivityKozsDetail[]>();
  for (const row of data) {
    const type = row.type_of_activity__name_ru ?? "—";
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(row);
  }

  // Compute type-level totals
  const typeTotals = new Map<string, { total: number; k: number; o: number; s: number; z: number }>();
  for (const [type, rows] of grouped) {
    typeTotals.set(type, {
      total: rows.reduce((s, r) => s + r.total, 0),
      k:     rows.reduce((s, r) => s + r.k_access, 0),
      o:     rows.reduce((s, r) => s + r.o_access, 0),
      s:     rows.reduce((s, r) => s + r.s_access, 0),
      z:     rows.reduce((s, r) => s + r.z_access, 0),
    });
  }

  const toggle = (type: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const sortedTypes = Array.from(grouped.keys()).sort(
    (a, b) => (typeTotals.get(b)?.total ?? 0) - (typeTotals.get(a)?.total ?? 0)
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-50">
        <h3 className="font-semibold text-neutral-900 text-sm">Виды и подвиды деятельности · К/О/С/З</h3>
        <p className="text-xs text-neutral-400 mt-0.5">Нажмите на вид чтобы раскрыть подвиды</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-50 bg-neutral-50">
              <th className="text-left px-5 py-2.5 text-neutral-500 font-semibold uppercase tracking-wide w-[40%]">
                Вид / Подвид
              </th>
              <th className="text-right px-3 py-2.5 text-neutral-500 font-semibold uppercase tracking-wide">
                Всего
              </th>
              <th className="px-4 py-2.5 text-[#3772ff] font-bold">К</th>
              <th className="px-4 py-2.5 text-[#8b5cf6] font-bold">О</th>
              <th className="px-4 py-2.5 text-[#10b981] font-bold">С</th>
              <th className="px-4 py-2.5 text-[#f59e0b] font-bold">З</th>
            </tr>
          </thead>
          <tbody>
            {sortedTypes.map((type) => {
              const t = typeTotals.get(type)!;
              const isOpen = expanded.has(type);
              const subs = grouped.get(type)!.filter((r) => r.sub_type_of_activity__name_ru);
              const hasSubs = subs.length > 0;

              return (
                <>
                  {/* Type row */}
                  <tr
                    key={`type-${type}`}
                    className="border-b border-neutral-50 bg-neutral-50/60 hover:bg-neutral-100/60 transition-colors cursor-pointer"
                    onClick={() => hasSubs && toggle(type)}
                  >
                    <td className="px-5 py-2.5 font-semibold text-neutral-800">
                      <div className="flex items-center gap-2">
                        {hasSubs ? (
                          isOpen
                            ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            : <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        ) : (
                          <span className="w-3.5 shrink-0" />
                        )}
                        <span className="truncate max-w-[320px]">{type}</span>
                        {hasSubs && (
                          <span className="text-[10px] text-neutral-400 font-normal shrink-0">
                            {subs.length} подвида
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-bold text-neutral-900">
                      {t.total.toLocaleString("ru-RU")}
                    </td>
                    <td className="px-4 py-2.5">
                      <KozsBar value={t.k} total={t.total} color="#3772ff" />
                    </td>
                    <td className="px-4 py-2.5">
                      <KozsBar value={t.o} total={t.total} color="#8b5cf6" />
                    </td>
                    <td className="px-4 py-2.5">
                      <KozsBar value={t.s} total={t.total} color="#10b981" />
                    </td>
                    <td className="px-4 py-2.5">
                      <KozsBar value={t.z} total={t.total} color="#f59e0b" />
                    </td>
                  </tr>

                  {/* Subtype rows */}
                  {isOpen && subs.map((sub, si) => (
                    <tr
                      key={`sub-${type}-${si}`}
                      className="border-b border-neutral-50 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="pl-11 pr-5 py-2 text-neutral-600">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
                          <span className="truncate max-w-[300px]">
                            {sub.sub_type_of_activity__name_ru}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-neutral-600 font-medium">
                        {sub.total.toLocaleString("ru-RU")}
                      </td>
                      <td className="px-4 py-2">
                        <KozsBar value={sub.k_access} total={sub.total} color="#3772ff" />
                      </td>
                      <td className="px-4 py-2">
                        <KozsBar value={sub.o_access} total={sub.total} color="#8b5cf6" />
                      </td>
                      <td className="px-4 py-2">
                        <KozsBar value={sub.s_access} total={sub.total} color="#10b981" />
                      </td>
                      <td className="px-4 py-2">
                        <KozsBar value={sub.z_access} total={sub.total} color="#f59e0b" />
                      </td>
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
