"use client";

import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Send, ClipboardList, FileText, Briefcase, CreditCard, Building2, Layers } from "lucide-react";
import { SectionCard, Field, TextareaField } from "../FormUI";
import { FormSelect } from "../[id]/CustomSelect";
import { AccessibilityAccordion, type AccessibilityPhotos } from "../[id]/AccessibilityAccordion";
import type { PassportFormValues, PassportCreateBody } from "@/lib/passports/detail-types";
import type { ReferenceData } from "@/lib/passports/types";
import type { ChecklistFormItem, CriterionDisplay } from "@/lib/passports/form-data";

const EMPTY_PHOTOS: AccessibilityPhotos = {
  siteArea:                   [],
  entryGroup:                 [],
  pathOfTravel:               [],
  serviceDeliveryArea:        [],
  sanitaryFacilities:         [],
  mediaAndTelecommunications: [],
};

const TEXT_REC_INDICES = new Set([93, 94, 95]);

type Props = { refs: ReferenceData; criterionDisplay: CriterionDisplay[] };

function buildDefaultValues(criterionDisplay: CriterionDisplay[]): PassportFormValues {
  return {
    name_ru: "", name_kz: "", full_legal_name: "", building: "",
    address: "", house_number: "", amount_of_floors: "", year_of_construction: "",
    phone: "", email: "", activity_description: "",
    scope_of_services_provided: "", for_special_people: "",
    reason_of_cancelation: "", reason_of_delivery_cancelation: "",
    status: "", delivery_status: "", district: "", type_of_activity: "",
    sub_type_of_activity: "", subject_of_ownership: "", department: "",
    is_available_porch: false, is_available_stair: false, is_available_ramp: false,
    is_available_hoist: false, is_available_tambour: false, is_available_corridor: false,
    is_available_elevator: false, is_available_window: false, is_available_cabinet: false,
    is_available_walk_in_service: false, is_available_service_cabin: false, is_available_bathroom: false,
    is_available_visual_means: false, is_available_tactile_means: false, is_available_acoustic_means: false,
    is_available_allocated_area: false, is_available_parking: false,
    is_available_path_to_main_entrance: false, is_available_traffic_path: false,
    cost_reconstruction_stairs: "", cost_reconstruction_corridor: "",
    cost_installation_signs: "", cost_engineering_services: "",
    checklist: criterionDisplay.map(({ index }) => ({ index, is_adapted: false, actual_value: "", recommendation: "" })),
  };
}

function buildCreatePayload(values: PassportFormValues): PassportCreateBody {
  const nullIfEmpty = (v: string) => v.trim() === "" ? null : v.trim();
  const intOrNull   = (v: string) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; };
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
  };
}

function buildChecklistPatch(values: PassportFormValues) {
  return values.checklist.map((item) => {
    const recStr = String(item.recommendation ?? "").trim();
    const recommendation = recStr === ""
      ? null
      : TEXT_REC_INDICES.has(item.index)
        ? recStr
        : (() => { const n = parseInt(recStr, 10); return Number.isFinite(n) ? n : null; })();
    return {
      index: item.index,
      is_adapted: item.is_adapted,
      actual_value: item.actual_value?.trim() || null,
      recommendation,
    };
  });
}

