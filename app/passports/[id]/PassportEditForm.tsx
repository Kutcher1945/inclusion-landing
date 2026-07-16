"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Send, ClipboardList, FileText, Briefcase,
  Layers, CreditCard, Building2,
} from "lucide-react";
import { AccessibilityAccordion } from "./AccessibilityAccordion";
import { PhotoStrip } from "./PhotoStrip";
import { PassportSidebar } from "./PassportSidebar";
import { FormSelect } from "./CustomSelect";
import { SectionCard, Field, TextareaField } from "../FormUI";
import type { PassportFormData, CriterionDisplay } from "@/lib/passports/form-data";
import type { PassportFormValues } from "@/lib/passports/detail-types";
import type { ReferenceData } from "@/lib/passports/types";

type Props = {
  formData: PassportFormData;
  criterionDisplay: CriterionDisplay[];
  refs: ReferenceData;
};

function toStr(v: string | number | null | undefined): string {
  return v != null ? String(v) : "";
}

function buildDefaultValues(p: PassportFormData): PassportFormValues {
  return {
    name_ru: toStr(p.name_ru), name_kz: toStr(p.name_kz),
    full_legal_name: toStr(p.full_legal_name), building: toStr(p.building),
    address: toStr(p.address), house_number: toStr(p.house_number),
    amount_of_floors: toStr(p.amount_of_floors), year_of_construction: toStr(p.year_of_construction),
    phone: toStr(p.phone), email: toStr(p.email),
    activity_description: toStr(p.activity_description),
    scope_of_services_provided: toStr(p.scope_of_services_provided),
    for_special_people: toStr(p.for_special_people),
    reason_of_cancelation: toStr(p.reason_of_cancelation),
    reason_of_delivery_cancelation: toStr(p.reason_of_delivery_cancelation),
    status: toStr(p.status), delivery_status: toStr(p.delivery_status),
    district: toStr(p.district), type_of_activity: toStr(p.type_of_activity),
    sub_type_of_activity: toStr(p.sub_type_of_activity),
    subject_of_ownership: toStr(p.subject_of_ownership), department: toStr(p.department),
    is_available_porch: p.is_available_porch, is_available_stair: p.is_available_stair,
    is_available_ramp: p.is_available_ramp, is_available_hoist: p.is_available_hoist,
    is_available_tambour: p.is_available_tambour, is_available_corridor: p.is_available_corridor,
    is_available_elevator: p.is_available_elevator, is_available_window: p.is_available_window,
    is_available_cabinet: p.is_available_cabinet,
    is_available_walk_in_service: p.is_available_walk_in_service,
    is_available_service_cabin: p.is_available_service_cabin, is_available_bathroom: p.is_available_bathroom,
    is_available_visual_means: p.is_available_visual_means,
    is_available_tactile_means: p.is_available_tactile_means,
    is_available_acoustic_means: p.is_available_acoustic_means,
    is_available_allocated_area: p.is_available_allocated_area,
    is_available_parking: p.is_available_parking,
    is_available_path_to_main_entrance: p.is_available_path_to_main_entrance,
    is_available_traffic_path: p.is_available_traffic_path,
    cost_reconstruction_stairs: toStr(p.cost_reconstruction_stairs),
    cost_reconstruction_corridor: toStr(p.cost_reconstruction_corridor),
    cost_installation_signs: toStr(p.cost_installation_signs),
    cost_engineering_services: toStr(p.cost_engineering_services),
    checklist: p.checklist.map((item) => ({
      index: item.index, is_adapted: item.is_adapted, actual_value: toStr(item.actual_value),
      recommendation: toStr(item.recommendation ?? ""),
    })),
  };
}

// Criteria 93-95 use a free-text CharField on the backend (not a FK).
// All other criteria use ForeignKey(InclusionRecommendation).
const TEXT_RECOMMENDATION_INDICES = new Set([93, 94, 95]);

