import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color?: string;
  bg?: string;
  positive?: boolean;
}

export function MetricCard({ label, value, sub, icon: Icon, color = "#3772ff", bg = "#eff4ff" }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-neutral-500 leading-snug max-w-[75%]">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold text-neutral-900 tabular-nums">
        {typeof value === "number" ? value.toLocaleString("ru-RU") : value}
      </div>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}