export function PassportCreateForm({ refs, criterionDisplay }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = useMemo(() => buildDefaultValues(criterionDisplay), [criterionDisplay]);

  const methods = useForm<PassportFormValues>({ defaultValues });
  const { register, handleSubmit, formState: { isSubmitting } } = methods;

  const checklistItems: ChecklistFormItem[] = useMemo(
    () => criterionDisplay.map(({ index }) => ({ index, is_adapted: false, actual_value: null, recommendation: null })),
    [criterionDisplay],
  );

  async function onSubmit(values: PassportFormValues) {
    setServerError(null);

    const createRes = await fetch("/api/passports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildCreatePayload(values)),
    });

    if (!createRes.ok) {
      setServerError("Не удалось создать запись. Проверьте данные и попробуйте снова.");
      return;
    }

    const created = await createRes.json() as { id: number };

    const hasChecklistChanges = values.checklist.some(
      (item) => item.is_adapted || item.actual_value?.trim() || String(item.recommendation ?? "").trim()
    );

    if (hasChecklistChanges) {
      await fetch(`/api/passports/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildCreatePayload(values),
          checklist: buildChecklistPatch(values),
        }),
      });
    }

    router.push(`/passports/${created.id}`);
  }

  const statusOptions   = refs.statuses.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const deliveryOptions = refs.deliveryStatuses.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const districtOptions = refs.districts.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const typeOptions     = refs.activityTypes.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const subTypeOptions  = refs.activitySubTypes.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));
  const deptOptions     = refs.departments.map((s) => ({ value: s.id, label: s.name_ru ?? `#${s.id}` }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pb-8">

        <SectionCard icon={Send} title="Статус отправки паспорта" color="sky">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect<PassportFormValues> name="delivery_status" label="Статус отправки" options={deliveryOptions} />
          </div>
          <TextareaField label="Причина отклонения отправки" {...register("reason_of_delivery_cancelation")} placeholder="Укажите причину..." />
        </SectionCard>

        <SectionCard icon={ClipboardList} title="Статус согласования объекта" color="emerald">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect<PassportFormValues> name="status" label="Статус объекта" options={statusOptions} />
          </div>
          <TextareaField label="Причина отклонения" {...register("reason_of_cancelation")} placeholder="Укажите причину..." />
        </SectionCard>

        <SectionCard icon={FileText} title="Юридическая информация" color="violet">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Наименование на русском"  {...register("name_ru")}  placeholder="Название на русском" />
            <Field label="Наименование на казахском" {...register("name_kz")}  placeholder="Атауы қазақша" />
          </div>
          <Field label="Полное юридическое наименование" {...register("full_legal_name")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Почтовый адрес ЮЛ"              {...register("building")} />
            <Field label="Адрес"                           {...register("address")} />
            <Field label="Номер дома"                      {...register("house_number")} />
            <FormSelect<PassportFormValues> name="district" label="Район" options={districtOptions} />
            <Field label="Количество этажей" type="number" {...register("amount_of_floors")} />
            <Field label="Год постройки"                   {...register("year_of_construction")} placeholder="2000-01-01" />
            <Field label="Телефон"  type="tel"   {...register("phone")}  placeholder="+77011234567" />
            <Field label="Email"    type="email" {...register("email")}  placeholder="example@example.com" />
          </div>
        </SectionCard>

        <SectionCard icon={Briefcase} title="Деятельность" color="amber">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect<PassportFormValues> name="type_of_activity"     label="Вид деятельности"    options={typeOptions} />
            <FormSelect<PassportFormValues> name="sub_type_of_activity" label="Подвид деятельности" options={subTypeOptions} />
            <Field label="Субъект собственности (ID)" type="number" {...register("subject_of_ownership")} />
          </div>
          <Field label="Описание вида деятельности" {...register("activity_description")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Объём предоставляемых услуг"     type="number" {...register("scope_of_services_provided")} />
            <Field label="В т.ч. для лиц с инвалидностью" type="number" {...register("for_special_people")} />
          </div>
        </SectionCard>

        <SectionCard
          icon={Layers}
          title="Информация по доступности объектов"
          color="cyan"
          hint="Разверните разделы и отметьте критерии доступности."
        >
          <AccessibilityAccordion
            checklistItems={checklistItems}
            criterionDisplay={criterionDisplay}
            photos={EMPTY_PHOTOS}
          />
        </SectionCard>

        <SectionCard
          icon={CreditCard}
          title="Стоимость реконструкции (тыс. тг)"
          color="yellow"
          hint="Можно заполнить сейчас или позже, при редактировании записи"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Реконструкция лестницы"        type="number" step="0.01" {...register("cost_reconstruction_stairs")} />
            <Field label="Реконструкция коридора"        type="number" step="0.01" {...register("cost_reconstruction_corridor")} />
            <Field label="Тактильные таблички и поручни" type="number" step="0.01" {...register("cost_installation_signs")} />
            <Field label="Услуги инженеров"              type="number" step="0.01" {...register("cost_engineering_services")} />
          </div>
        </SectionCard>

        <SectionCard icon={Building2} title="Ответственный орган" color="indigo">
          <FormSelect<PassportFormValues> name="department" label="Ответственный орган" options={deptOptions} />
        </SectionCard>

        <p className="text-xs text-foreground/35 px-1">
          Фотографии добавляются после создания записи.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200",
              "bg-brand shadow-lg shadow-brand/25",
              "hover:shadow-brand/40 hover:brightness-110",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Создание…
              </span>
            ) : "Создать запись"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/passports")}
            className="px-6 py-2.5 rounded-xl border border-foreground/15 text-sm text-foreground/60 hover:border-foreground/30 hover:text-foreground transition-colors"
          >
            Отмена
          </button>
          {serverError && <span className="text-sm text-red-400">{serverError}</span>}
        </div>
      </form>
    </FormProvider>
  );
}
