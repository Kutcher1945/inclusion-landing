import { z } from "zod";

export const checklistItemSchema = z.object({
  index: z.number(),
  criterion_text: z.string(),
  is_adapted: z.boolean(),
  actual_value: z.string().nullable(),
  recommendation: z.union([z.number(), z.string(), z.null()]),
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const passportDetailSchema = z
  .object({
    id: z.number(),
    name_ru: z.string().nullable(),
    name_kz: z.string().nullable(),
    full_legal_name: z.string().nullable(),
    building: z.string().nullable(),
    address: z.string().nullable(),
    house_number: z.string().nullable(),
    amount_of_floors: z.number().nullable(),
    year_of_construction: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    activity_description: z.string().nullable(),
    scope_of_services_provided: z.number().nullable(),
    for_special_people: z.number().nullable(),
    reason_of_cancelation: z.string().nullable(),
    reason_of_delivery_cancelation: z.string().nullable(),
    // FK references (stored as integer IDs)
    district: z.number().nullable(),
    type_of_activity: z.number().nullable(),
    sub_type_of_activity: z.number().nullable(),
    subject_of_ownership: z.number().nullable(),
    status: z.number().nullable(),
    delivery_status: z.number().nullable(),
    department: z.number().nullable(),
    street: z.number().nullable(),
    // Section availability — "Не требуется <Category>?" booleans
    is_available_porch: z.boolean(),
    is_available_stair: z.boolean(),
    is_available_ramp: z.boolean(),
    is_available_hoist: z.boolean(),
    is_available_tambour: z.boolean(),
    is_available_corridor: z.boolean(),
    is_available_elevator: z.boolean(),
    is_available_window: z.boolean(),
    is_available_cabinet: z.boolean(),
    is_available_walk_in_service: z.boolean(),
    is_available_service_cabin: z.boolean(),
    is_available_bathroom: z.boolean(),
    is_available_visual_means: z.boolean(),
    is_available_tactile_means: z.boolean(),
    is_available_acoustic_means: z.boolean(),
    is_available_allocated_area: z.boolean(),
    is_available_parking: z.boolean(),
    is_available_path_to_main_entrance: z.boolean(),
    is_available_traffic_path: z.boolean(),
    // Cost fields (decimal serialised as string by DRF)
    cost_reconstruction_stairs: z.string().nullable(),
    cost_reconstruction_corridor: z.string().nullable(),
    cost_installation_signs: z.string().nullable(),
    cost_engineering_services: z.string().nullable(),
    // Photo CDN URLs (read-only, editable=False on the image field itself)
    not_delivered_img_url: z.string().nullable(),
    entry_group_img_url: z.string().nullable(),
    entry_group_img_url_2: z.string().nullable(),
    entry_group_img_url_3: z.string().nullable(),
    entry_group_img_url_4: z.string().nullable(),
    entry_group_img_url_5: z.string().nullable(),
    entry_group_img_url_6: z.string().nullable(),
    path_of_travel_img_url: z.string().nullable(),
    path_of_travel_img_url_2: z.string().nullable(),
    path_of_travel_img_url_3: z.string().nullable(),
    path_of_travel_img_url_4: z.string().nullable(),
    path_of_travel_img_url_5: z.string().nullable(),
    path_of_travel_img_url_6: z.string().nullable(),
    service_delivery_area_img_url: z.string().nullable(),
    service_delivery_area_img_url_2: z.string().nullable(),
    service_delivery_area_img_url_3: z.string().nullable(),
    service_delivery_area_img_url_4: z.string().nullable(),
    service_delivery_area_img_url_5: z.string().nullable(),
    service_delivery_area_img_url_6: z.string().nullable(),
    sanitary_facilities_img_url: z.string().nullable(),
    sanitary_facilities_img_url_2: z.string().nullable(),
    sanitary_facilities_img_url_3: z.string().nullable(),
    sanitary_facilities_img_url_4: z.string().nullable(),
    sanitary_facilities_img_url_5: z.string().nullable(),
    sanitary_facilities_img_url_6: z.string().nullable(),
    media_and_telecommunications_img_url: z.string().nullable(),
    media_and_telecommunications_img_url_2: z.string().nullable(),
    media_and_telecommunications_img_url_3: z.string().nullable(),
    media_and_telecommunications_img_url_4: z.string().nullable(),
    media_and_telecommunications_img_url_5: z.string().nullable(),
    media_and_telecommunications_img_url_6: z.string().nullable(),
    site_area_img_url: z.string().nullable(),
    site_area_img_url_2: z.string().nullable(),
    site_area_img_url_3: z.string().nullable(),
    site_area_img_url_4: z.string().nullable(),
    site_area_img_url_5: z.string().nullable(),
    site_area_img_url_6: z.string().nullable(),
    // Metadata
    is_deleted: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    // Checklist (all 97 criteria, reshoped by ChecklistField)
    checklist: z.array(checklistItemSchema),
  });
// Note: geo fields (marker, multipolygon) and computed accessibility category FKs
// are intentionally omitted — they are stripped by Zod's default .strip() behaviour.
// Add them to the schema if a map component needs them.

export type PassportDetail = z.infer<typeof passportDetailSchema>;

// The shape React Hook Form manages and the PATCH endpoint accepts.
// Recommendation fields are intentionally omitted — they require FK lookup
// tables per criterion category and are not editable in this iteration.
export type PassportFormValues = {
  name_ru: string;
  name_kz: string;
  full_legal_name: string;
  building: string;
  address: string;
  house_number: string;
  amount_of_floors: string;
  year_of_construction: string;
  phone: string;
  email: string;
  activity_description: string;
  scope_of_services_provided: string;
  for_special_people: string;
  reason_of_cancelation: string;
  reason_of_delivery_cancelation: string;
  status: string;
  delivery_status: string;
  district: string;
  type_of_activity: string;
  sub_type_of_activity: string;
  subject_of_ownership: string;
  department: string;
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
  cost_reconstruction_stairs: string;
  cost_reconstruction_corridor: string;
  cost_installation_signs: string;
  cost_engineering_services: string;
  checklist: { index: number; is_adapted: boolean; actual_value: string; recommendation: string }[];
};

/** Strict allowlist schema for the BFF PATCH route.
 *  `.strict()` rejects any field not listed here, preventing arbitrary field injection
 *  (e.g. `is_deleted`, `author`, computed fields) even from a logged-in staff browser. */
const checklistPatchItemSchema = z.object({
  index: z.number().int().positive(),
  is_adapted: z.boolean(),
  actual_value: z.string().nullable(),
  recommendation: z.union([z.number().int().positive(), z.string(), z.null()]),
}).strict();

export const passportPatchBodySchema = z.object({
  name_ru: z.string().nullable(),
  name_kz: z.string().nullable(),
  full_legal_name: z.string().nullable(),
  building: z.string().nullable(),
  address: z.string().nullable(),
  house_number: z.string().nullable(),
  amount_of_floors: z.number().int().nullable(),
  year_of_construction: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  activity_description: z.string().nullable(),
  scope_of_services_provided: z.number().int().nullable(),
  for_special_people: z.number().int().nullable(),
  reason_of_cancelation: z.string().nullable(),
  reason_of_delivery_cancelation: z.string().nullable(),
  status: z.number().int().positive().nullable(),
  delivery_status: z.number().int().positive().nullable(),
  district: z.number().int().positive().nullable(),
  type_of_activity: z.number().int().positive().nullable(),
  sub_type_of_activity: z.number().int().positive().nullable(),
  subject_of_ownership: z.number().int().positive().nullable(),
  department: z.number().int().positive().nullable(),
  is_available_porch: z.boolean(),
  is_available_stair: z.boolean(),
  is_available_ramp: z.boolean(),
  is_available_hoist: z.boolean(),
  is_available_tambour: z.boolean(),
  is_available_corridor: z.boolean(),
  is_available_elevator: z.boolean(),
  is_available_window: z.boolean(),
  is_available_cabinet: z.boolean(),
  is_available_walk_in_service: z.boolean(),
  is_available_service_cabin: z.boolean(),
  is_available_bathroom: z.boolean(),
  is_available_visual_means: z.boolean(),
  is_available_tactile_means: z.boolean(),
  is_available_acoustic_means: z.boolean(),
  is_available_allocated_area: z.boolean(),
  is_available_parking: z.boolean(),
  is_available_path_to_main_entrance: z.boolean(),
  is_available_traffic_path: z.boolean(),
  cost_reconstruction_stairs: z.string().nullable(),
  cost_reconstruction_corridor: z.string().nullable(),
  cost_installation_signs: z.string().nullable(),
  cost_engineering_services: z.string().nullable(),
  checklist: z.array(checklistPatchItemSchema),
}).strict();

/** Schema for POST (create) — same allowlist as PATCH, minus `checklist`.
 *  The backend's ChecklistField is `required=False`, so a new passport is created
 *  with all 97 criteria defaulted (is_adapted=false, actual_value=null, recommendation=null);
 *  there is nothing meaningful to submit for it before the record exists. */
export const passportCreateBodySchema = passportPatchBodySchema.omit({ checklist: true });

export type PassportCreateBody = z.infer<typeof passportCreateBodySchema>;

/** The shape React Hook Form manages for the create form — same fields as
 *  PassportFormValues minus the checklist (no criteria to edit before creation). */
export type PassportCreateFormValues = Omit<PassportFormValues, "checklist">;
