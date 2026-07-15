"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PassportFormValues } from "@/lib/passports/detail-types";
import type { ChecklistFormItem, CriterionDisplay } from "@/lib/passports/form-data";
import { PhotoStrip } from "./PhotoStrip";

// ─── Static structure (mirrors Django admin fieldsets) ─────────────────────────

type SubGroupDef = {
  field: keyof PassportFormValues;
  label: string;
  indices: number[];
};

type SectionDef = {
  key: string;
  label: string;
  subGroups: SubGroupDef[];
};

const SECTIONS: SectionDef[] = [
  {
    key: "territory",
    label: "Территория объекта",
    subGroups: [
      { field: "is_available_allocated_area",        label: "Отведенная территория",          indices: [81, 82] },
      { field: "is_available_parking",               label: "Автостоянка посетителей",        indices: [83,84,85,86,87] },
      { field: "is_available_path_to_main_entrance", label: "Путь к главному входу",           indices: [88,89,90,91,92] },
    ],
  },
  {
    key: "entry_group",
    label: "Входная группа",
    subGroups: [
      { field: "is_available_porch",   label: "Крыльцо и входная площадка", indices: [1,2,3,4,5,6,7,93,94,95,96,97] },
      { field: "is_available_stair",   label: "Лестница",                   indices: [8,9,10,11,12,13,14,15,16,17,18,19] },
      { field: "is_available_ramp",    label: "Пандус",                     indices: [20,21,22,23,24,25,26] },
      { field: "is_available_hoist",   label: "Подъемник",                  indices: [27] },
      { field: "is_available_tambour", label: "Тамбур",                     indices: [28,29,30,31] },
    ],
  },
  {
    key: "movement",
    label: "Пути движения",
    subGroups: [
      { field: "is_available_corridor",    label: "Коридоры и холлы",  indices: [32,33,34,35] },
      { field: "is_available_elevator",    label: "Лифт пассажирский", indices: [36,37,38,39,40,41,42] },
      { field: "is_available_traffic_path",label: "Путь движения",     indices: [] },
    ],
  },
  {
    key: "service",
    label: "Зоны оказания услуг",
    subGroups: [
      { field: "is_available_window",         label: "Обслуживание через окно/прилавок",   indices: [43,44,45] },
      { field: "is_available_cabinet",        label: "Обслуживание в зале/кабинете",       indices: [46,47,48,49] },
      { field: "is_available_walk_in_service",label: "Обслуживание с перемещением",        indices: [50,51] },
      { field: "is_available_service_cabin",  label: "Кабина индивидуального обслуживания",indices: [52,53,54,55,56] },
    ],
  },
  {
    key: "sanitary",
    label: "Санитарно-бытовые помещения",
    subGroups: [
      { field: "is_available_bathroom", label: "Санузел", indices: [57,58,59,60,61,62,63,64,65,66,67] },
    ],
  },
  {
    key: "media",
    label: "Средства информации и телекоммуникации",
    subGroups: [
      { field: "is_available_visual_means",   label: "Визуальные средства",   indices: [68,69,70,71,72] },
      { field: "is_available_acoustic_means", label: "Акустические средства", indices: [78,79,80] },
      { field: "is_available_tactile_means",  label: "Тактильные средства",   indices: [73,74,75,76,77] },
    ],
  },
];

// Flat ordered list: [[field, indices], ...] — order must match IS_AVAILABLE_NAMES
const IS_AVAILABLE_ENTRIES: [keyof PassportFormValues, number[]][] = SECTIONS
  .flatMap((s) => s.subGroups)
  .map(({ field, indices }) => [field, indices]);

// Stable module-level array — never recreated; safe as useWatch `name` dep
const IS_AVAILABLE_NAMES = IS_AVAILABLE_ENTRIES.map(([f]) => f) as (keyof PassportFormValues)[];

// ─── Types ─────────────────────────────────────────────────────────────────────

