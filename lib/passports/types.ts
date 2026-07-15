import { z } from "zod";

export const refItemSchema = z.object({
  id: z.number(),
  name_ru: z.string().nullable().transform((v) => v?.trim() ?? null),
  name_kz: z.string().nullable(),
});

export type RefItem = z.infer<typeof refItemSchema>;

export const passportListItemSchema = z.object({
  id: z.number(),
  name_ru: z.string().nullable().transform((v) => v?.trim() ?? null),
  name_kz: z.string().nullable().transform((v) => v?.trim() ?? null),
  address: z.string().nullable(),
  district: z.number().nullable(),
  type_of_activity: z.number().nullable(),
  sub_type_of_activity: z.number().nullable(),
  status: z.number().nullable(),
  delivery_status: z.number().nullable(),
  is_deleted: z.boolean(),
  updated_at: z.string().nullable(),
  // Cover thumbnail for the list row, plus a few extra categories for the hover preview card.
  entry_group_img_url: z.string().nullable(),
  site_area_img_url: z.string().nullable(),
  path_of_travel_img_url: z.string().nullable(),
  sanitary_facilities_img_url: z.string().nullable(),
  // Only `is_adapted` is read — drops criterion_text/actual_value/recommendation
  // that the backend's ChecklistField also sends, to keep the parsed payload light.
  checklist: z.array(z.object({ is_adapted: z.boolean() })),
});

export type PassportListItem = z.infer<typeof passportListItemSchema>;

export const paginatedPassportsSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(passportListItemSchema),
});

export type PaginatedPassports = z.infer<typeof paginatedPassportsSchema>;

export const paginatedRefListSchema = z.object({
  count: z.number(),
  results: z.array(refItemSchema),
});

export type ReferenceData = {
  statuses: RefItem[];
  deliveryStatuses: RefItem[];
  districts: RefItem[];
  activityTypes: RefItem[];
  activitySubTypes: RefItem[];
  departments: RefItem[];
};
