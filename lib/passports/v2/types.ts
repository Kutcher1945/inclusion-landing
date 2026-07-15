import { z } from "zod";

// ─── Checklist schema (cacheable, rarely changes) ─────────────────────────────

export const checklistSchemaItemSchema = z.object({
  id: z.number(),
  index: z.number(),
  criterion_text: z.string(),
  group: z.enum([
    "territory",
    "entry_group",
    "movement",
    "service",
    "sanitary",
    "media",
  ]),
  availability_flag: z.string(),
  sub_sub_category_id: z.number().nullable(),
  recommendation_type: z.enum(["fk", "text"]),
  order: z.number(),
});

export type ChecklistSchemaItem = z.infer<typeof checklistSchemaItemSchema>;
export type ChecklistSchema = ChecklistSchemaItem[];

// ─── Checklist value (per-passport) ──────────────────────────────────────────

export const criterionValueSchema = z.object({
  criterion_id: z.number(),
  index: z.number(),
  is_adapted: z.boolean(),
  actual_value: z.string().nullable(),
  recommendation_id: z.number().nullable(),
  recommendation_text: z.string().nullable(),
});

export type CriterionValue = z.infer<typeof criterionValueSchema>;

// ─── Photo ────────────────────────────────────────────────────────────────────

export const photoSectionSchema = z.enum([
  "entry_group",
  "path_of_travel",
  "service_delivery_area",
  "sanitary_facilities",
  "media_and_telecommunications",
  "site_area",
  "not_delivered",
]);

export type PhotoSection = z.infer<typeof photoSectionSchema>;

export const passportPhotoSchema = z.object({
  id: z.number(),
  section: photoSectionSchema,
  order: z.number(),
  image_url: z.string().nullable(),
});

export type PassportPhoto = z.infer<typeof passportPhotoSchema>;

// ─── V2 passport form payload ─────────────────────────────────────────────────
// Returned by GET /inclusion-api/admin/object-passports/:id/form/
// ~5-20 KB vs 1-5 MB legacy

export const passportV2Schema = z.object({
  id: z.number(),
  general: z.object({
    name_ru: z.string().nullable(),
    name_kz: z.string().nullable(),
    full_legal_name: z.string().nullable(),
    address: z.string().nullable(),
    building: z.string().nullable(),
    house_number: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    activity_description: z.string().nullable(),
    scope_of_services_provided: z.number().nullable(),
    for_special_people: z.number().nullable(),
    district_id: z.number().nullable(),
    department_id: z.number().nullable(),
    type_of_activity_id: z.number().nullable(),
    sub_type_of_activity_id: z.number().nullable(),
    subject_of_ownership_id: z.number().nullable(),
    street_id: z.number().nullable(),
  }),
  status: z.object({
    status_id: z.number().nullable(),
    delivery_status_id: z.number().nullable(),
    reason_of_cancelation: z.string().nullable(),
    reason_of_delivery_cancelation: z.string().nullable(),
  }),
  building: z.object({
    amount_of_floors: z.number().nullable(),
    year_of_construction: z.string().nullable(),
  }),
  costs: z.object({
    cost_reconstruction_stairs: z.string().nullable(),
    cost_reconstruction_corridor: z.string().nullable(),
    cost_installation_signs: z.string().nullable(),
    cost_engineering_services: z.string().nullable(),
  }),
  availability: z.object({
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
  }),
  // criterion_text NOT here — fetched separately via /checklist-schema/
  checklist: z.array(criterionValueSchema),
  updated_at: z.string(),
  is_deleted: z.boolean(),
});

export type PassportV2 = z.infer<typeof passportV2Schema>;

// ─── PATCH body ───────────────────────────────────────────────────────────────

const criterionPatchSchema = z.object({
  criterion_id: z.number().int().positive(),
  is_adapted: z.boolean(),
  actual_value: z.string().nullable(),
  recommendation_id: z.number().int().positive().nullable(),
  recommendation_text: z.string().nullable(),
}).strict();

export const passportV2PatchSchema = z.object({
  general: z.object({
    name_ru: z.string().nullable(),
    name_kz: z.string().nullable(),
    full_legal_name: z.string().nullable(),
    address: z.string().nullable(),
    building: z.string().nullable(),
    house_number: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    activity_description: z.string().nullable(),
    scope_of_services_provided: z.number().int().nullable(),
    for_special_people: z.number().int().nullable(),
    district_id: z.number().int().positive().nullable(),
    department_id: z.number().int().positive().nullable(),
    type_of_activity_id: z.number().int().positive().nullable(),
    sub_type_of_activity_id: z.number().int().positive().nullable(),
    subject_of_ownership_id: z.number().int().positive().nullable(),
  }).strict(),
  status: z.object({
    status_id: z.number().int().positive().nullable(),
    delivery_status_id: z.number().int().positive().nullable(),
    reason_of_cancelation: z.string().nullable(),
    reason_of_delivery_cancelation: z.string().nullable(),
  }).strict(),
  building: z.object({
    amount_of_floors: z.number().int().nullable(),
    year_of_construction: z.string().nullable(),
  }).strict(),
  costs: z.object({
    cost_reconstruction_stairs: z.string().nullable(),
    cost_reconstruction_corridor: z.string().nullable(),
    cost_installation_signs: z.string().nullable(),
    cost_engineering_services: z.string().nullable(),
  }).strict(),
  availability: z.object({
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
  }).strict(),
  checklist: z.array(criterionPatchSchema),
}).strict();

export type PassportV2Patch = z.infer<typeof passportV2PatchSchema>;