function buildPatchPayload(values: PassportFormValues, formData: PassportFormData) {
  const nullIfEmpty = (v: string) => v.trim() === "" ? null : v.trim();
  const intOrNull   = (v: string) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; };
  void formData;
  return {
    name_ru: nullIfEmpty(values.name_ru), name_kz: nullIfEmpty(values.name_kz),
    full_legal_name: nullIfEmpty(values.full_legal_name), building: nullIfEmpty(values.building),
    address: nullIfEmpty(values.address), house_number: nullIfEmpty(values.house_number),
    amount_of_floors: intOrNull(values.amount_of_floors),
    year_of_construction: nullIfEmpty(values.year_of_construction),
    phone: nullIfEmpty(values.phone), email: nullIfEmpty(values.email),
    activity_description: nullIfEmpty(values.activity_description),
    scope_of_services_provided: intOrNull(values.scope_of_services_provided),
    for_special_people: intOrNull(values.for_special_people),
    reason_of_cancelation: nullIfEmpty(values.reason_of_cancelation),
    reason_of_delivery_cancelation: nullIfEmpty(values.reason_of_delivery_cancelation),
    status: intOrNull(values.status), delivery_status: intOrNull(values.delivery_status),
    district: intOrNull(values.district), type_of_activity: intOrNull(values.type_of_activity),
    sub_type_of_activity: intOrNull(values.sub_type_of_activity),
    subject_of_ownership: intOrNull(values.subject_of_ownership),
    department: intOrNull(values.department),
    is_available_porch: values.is_available_porch, is_available_stair: values.is_available_stair,
    is_available_ramp: values.is_available_ramp, is_available_hoist: values.is_available_hoist,
    is_available_tambour: values.is_available_tambour, is_available_corridor: values.is_available_corridor,
    is_available_elevator: values.is_available_elevator, is_available_window: values.is_available_window,
    is_available_cabinet: values.is_available_cabinet,
    is_available_walk_in_service: values.is_available_walk_in_service,
    is_available_service_cabin: values.is_available_service_cabin,
    is_available_bathroom: values.is_available_bathroom,
    is_available_visual_means: values.is_available_visual_means,
    is_available_tactile_means: values.is_available_tactile_means,
    is_available_acoustic_means: values.is_available_acoustic_means,
    is_available_allocated_area: values.is_available_allocated_area,
    is_available_parking: values.is_available_parking,
    is_available_path_to_main_entrance: values.is_available_path_to_main_entrance,
    is_available_traffic_path: values.is_available_traffic_path,
    cost_reconstruction_stairs: nullIfEmpty(values.cost_reconstruction_stairs),
    cost_reconstruction_corridor: nullIfEmpty(values.cost_reconstruction_corridor),
    cost_installation_signs: nullIfEmpty(values.cost_installation_signs),
    cost_engineering_services: nullIfEmpty(values.cost_engineering_services),
    checklist: values.checklist.map((item) => {
      const recStr = item.recommendation.trim();
      const recommendation = recStr === ""
        ? null
        : TEXT_RECOMMENDATION_INDICES.has(item.index)
          ? recStr                       // free-text for 93-95
          : intOrNull(recStr);           // FK ID for all other criteria
      return {
        index: item.index, is_adapted: item.is_adapted,
        actual_value: item.actual_value.trim() === "" ? null : item.actual_value,
        recommendation,
      };
    }),
  };
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function PassportEditForm({ formData, criterionDisplay, refs }: Props) {
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);

  const methods = useForm<PassportFormValues>({ defaultValues: buildDefaultValues(formData) });
  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = methods;

  async function onSubmit(values: PassportFormValues) {
    setSaveError(null); setSaved(false);
    const { patchPassport } = await import("@/lib/passports/browser-api");
    const result = await patchPassport(formData.id, buildPatchPayload(values, formData) as Record<string, unknown>);
    if (!result) { setSaveError("Не удалось сохранить. Проверьте данные и попробуйте снова."); return; }
    setSaved(true);
  }

  const statusOptions   = refs.statuses.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const deliveryOptions = refs.deliveryStatuses.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const districtOptions = refs.districts.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const typeOptions     = refs.activityTypes.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const subTypeOptions  = refs.activitySubTypes.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const deptOptions     = refs.departments.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* ── Main form ─────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1 min-w-0 space-y-4 pb-8">

          <SectionCard id="section-delivery" icon={Send} title="Статус отправки паспорта" color="sky">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect name="delivery_status" label="Статус отправки" options={deliveryOptions} />
            </div>
            <TextareaField label="Причина отклонения отправки" {...register("reason_of_delivery_cancelation")} placeholder="Укажите причину..." />
            <PhotoStrip urls={[formData.photos.notDelivered]} className="pt-1" />
          </SectionCard>

          <SectionCard id="section-status" icon={ClipboardList} title="Статус согласования объекта" color="emerald">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect name="status" label="Статус объекта" options={statusOptions} />
            </div>
            <TextareaField label="Причина отклонения" {...register("reason_of_cancelation")} placeholder="Укажите причину..." />
          </SectionCard>

          <SectionCard id="section-legal" icon={FileText} title="Юридическая информация" color="violet">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Наименование на русском"  {...register("name_ru")}  placeholder="Название на русском" />
              <Field label="Наименование на казахском" {...register("name_kz")}  placeholder="Атауы қазақша" />
            </div>
            <Field label="Полное юридическое наименование" {...register("full_legal_name")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Почтовый адрес ЮЛ"              {...register("building")} />
              <Field label="Адрес"                           {...register("address")} />
              <Field label="Номер дома"                      {...register("house_number")} />
              <FormSelect name="district" label="Район" options={districtOptions} />
              <Field label="Количество этажей" type="number" {...register("amount_of_floors")} />
              <Field label="Год постройки"                   {...register("year_of_construction")} placeholder="2000-01-01" />
              <Field label="Телефон"  type="tel"   {...register("phone")}  placeholder="+77011234567" />
              <Field label="Email"    type="email" {...register("email")}  placeholder="example@example.com" />
            </div>
          </SectionCard>

          <SectionCard id="section-activity" icon={Briefcase} title="Деятельность" color="amber">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect name="type_of_activity"     label="Вид деятельности"    options={typeOptions} />
              <FormSelect name="sub_type_of_activity" label="Подвид деятельности" options={subTypeOptions} />
              <Field label="Субъект собственности (ID)" type="number" {...register("subject_of_ownership")} />
            </div>
            <Field label="Описание вида деятельности" {...register("activity_description")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Объём предоставляемых услуг"     type="number" {...register("scope_of_services_provided")} />
              <Field label="В т.ч. для лиц с инвалидностью" type="number" {...register("for_special_people")} />
            </div>
          </SectionCard>

          <SectionCard
            id="section-accessibility"
            icon={Layers}
            title="Информация по доступности объектов"
            color="cyan"
            hint="Раскройте раздел и отметьте «Не требуется» для отсутствующих элементов — критерии будут отмечены автоматически."
          >
            <AccessibilityAccordion
              checklistItems={formData.checklist}
              criterionDisplay={criterionDisplay}
              photos={{
                siteArea:                   formData.photos.siteArea,
                entryGroup:                 formData.photos.entryGroup,
                pathOfTravel:               formData.photos.pathOfTravel,
                serviceDeliveryArea:        formData.photos.serviceDeliveryArea,
                sanitaryFacilities:         formData.photos.sanitaryFacilities,
                mediaAndTelecommunications: formData.photos.mediaAndTelecommunications,
              }}
            />
          </SectionCard>

          <SectionCard id="section-cost" icon={CreditCard} title="Стоимость реконструкции (тыс. тг)" color="yellow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Реконструкция лестницы"        type="number" step="0.01" {...register("cost_reconstruction_stairs")} />
              <Field label="Реконструкция коридора"        type="number" step="0.01" {...register("cost_reconstruction_corridor")} />
              <Field label="Тактильные таблички и поручни" type="number" step="0.01" {...register("cost_installation_signs")} />
              <Field label="Услуги инженеров"              type="number" step="0.01" {...register("cost_engineering_services")} />
            </div>
          </SectionCard>

          <SectionCard id="section-dept" icon={Building2} title="Ответственный орган" color="indigo">
            <FormSelect name="department" label="Ответственный орган" options={deptOptions} />
          </SectionCard>

          {/* Save bar */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "relative px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200",
                "bg-brand shadow-lg shadow-brand/25",
                "hover:shadow-brand/40 hover:brightness-110",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
                isDirty && !isSubmitting && "ring-2 ring-brand/30",
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Сохранение…
                </span>
              ) : "Сохранить"}
            </button>

            {isDirty && !saved && !saveError && (
              <span className="text-xs text-foreground/35">Есть несохранённые изменения</span>
            )}
            <div aria-live="polite" aria-atomic="true" className="text-sm">
              {saved     && <span className="text-emerald-400 font-medium">✓ Сохранено</span>}
              {saveError && <span className="text-red-400">{saveError}</span>}
            </div>
          </div>
        </form>

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <PassportSidebar formData={formData} refs={refs} />

      </div>
    </FormProvider>
  );
}
