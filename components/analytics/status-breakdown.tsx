import type { Overview } from "@/lib/api";

function getColor(idx: number) {
  const palette = [
    { color: "#3772ff" },
    { color: "#10b981" },
    { color: "#f59e0b" },
    { color: "#ef4444" },
    { color: "#8b5cf6" },
    { color: "#0ea5e9" },
  ];
  return palette[idx % palette.length];
}

function cleanLabel(s: string | null): string {
  if (!s) return "—";
  // Strip leading emoji, symbols, checkmarks, etc.
  return s.replace(/^[\u2000-\u3300\u{1F000}-\u{1FFFF}\u2600-\u26FF\u2700-\u27BF✓✗✘✔■□▪▫●○•\s]+/u, "").trim();
}

interface Props { overview: Overview }

export function StatusBreakdown({ overview }: Props) {
  const byStatus = overview.by_status.filter((s) => s.status__name_ru);
  const byDelivery = overview.by_delivery_status.filter((s) => s.delivery_status__name_ru);

  const total = byStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status */}
      <div className="bg-surface rounded-2xl p-7 border border-foreground/8">
        <h3 className="font-semibold text-foreground mb-1">Статус объектов</h3>
        <p className="text-sm text-foreground/40 mb-5">Распределение по текущему статусу</p>
        <div className="space-y-3">
          {byStatus.map((s, i) => {
            const c = getColor(i);
            const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground/75 truncate max-w-[60%]">{cleanLabel(s.status__name_ru)}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-foreground/40">{s.count.toLocaleString("ru-RU")}</span>
                    <span className="text-xs font-semibold" style={{ color: c.color }}>{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-foreground/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery status */}
      <div className="bg-surface rounded-2xl p-7 border border-foreground/8">
        <h3 className="font-semibold text-foreground mb-1">Статус паспортов</h3>
        <p className="text-sm text-foreground/40 mb-5">По статусу отправки на согласование</p>
        <div className="space-y-3">
          {byDelivery.map((s, i) => {
            const c = getColor(i);
            const tot = byDelivery.reduce((sum, d) => sum + d.count, 0);
            const pct = tot > 0 ? Math.round((s.count / tot) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground/75 truncate max-w-[60%]">{cleanLabel(s.delivery_status__name_ru)}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-foreground/40">{s.count.toLocaleString("ru-RU")}</span>
                    <span className="text-xs font-semibold" style={{ color: c.color }}>{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-foreground/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
