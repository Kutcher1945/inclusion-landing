import { cn } from "@/lib/utils";

export type StatusVariant = "green" | "amber" | "blue" | "red" | "gray" | "purple";

export function statusVariant(statusId: number | null): StatusVariant {
  switch (statusId) {
    case 1: return "green";
    case 2: return "amber";
    case 3: return "blue";
    case 4: return "red";
    default: return "gray";
  }
}

const PILL_STYLES: Record<StatusVariant, { bg: string; text: string; dot: string }> = {
  green:  { bg: "bg-green-50",   text: "text-green-700",   dot: "bg-green-500" },
  amber:  { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  blue:   { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  red:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  gray:   { bg: "bg-gray-100",   text: "text-gray-500",    dot: "bg-gray-400" },
  purple: { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500" },
};

export function StatusPill({ label, variant }: { label: string; variant: StatusVariant }) {
  const s = PILL_STYLES[variant];
  const clean = label.replace(/^[\p{Emoji}\s]+/u, "").trim();
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", s.bg, s.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
      {clean || label}
    </span>
  );
}

export function criteriaBarColor(pct: number): string {
  if (pct >= 87) return "#10b981";
  if (pct >= 70) return "#3772ff";
  if (pct >= 40) return "#f59e0b";
  if (pct > 0) return "#f97316";
  return "#ef4444";
}

export function DeliveryPill({ label, sent }: { label: string; sent: boolean }) {
  const clean = label.replace(/^[\p{Emoji}\s]+/u, "").trim();
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        {clean || label}
      </span>
    );
  }
  return <span className="text-xs text-foreground/30">{clean || label}</span>;
}
