"use client";
import type { DistrictKozs } from "@/lib/api";

interface Props { data: DistrictKozs[] }

function PctBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full bg-foreground/8 overflow-hidden">
        <div style={{ width: `${pct}%`, background: color }} className="h-full" />
      </div>
      <span className="text-xs tabular-nums text-foreground/50 w-7 text-right">{pct}%</span>
    </div>
  );
}

export function DistrictKozsTable({ data }: Props) {
  const rows = data.filter((d) => d.district__name_ru).slice(0, 15);

  return (
    <div className="bg-surface rounded-2xl border border-foreground/8 overflow-hidden">
      <div className="px-6 py-4 border-b border-foreground/5">
        <h3 className="font-semibold text-foreground text-sm">Доступность по районам</h3>
        <p className="text-xs text-foreground/40 mt-0.5">К/О/С/З — доля доступных объектов в районе (объекты-учреждения)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-foreground/5 bg-foreground/[0.04]">
              <th className="text-left px-5 py-2.5 text-foreground/50 font-semibold uppercase tracking-wide">Район</th>
              <th className="text-right px-3 py-2.5 text-foreground/50 font-semibold uppercase tracking-wide">Всего</th>
              <th className="px-4 py-2.5 text-[#3772ff] font-bold">К</th>
              <th className="px-4 py-2.5 text-[#8b5cf6] font-bold">О</th>
              <th className="px-4 py-2.5 text-[#10b981] font-bold">С</th>
              <th className="px-4 py-2.5 text-[#f59e0b] font-bold">З</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-foreground/[0.04] transition-colors">
                <td className="px-5 py-2.5 font-medium text-foreground/85 max-w-[180px] truncate">
                  {row.district__name_ru}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-foreground/60 font-semibold">
                  {row.total.toLocaleString("ru-RU")}
                </td>
                <td className="px-4 py-2.5">
                  <PctBar value={row.k_access} total={row.total} color="#3772ff" />
                </td>
                <td className="px-4 py-2.5">
                  <PctBar value={row.o_access} total={row.total} color="#8b5cf6" />
                </td>
                <td className="px-4 py-2.5">
                  <PctBar value={row.s_access} total={row.total} color="#10b981" />
                </td>
                <td className="px-4 py-2.5">
                  <PctBar value={row.z_access} total={row.total} color="#f59e0b" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