type CriterionEntry = { item: ChecklistFormItem; formIndex: number; criterionText: string };

// Criteria 93-95 use a free-text CharField; all others are FK to InclusionRecommendation.
const TEXT_RECOMMENDATION_INDICES = new Set([93, 94, 95]);

// ─── Criterion row ──────────────────────────────────────────────────────────────

const inputCls = "w-full text-xs px-2.5 py-1.5 border border-foreground/15 rounded-lg bg-surface text-foreground focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 placeholder:text-foreground/30 transition disabled:bg-surface-muted disabled:opacity-50";

function CriterionRow({ entry, isLocked }: { entry: CriterionEntry; isLocked: boolean }) {
  const { register, setValue } = useFormContext<PassportFormValues>();
  const { item, formIndex, criterionText } = entry;
  const sublabel = (() => {
    const pos = criterionText.indexOf(" - ");
    return pos !== -1 ? criterionText.slice(pos + 3) : criterionText;
  })();

  const isTextRec = TEXT_RECOMMENDATION_INDICES.has(item.index);
  const hasFkRec  = !isTextRec && item.recommendation != null;

  return (
    <div className={cn("px-4 py-2.5 space-y-1.5 border-b border-foreground/[0.04] last:border-0", isLocked && "opacity-55")}>
      <input type="hidden" {...register(`checklist.${formIndex}.index` as const, { valueAsNumber: true })} />
      <label className={cn("flex items-start gap-2.5", isLocked ? "cursor-not-allowed" : "cursor-pointer")}>
        <input
          type="checkbox"
          {...register(`checklist.${formIndex}.is_adapted` as const)}
          onClick={(e) => { if (isLocked) e.preventDefault(); }}
          className="mt-0.5 rounded border-gray-300 text-brand focus:ring-brand focus:ring-offset-0 shrink-0"
        />
        <span className="text-xs text-foreground/75 leading-relaxed flex-1">{sublabel}</span>
        {isLocked && (
          <span className="shrink-0 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
            Не требуется
          </span>
        )}
      </label>

      <div className="grid grid-cols-2 gap-1.5">
        <input
          type="text"
          {...register(`checklist.${formIndex}.actual_value` as const)}
          disabled={isLocked}
          placeholder="Фактическое значение"
          className={inputCls}
        />

        {/* Text-type recommendations (criteria 93-95): free-text input */}
        {isTextRec && (
          <input
            type="text"
            {...register(`checklist.${formIndex}.recommendation` as const)}
            disabled={isLocked}
            placeholder="Рекомендация"
            className={inputCls}
          />
        )}

        {/* FK-type recommendations: show chip + clear button if a value is set.
            A proper dropdown requires a /recommendations/?sub_sub_category_id=N
            endpoint — planned for V2 (see docs/v2-model-design.md). */}
        {hasFkRec && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-foreground/[0.03] border border-foreground/[0.07] min-w-0">
            <span className="text-[10px] text-foreground/40 truncate flex-1">
              Рекомендация #{item.recommendation}
            </span>
            {!isLocked && (
              <button
                type="button"
                aria-label="Убрать рекомендацию"
                onClick={() => setValue(`checklist.${formIndex}.recommendation`, "", { shouldDirty: true })}
                className="shrink-0 text-foreground/25 hover:text-red-400 transition-colors text-xs leading-none"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Hidden input keeps the form value in sync for FK type */}
        {!isTextRec && (
          <input type="hidden" {...register(`checklist.${formIndex}.recommendation` as const)} />
        )}
      </div>
    </div>
  );
}

// ─── Sub-group (is_available_X + its criteria) ─────────────────────────────────

type SubGroupProps = {
  def: SubGroupDef;
  indexMap: Map<number, CriterionEntry>;
  lockedIndices: Set<number>;
};

function SubGroup({ def, indexMap, lockedIndices }: SubGroupProps) {
  const { register } = useFormContext<PassportFormValues>();
  const isLocked = Boolean(useWatch<PassportFormValues>({ name: def.field as keyof PassportFormValues }));
  const entries = def.indices.map((i) => indexMap.get(i)).filter((e): e is CriterionEntry => Boolean(e));

  return (
    <div className={cn(
      "rounded-xl overflow-hidden mb-2 last:mb-0 border transition-all duration-200",
      isLocked
        ? "border-amber-500/20 bg-amber-500/[0.03]"
        : "border-foreground/[0.07] bg-foreground/[0.02]",
    )}>
      {/* Sub-group header */}
      <div className="flex items-center gap-3 px-3.5 py-2.5">
        <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
          <input
            type="checkbox"
            {...register(def.field)}
            className="w-4 h-4 rounded border-foreground/20 bg-foreground/[0.06] text-amber-500 focus:ring-amber-400/30 focus:ring-offset-0 shrink-0 transition-colors"
          />
          <span className={cn(
            "text-xs font-semibold truncate transition-colors",
            isLocked ? "text-amber-400" : "text-foreground/65",
          )}>
            {def.label}
          </span>
        </label>
        {isLocked && (
          <span className="shrink-0 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Не требуется
          </span>
        )}
        {entries.length > 0 && <SubGroupBadge entries={entries} />}
      </div>

      {/* Criteria rows */}
      {entries.length > 0 && (
        <div className="border-t border-foreground/[0.05]">
          {entries.map((entry) => (
            <CriterionRow
              key={entry.item.index}
              entry={entry}
              isLocked={lockedIndices.has(entry.item.index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubGroupBadge({ entries }: { entries: CriterionEntry[] }) {
  const names = useMemo(
    () => entries.map((e) => `checklist.${e.formIndex}.is_adapted` as const),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries.length, entries[0]?.formIndex],
  );
  const values = useWatch<PassportFormValues>({ name: names });
  const adapted = Array.isArray(values) ? values.filter(Boolean).length : 0;
  const total = entries.length;
  return (
    <span className={cn(
      "shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums border",
      adapted === total
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : adapted === 0
        ? "bg-foreground/[0.06] text-foreground/40 border-foreground/10"
        : "bg-amber-500/10 text-amber-400 border-amber-500/20",
    )}>
      {adapted}/{total}
    </span>
  );
}

// ─── Main section panel ─────────────────────────────────────────────────────────

type SectionPanelProps = {
  section: SectionDef;
  indexMap: Map<number, CriterionEntry>;
  lockedIndices: Set<number>;
  photos: (string | null)[];
};

function SectionPanel({ section, indexMap, lockedIndices, photos }: SectionPanelProps) {
  const [open, setOpen] = useState(false);
  const allIndices = section.subGroups.flatMap((g) => g.indices);
  const allEntries = allIndices.map((i) => indexMap.get(i)).filter((e): e is CriterionEntry => Boolean(e));

  return (
    <div className="rounded-xl overflow-hidden border border-foreground/[0.07] bg-foreground/[0.01]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-foreground/[0.03] transition-colors text-left group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
            open ? "bg-brand" : "bg-foreground/20",
          )} />
          <span className="font-semibold text-sm text-foreground truncate">{section.label}</span>
          {allEntries.length > 0 && <SectionBadge entries={allEntries} />}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-foreground/30 shrink-0 group-hover:text-foreground/60 transition-colors" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-foreground/30 shrink-0 group-hover:text-foreground/60 transition-colors" aria-hidden="true" />}
      </button>

      {open && (
        <div className="px-4 pt-3 pb-1 space-y-0">
          {section.subGroups.map((sg) => (
            <SubGroup
              key={String(sg.field)}
              def={sg}
              indexMap={indexMap}
              lockedIndices={lockedIndices}
            />
          ))}
          <PhotoStrip urls={photos} className="pt-2 pb-1" />
        </div>
      )}
    </div>
  );
}

function SectionBadge({ entries }: { entries: CriterionEntry[] }) {
  const names = useMemo(
    () => entries.map((e) => `checklist.${e.formIndex}.is_adapted` as const),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries.length, entries[0]?.formIndex],
  );
  const values = useWatch<PassportFormValues>({ name: names });
  const adapted = Array.isArray(values) ? values.filter(Boolean).length : 0;
  const total = entries.length;
  return (
    <span className={cn(
      "text-[10px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums border shrink-0",
      adapted === total
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : adapted === 0
        ? "bg-foreground/[0.06] text-foreground/40 border-foreground/10"
        : "bg-amber-500/10 text-amber-400 border-amber-500/20",
    )}>
      {adapted}/{total}
    </span>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────────

export type AccessibilityPhotos = {
  siteArea:                   (string | null)[];
  entryGroup:                 (string | null)[];
  pathOfTravel:               (string | null)[];
  serviceDeliveryArea:        (string | null)[];
  sanitaryFacilities:         (string | null)[];
  mediaAndTelecommunications: (string | null)[];
};

const SECTION_PHOTOS: Record<string, keyof AccessibilityPhotos> = {
  territory:   "siteArea",
  entry_group: "entryGroup",
  movement:    "pathOfTravel",
  service:     "serviceDeliveryArea",
  sanitary:    "sanitaryFacilities",
  media:       "mediaAndTelecommunications",
};

type Props = {
  checklistItems: ChecklistFormItem[];
  criterionDisplay: CriterionDisplay[];
  photos: AccessibilityPhotos;
};

export function AccessibilityAccordion({ checklistItems, criterionDisplay, photos }: Props) {
  const { setValue } = useFormContext<PassportFormValues>();

  // Stable lookup: only rebuilt when checklistItems/criterionDisplay changes
  const indexMap = useMemo(() => {
    const textMap = new Map(criterionDisplay.map((c) => [c.index, c.text]));
    return new Map<number, CriterionEntry>(
      checklistItems.map((item, formIndex) => [item.index, {
        item,
        formIndex,
        criterionText: textMap.get(item.index) ?? "",
      }])
    );
  }, [checklistItems, criterionDisplay]);

  // Subscribe only to the 19 is_available_* fields — not all 200+ form fields
  const isAvailableValues = useWatch<PassportFormValues>({ name: IS_AVAILABLE_NAMES });

  // Compute locked indices without calling watch() on the entire form
  const lockedIndices = useMemo(() => {
    const locked = new Set<number>();
    IS_AVAILABLE_ENTRIES.forEach(([, indices], i) => {
      if ((isAvailableValues as boolean[])[i]) indices.forEach((idx) => locked.add(idx));
    });
    return locked;
  }, [isAvailableValues]);

  // Auto-set criteria when an is_available_* changes; skip on initial mount
  const prevValuesRef = useRef<boolean[] | null>(null);
  useEffect(() => {
    const curr = isAvailableValues as boolean[];
    if (prevValuesRef.current === null) {
      prevValuesRef.current = curr.map(Boolean);
      return;
    }
    curr.forEach((val, i) => {
      if (prevValuesRef.current![i] !== Boolean(val)) {
        const [, indices] = IS_AVAILABLE_ENTRIES[i];
        const checked = Boolean(val);
        indices.forEach((criterionIdx) => {
          const fe = indexMap.get(criterionIdx);
          if (fe) setValue(`checklist.${fe.formIndex}.is_adapted`, checked, { shouldDirty: true });
        });
      }
    });
    prevValuesRef.current = curr.map(Boolean);
  }, [isAvailableValues, indexMap, setValue]);

  return (
    <div className="space-y-2">
      {SECTIONS.map((section) => (
        <SectionPanel
          key={section.key}
          section={section}
          indexMap={indexMap}
          lockedIndices={lockedIndices}
          photos={photos[SECTION_PHOTOS[section.key]] ?? []}
        />
      ))}
    </div>
  );
}
