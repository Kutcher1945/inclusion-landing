import type { PassportV2, ChecklistSchema, PassportPhoto, PhotoSection } from "./types";
import type { PassportFormData, PassportPhotos, CriterionDisplay } from "../form-data";

// ─── Photos ───────────────────────────────────────────────────────────────────

function groupPhotos(photos: PassportPhoto[]): PassportPhotos {
  const pick = (section: PhotoSection): (string | null)[] => {
    const items = photos
      .filter((p) => p.section === section)
      .sort((a, b) => a.order - b.order);
    const urls = items.map((p) => p.image_url);
    return urls.length > 0 ? urls : [null];
  };

  return {
    notDelivered: photos.find((p) => p.section === "not_delivered")?.image_url ?? null,
    siteArea:                   pick("site_area"),
    entryGroup:                 pick("entry_group"),
    pathOfTravel:               pick("path_of_travel"),
    serviceDeliveryArea:        pick("service_delivery_area"),
    sanitaryFacilities:         pick("sanitary_facilities"),
    mediaAndTelecommunications: pick("media_and_telecommunications"),
  };
}

// ─── Main transform ───────────────────────────────────────────────────────────
// V2 API already groups data — no flat-field unpacking needed.
// Photos are passed separately (lazy-loaded after form mounts).

export function v2ToFormData(
  passport: PassportV2,
  schema: ChecklistSchema,
  photos: PassportPhoto[],
): {
  formData: PassportFormData;
  criterionDisplay: CriterionDisplay[];
} {
  const { general, status, building, costs, availability, checklist } = passport;

  // Merge checklist values with display text from schema
  const schemaByIndex = new Map(schema.map((s) => [s.index, s]));

  const criterionDisplay: CriterionDisplay[] = schema
    .sort((a, b) => a.index - b.index)
    .map(({ index, criterion_text }) => ({ index, text: criterion_text }));

  return {
    formData: {
      id: passport.id,
      // general
      name_ru: general.name_ru,
      name_kz: general.name_kz,
      full_legal_name: general.full_legal_name,
      building: general.building,
      address: general.address,
      house_number: general.house_number,
      phone: general.phone,
      email: general.email,
      activity_description: general.activity_description,
      scope_of_services_provided: general.scope_of_services_provided,
      for_special_people: general.for_special_people,
      // FK ids → same field names as legacy
      district: general.district_id,
      type_of_activity: general.type_of_activity_id,
      sub_type_of_activity: general.sub_type_of_activity_id,
      subject_of_ownership: general.subject_of_ownership_id,
      department: general.department_id,
      // status
      status: status.status_id,
      delivery_status: status.delivery_status_id,
      reason_of_cancelation: status.reason_of_cancelation,
      reason_of_delivery_cancelation: status.reason_of_delivery_cancelation,
      // building
      amount_of_floors: building.amount_of_floors,
      year_of_construction: building.year_of_construction,
      // costs
      cost_reconstruction_stairs: costs.cost_reconstruction_stairs,
      cost_reconstruction_corridor: costs.cost_reconstruction_corridor,
      cost_installation_signs: costs.cost_installation_signs,
      cost_engineering_services: costs.cost_engineering_services,
      // availability flags (spread — all 19 fields)
      ...availability,
      // checklist: adapt V2 shape → legacy shape so PassportEditForm stays unchanged
      checklist: checklist.map(({ criterion_id, index, is_adapted, actual_value, recommendation_id }) => ({
        index,
        is_adapted,
        actual_value,
        recommendation: recommendation_id,
        // criterion_id kept for V2 PATCH builds
        _criterion_id: criterion_id,
      })),
      // photos: grouped from lazy-loaded array
      photos: groupPhotos(photos),
      updated_at: passport.updated_at,
      is_deleted: passport.is_deleted,
    },
    criterionDisplay,
  };
}

// ─── Build PATCH body from React Hook Form values ─────────────────────────────
// Converts the flat RHF shape back to the V2 nested PATCH body.

import type { PassportFormValues } from "../detail-types";
import type { PassportV2Patch } from "./types";

export function formValuesToV2Patch(
  values: PassportFormValues,
  schema: ChecklistSchema,
): PassportV2Patch {
  const schemaByIndex = new Map(schema.map((s) => [s.index, s]));

  return {
    general: {
      name_ru: values.name_ru || null,
      name_kz: values.name_kz || null,
      full_legal_name: values.full_legal_name || null,
      address: values.address || null,
      building: values.building || null,
      house_number: values.house_number || null,
      phone: values.phone || null,
      email: values.email || null,
      activity_description: values.activity_description || null,
      scope_of_services_provided: values.scope_of_services_provided
        ? parseInt(values.scope_of_services_provided, 10)
        : null,
      for_special_people: values.for_special_people
        ? parseInt(values.for_special_people, 10)
        : null,
      district_id: values.district ? parseInt(values.district, 10) : null,
      department_id: values.department ? parseInt(values.department, 10) : null,
      type_of_activity_id: values.type_of_activity
        ? parseInt(values.type_of_activity, 10)
        : null,
      sub_type_of_activity_id: values.sub_type_of_activity
        ? parseInt(values.sub_type_of_activity, 10)
        : null,
      subject_of_ownership_id: values.subject_of_ownership
        ? parseInt(values.subject_of_ownership, 10)
        : null,
    },
    status: {
      status_id: values.status ? parseInt(values.status, 10) : null,
      delivery_status_id: values.delivery_status
        ? parseInt(values.delivery_status, 10)
        : null,
      reason_of_cancelation: values.reason_of_cancelation || null,
      reason_of_delivery_cancelation: values.reason_of_delivery_cancelation || null,
    },
    building: {
      amount_of_floors: values.amount_of_floors
        ? parseInt(values.amount_of_floors, 10)
        : null,
      year_of_construction: values.year_of_construction || null,
    },
    costs: {
      cost_reconstruction_stairs: values.cost_reconstruction_stairs || null,
      cost_reconstruction_corridor: values.cost_reconstruction_corridor || null,
      cost_installation_signs: values.cost_installation_signs || null,
      cost_engineering_services: values.cost_engineering_services || null,
    },
    availability: {
      is_available_porch: values.is_available_porch,
      is_available_stair: values.is_available_stair,
      is_available_ramp: values.is_available_ramp,
      is_available_hoist: values.is_available_hoist,
      is_available_tambour: values.is_available_tambour,
      is_available_corridor: values.is_available_corridor,
      is_available_elevator: values.is_available_elevator,
      is_available_window: values.is_available_window,
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
    },
    checklist: values.checklist.map((item) => {
      const schema = schemaByIndex.get(item.index);
      const criterionId = (item as unknown as { _criterion_id?: number })._criterion_id;

      if (!criterionId || !schema) {
        throw new Error(`criterion_id missing for index ${item.index}`);
      }

      const rec = item.recommendation;
      const isFk = schema.recommendation_type === "fk";

      return {
        criterion_id: criterionId,
        is_adapted: item.is_adapted,
        actual_value: item.actual_value || null,
        recommendation_id: isFk && typeof rec === "number" ? rec : null,
        recommendation_text: !isFk && typeof rec === "string" ? rec : null,
      };
    }),
  };
}
