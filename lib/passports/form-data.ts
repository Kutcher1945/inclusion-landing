import type { PassportDetail } from "./detail-types";

// ─── Photo groups (36 loose fields → 7 typed arrays) ─────────────────────────

export type PassportPhotos = {
  notDelivered: string | null;
  siteArea: (string | null)[];
  entryGroup: (string | null)[];
  pathOfTravel: (string | null)[];
  serviceDeliveryArea: (string | null)[];
  sanitaryFacilities: (string | null)[];
  mediaAndTelecommunications: (string | null)[];
};

// ─── Checklist split ──────────────────────────────────────────────────────────

/** Form state — no criterion_text. Used to initialise RHF and build PATCH payload. */
export type ChecklistFormItem = {
  index: number;
  is_adapted: boolean;
  actual_value: string | null;
  recommendation: number | string | null; // pass-through: preserved in PATCH, never edited
};

/** Read-only display text — sent to the accordion for rendering labels. */
export type CriterionDisplay = {
  index: number;
  text: string;
};

// ─── Slim passport shape for client components ────────────────────────────────

/** Everything the edit form needs — no loose photo fields, no criterion_text. */
export type PassportFormData = {
  id: number;
  name_ru: string | null;
  name_kz: string | null;
  full_legal_name: string | null;
  building: string | null;
  address: string | null;
  house_number: string | null;
  amount_of_floors: number | null;
  year_of_construction: string | null;
  phone: string | null;
  email: string | null;
  activity_description: string | null;
  scope_of_services_provided: number | null;
  for_special_people: number | null;
  reason_of_cancelation: string | null;
  reason_of_delivery_cancelation: string | null;
  status: number | null;
  delivery_status: number | null;
  district: number | null;
  type_of_activity: number | null;
  sub_type_of_activity: number | null;
  subject_of_ownership: number | null;
  department: number | null;
  is_available_porch: boolean;
  is_available_stair: boolean;
  is_available_ramp: boolean;
  is_available_hoist: boolean;
  is_available_tambour: boolean;
  is_available_corridor: boolean;
  is_available_elevator: boolean;
  is_available_window: boolean;
  is_available_cabinet: boolean;
  is_available_walk_in_service: boolean;
  is_available_service_cabin: boolean;
  is_available_bathroom: boolean;
  is_available_visual_means: boolean;
  is_available_tactile_means: boolean;
  is_available_acoustic_means: boolean;
  is_available_allocated_area: boolean;
  is_available_parking: boolean;
  is_available_path_to_main_entrance: boolean;
  is_available_traffic_path: boolean;
  cost_reconstruction_stairs: string | null;
  cost_reconstruction_corridor: string | null;
  cost_installation_signs: string | null;
  cost_engineering_services: string | null;
  checklist: ChecklistFormItem[];
  photos: PassportPhotos;
  updated_at: string;
  is_deleted: boolean;
};

// ─── Server-side transform ────────────────────────────────────────────────────

/** Runs in a Server Component. Splits PassportDetail into form data + display text. */
export function toPassportFormData(p: PassportDetail): {
  formData: PassportFormData;
  criterionDisplay: CriterionDisplay[];
} {
  const photos: PassportPhotos = {
    notDelivered: p.not_delivered_img_url,
    siteArea:                   [p.site_area_img_url,                   p.site_area_img_url_2,                   p.site_area_img_url_3,                   p.site_area_img_url_4,                   p.site_area_img_url_5,                   p.site_area_img_url_6],
    entryGroup:                 [p.entry_group_img_url,                 p.entry_group_img_url_2,                 p.entry_group_img_url_3,                 p.entry_group_img_url_4,                 p.entry_group_img_url_5,                 p.entry_group_img_url_6],
    pathOfTravel:               [p.path_of_travel_img_url,              p.path_of_travel_img_url_2,              p.path_of_travel_img_url_3,              p.path_of_travel_img_url_4,              p.path_of_travel_img_url_5,              p.path_of_travel_img_url_6],
    serviceDeliveryArea:        [p.service_delivery_area_img_url,       p.service_delivery_area_img_url_2,       p.service_delivery_area_img_url_3,       p.service_delivery_area_img_url_4,       p.service_delivery_area_img_url_5,       p.service_delivery_area_img_url_6],
    sanitaryFacilities:         [p.sanitary_facilities_img_url,         p.sanitary_facilities_img_url_2,         p.sanitary_facilities_img_url_3,         p.sanitary_facilities_img_url_4,         p.sanitary_facilities_img_url_5,         p.sanitary_facilities_img_url_6],
    mediaAndTelecommunications: [p.media_and_telecommunications_img_url, p.media_and_telecommunications_img_url_2, p.media_and_telecommunications_img_url_3, p.media_and_telecommunications_img_url_4, p.media_and_telecommunications_img_url_5, p.media_and_telecommunications_img_url_6],
  };

  return {
    formData: {
      id: p.id,
      name_ru: p.name_ru, name_kz: p.name_kz,
      full_legal_name: p.full_legal_name, building: p.building,
      address: p.address, house_number: p.house_number,
      amount_of_floors: p.amount_of_floors, year_of_construction: p.year_of_construction,
      phone: p.phone, email: p.email,
      activity_description: p.activity_description,
      scope_of_services_provided: p.scope_of_services_provided,
      for_special_people: p.for_special_people,
      reason_of_cancelation: p.reason_of_cancelation,
      reason_of_delivery_cancelation: p.reason_of_delivery_cancelation,
      status: p.status, delivery_status: p.delivery_status,
      district: p.district, type_of_activity: p.type_of_activity,
      sub_type_of_activity: p.sub_type_of_activity,
      subject_of_ownership: p.subject_of_ownership, department: p.department,
      is_available_porch: p.is_available_porch, is_available_stair: p.is_available_stair,
      is_available_ramp: p.is_available_ramp, is_available_hoist: p.is_available_hoist,
      is_available_tambour: p.is_available_tambour, is_available_corridor: p.is_available_corridor,
      is_available_elevator: p.is_available_elevator, is_available_window: p.is_available_window,
      is_available_cabinet: p.is_available_cabinet,
      is_available_walk_in_service: p.is_available_walk_in_service,
      is_available_service_cabin: p.is_available_service_cabin,
      is_available_bathroom: p.is_available_bathroom,
      is_available_visual_means: p.is_available_visual_means,
      is_available_tactile_means: p.is_available_tactile_means,
      is_available_acoustic_means: p.is_available_acoustic_means,
      is_available_allocated_area: p.is_available_allocated_area,
      is_available_parking: p.is_available_parking,
      is_available_path_to_main_entrance: p.is_available_path_to_main_entrance,
      is_available_traffic_path: p.is_available_traffic_path,
      cost_reconstruction_stairs: p.cost_reconstruction_stairs,
      cost_reconstruction_corridor: p.cost_reconstruction_corridor,
      cost_installation_signs: p.cost_installation_signs,
      cost_engineering_services: p.cost_engineering_services,
      checklist: p.checklist.map(({ index, is_adapted, actual_value, recommendation }) => ({
        index, is_adapted, actual_value, recommendation,
      })),
      photos,
      updated_at: p.updated_at,
      is_deleted: p.is_deleted,
    },
    criterionDisplay: p.checklist.map(({ index, criterion_text }) => ({
      index,
      text: criterion_text,
    })),
  };
}
