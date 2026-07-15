"use client";

import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Send, ClipboardList, FileText, Briefcase,
  Layers, CreditCard, Building2, ChevronRight, MapPin, Calendar,
} from "lucide-react";
import type { PassportFormValues } from "@/lib/passports/detail-types";
import type { PassportFormData } from "@/lib/passports/form-data";
import type { ReferenceData } from "@/lib/passports/types";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "section-delivery",      label: "Статус отправки",         icon: Send,         color: "text-sky-400",     dot: "bg-sky-500"     },
  { id: "section-status",        label: "Статус согласования",     icon: ClipboardList, color: "text-emerald-400", dot: "bg-emerald-500" },
  { id: "section-legal",         label: "Юридическая информация",  icon: FileText,      color: "text-violet-400",  dot: "bg-violet-500"  },
  { id: "section-activity",      label: "Деятельность",            icon: Briefcase,     color: "text-amber-400",   dot: "bg-amber-500"   },
  { id: "section-accessibility", label: "Доступность объекта",     icon: Layers,        color: "text-cyan-400",    dot: "bg-cyan-500"    },
  { id: "section-cost",          label: "Стоимость реконструкции", icon: CreditCard,    color: "text-yellow-400",  dot: "bg-yellow-500"  },
  { id: "section-dept",          label: "Ответственный орган",     icon: Building2,     color: "text-indigo-400",  dot: "bg-indigo-500"  },
] as const;

// ─── Status badge ─────────────────────────────────────────────────────────────

function badgeVariant(label: string): "green" | "amber" | "neutral" {
  const l = label.toLowerCase();
  if (l.includes("согласован") || (l.includes("отправлен") && !l.includes("не"))) return "green";
  if (l.includes("не") || l.includes("отклон") || l.includes("ожидан")) return "amber";
  return "neutral";
}

function StatusBadge({ label }: { label: string }) {
  const v = badgeVariant(label);
  const cls = {
    green:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber:   "bg-amber-500/10  text-amber-400  border-amber-500/20",
    neutral: "bg-foreground/[0.06] text-foreground/50 border-foreground/10",
  }[v];
  return (
    <span className={cn("inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-lg border leading-none", cls)}>
      {label}
    </span>
  );
}

// ─── Criteria progress ────────────────────────────────────────────────────────

function CriteriaProgress({ total }: { total: number }) {
  // Stable array — only rebuilds when `total` changes (never during interaction)
  const names = useMemo(
    () => Array.from({ length: total }, (_, i) => `checklist.${i}.is_adapted` as const),
    [total],
  );
  const values = useWatch<PassportFormValues>({ name: names });
  const adapted = (Array.isArray(values) ? (values as boolean[]) : []).filter(Boolean).length;
  const pct     = total > 0 ? Math.round((adapted / total) * 100) : 0;

  const barColor = pct === 100 ? "from-emerald-500 to-emerald-400"
    : pct >= 66 ? "from-brand to-brand/70"
    : pct >= 33 ? "from-amber-500 to-amber-400"
    : "from-red-500 to-red-400";

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-foreground/40 font-medium">Критерии</span>
        <span className="text-sm font-bold tabular-nums text-foreground">
          {adapted}
          <span className="text-xs text-foreground/30 font-normal">/{total}</span>
        </span>
      </div>

      {/* Segmented progress */}
      <div className="relative h-2 bg-foreground/[0.06] rounded-full overflow-hidden">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-[width] duration-700", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-foreground/30">
        <span>{pct}% выполнено</span>
        {pct === 100 && <span className="text-emerald-400 font-medium">Готово ✓</span>}
        {pct < 100 && <span>{total - adapted} осталось</span>}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type Props = { formData: PassportFormData; refs: ReferenceData };

export function PassportSidebar({ formData, refs }: Props) {
  const statusVal   = useWatch<PassportFormValues>({ name: "status" });
  const deliveryVal = useWatch<PassportFormValues>({ name: "delivery_status" });

  const statusLabel   = refs.statuses.find((s) => String(s.id) === String(statusVal))?.name_ru        ?? "—";
  const deliveryLabel = refs.deliveryStatuses.find((s) => String(s.id) === String(deliveryVal))?.name_ru ?? "—";

  return (
    <aside className="w-56 xl:w-64 shrink-0 self-start sticky top-6 space-y-3">

      {/* ── Info card ── */}
      <div className="relative rounded-2xl border border-foreground/[0.07] bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] overflow-hidden p-4 space-y-4">
        {/* top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

        {/* Object meta */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-foreground/30 font-semibold uppercase tracking-widest">
            ID {formData.id}
          </p>
          <p className="text-sm font-semibold text-foreground leading-snug">
            {formData.name_ru?.trim() || formData.name_kz?.trim() || "Без названия"}
          </p>
          {formData.address && (
            <div className="flex items-start gap-1.5 pt-0.5">
              <MapPin className="w-3 h-3 text-foreground/25 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-[11px] text-foreground/40 leading-snug">{formData.address}</p>
            </div>
          )}
        </div>

        {/* Statuses */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-foreground/30 font-medium uppercase tracking-wide">Согласование</span>
            <StatusBadge label={statusLabel} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-foreground/30 font-medium uppercase tracking-wide">Отправка</span>
            <StatusBadge label={deliveryLabel} />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-foreground/[0.06]" />

        {/* Progress */}
        <CriteriaProgress total={formData.checklist.length} />

        {/* Updated at */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Calendar className="w-3 h-3 text-foreground/25 shrink-0" aria-hidden="true" />
          <p className="text-[11px] text-foreground/30">
            {new Date(formData.updated_at).toLocaleDateString("ru-RU", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav
        aria-label="Разделы формы"
        className="relative rounded-2xl border border-foreground/[0.07] bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] overflow-hidden p-2"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        <p className="text-[10px] text-foreground/30 font-semibold uppercase tracking-widest px-2 py-1.5">
          Разделы
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon, color, dot }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="group flex items-center gap-2.5 px-2 py-2 rounded-xl text-xs text-foreground/45 hover:text-foreground hover:bg-foreground/[0.05] transition-all duration-150"
              >
                <span className={cn("w-1 h-1 rounded-full shrink-0 opacity-50 group-hover:opacity-100 transition-opacity", dot)} />
                <Icon className={cn("w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-all", color)} aria-hidden="true" />
                <span className="flex-1 leading-tight truncate">{label}</span>
                <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-30 group-hover:translate-x-0 transition-all duration-150" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

    </aside>
  );
}
