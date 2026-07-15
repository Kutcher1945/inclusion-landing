"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChecklistItem, PassportFormValues } from "@/lib/passports/detail-types";

type GroupEntry = { item: ChecklistItem; formIndex: number };
type ChecklistGroup = { category: string; entries: GroupEntry[] };

function extractCategory(criterionText: string): string {
  const dashPos = criterionText.indexOf(" - ");
  return dashPos !== -1 ? criterionText.slice(0, dashPos) : criterionText;
}

function subLabel(criterionText: string): string {
  const dashPos = criterionText.indexOf(" - ");
  return dashPos !== -1 ? criterionText.slice(dashPos + 3) : criterionText;
}

function groupChecklist(items: ChecklistItem[]): ChecklistGroup[] {
  const groups: ChecklistGroup[] = [];
  const groupMap = new Map<string, ChecklistGroup>();

  items.forEach((item, formIndex) => {
    const category = extractCategory(item.criterion_text);
    if (!groupMap.has(category)) {
      const group: ChecklistGroup = { category, entries: [] };
      groupMap.set(category, group);
      groups.push(group);
    }
    groupMap.get(category)!.entries.push({ item, formIndex });
  });

  return groups;
}

function GroupAdaptedBadge({ formIndices }: { formIndices: number[] }) {
  const values = useWatch<PassportFormValues>({
    name: formIndices.map((i) => `checklist.${i}.is_adapted` as const),
  });
  const adaptedCount = Array.isArray(values) ? values.filter(Boolean).length : 0;
  const total = formIndices.length;

  return (
    <span className={cn(
      "text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
      adaptedCount === total && total > 0
        ? "bg-green-100 text-green-700"
        : adaptedCount === 0
        ? "bg-gray-100 text-gray-500"
        : "bg-amber-100 text-amber-700",
    )}>
      {adaptedCount}/{total}
    </span>
  );
}

type GroupPanelProps = {
  group: ChecklistGroup;
  lockedCriterionIndices: Set<number>;
};

function ChecklistGroupPanel({ group, lockedCriterionIndices }: GroupPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { register } = useFormContext<PassportFormValues>();
  const formIndices = group.entries.map((e) => e.formIndex);
  const panelId = `checklist-panel-${group.category.replace(/\s+/g, "-")}`;
  const triggerId = `checklist-trigger-${group.category.replace(/\s+/g, "-")}`;

  return (
    <div className="border border-foreground/8 rounded-xl overflow-hidden">
      <button
        id={triggerId}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50/80 transition-colors text-left"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium text-sm text-foreground truncate">{group.category}</span>
          <GroupAdaptedBadge formIndices={formIndices} />
        </div>
        {isOpen
          ? <ChevronUp className="w-4 h-4 text-foreground/40 shrink-0" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-foreground/40 shrink-0" aria-hidden="true" />}
      </button>

      {isOpen && (
        <div id={panelId} role="region" aria-labelledby={triggerId} className="divide-y divide-foreground/5 bg-white/50">
          {group.entries.map(({ item, formIndex }) => {
            const isLocked = lockedCriterionIndices.has(item.index);
            return (
              <div key={item.index} className={cn("px-4 py-3 space-y-2", isLocked && "opacity-60")}>
                <input
                  type="hidden"
                  {...register(`checklist.${formIndex}.index` as const, { valueAsNumber: true })}
                />
                <label className={cn("flex items-start gap-2.5", isLocked ? "cursor-not-allowed" : "cursor-pointer")}>
                  <input
                    type="checkbox"
                    {...register(`checklist.${formIndex}.is_adapted` as const)}
                    onClick={(e) => { if (isLocked) e.preventDefault(); }}
                    className="mt-0.5 rounded border-gray-300 text-brand focus:ring-brand focus:ring-offset-0"
                  />
                  <span className="text-xs text-foreground/80 leading-relaxed flex-1">
                    {subLabel(item.criterion_text)}
                  </span>
                  {isLocked && (
                    <span className="shrink-0 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      Не требуется
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  {...register(`checklist.${formIndex}.actual_value` as const)}
                  disabled={isLocked}
                  placeholder="Фактическое значение"
                  className="w-full text-xs px-2.5 py-1.5 border border-foreground/15 rounded-lg bg-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 placeholder:text-foreground/30 transition disabled:bg-gray-50 disabled:opacity-50"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type ChecklistSectionProps = {
  items: ChecklistItem[];
  lockedCriterionIndices?: Set<number>;
};

export function ChecklistSection({ items, lockedCriterionIndices }: ChecklistSectionProps) {
  const locked = lockedCriterionIndices ?? new Set<number>();
  const groups = groupChecklist(items);

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <ChecklistGroupPanel key={group.category} group={group} lockedCriterionIndices={locked} />
      ))}
    </div>
  );
}
