import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color?: string;
  positive?: boolean;
}

export function MetricCard({ label, value, sub, icon: Icon, color = "#3772ff" }: MetricCardProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-foreground/8 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-foreground/50 leading-snug max-w-[75%]">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "color-mix(in srgb, " + color + " 14%, transparent)" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground tabular-nums">
        {typeof value === "number" ? value.toLocaleString("ru-RU") : value}
      </div>
      {sub && <p className="text-xs text-foreground/40 mt-1">{sub}</p>}
    </div>
  );
}
