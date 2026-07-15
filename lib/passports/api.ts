import "server-only";
import { AuthError, refreshAccessToken } from "@/lib/auth/backend";
import { readSessionTokens } from "@/lib/auth/session";
import { paginatedPassportsSchema, paginatedRefListSchema } from "./types";
import type { PaginatedPassports, ReferenceData, RefItem } from "./types";

const BACKEND =
  process.env.BACKEND_API_URL ?? "https://green-admin.smartalmaty.kz";

export const PASSPORT_PAGE_SIZE = 25;

async function fetchWithAuth(url: string, accessToken: string): Promise<Response> {
  return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
}

/**
 * Fetches a page of passports from the admin API.
 * Performs one silent inline refresh if the access token is rejected, without
 * persisting the new token (the proxy already set it on the response cookie).
 */
export type PassportListFilters = {
  search?: string;
  district?: string;
  status?: string;
  delivery_status?: string;
  type_of_activity?: string;
  sub_type_of_activity?: string;
  show_deleted?: boolean;
  /** DRF OrderingFilter value, e.g. "name_ru" or "-criteria_filled". */
  ordering?: string;
};

export async function fetchPassportList(
  page: number,
  filters: PassportListFilters = {},
): Promise<PaginatedPassports | null> {
  const { access, refresh } = await readSessionTokens();
  if (!access) return null;

  const qs = new URLSearchParams({ page: String(page), page_size: String(PASSPORT_PAGE_SIZE) });
  if (filters.search)           qs.set("search",           filters.search);
  if (filters.district)         qs.set("district",         filters.district);
  if (filters.status)           qs.set("status",           filters.status);
  if (filters.delivery_status)  qs.set("delivery_status",  filters.delivery_status);
  if (filters.type_of_activity) qs.set("type_of_activity", filters.type_of_activity);
  if (filters.sub_type_of_activity) qs.set("sub_type_of_activity", filters.sub_type_of_activity);
  if (filters.show_deleted)         qs.set("show_deleted",          "true");
  if (filters.ordering)             qs.set("ordering",              filters.ordering);

  const url = `${BACKEND}/inclusion-api/admin/object-passports/?${qs.toString()}`;
  let res = await fetchWithAuth(url, access);

  if (res.status === 401 && refresh) {
    try {
      const { access: newAccess } = await refreshAccessToken(refresh);
      res = await fetchWithAuth(url, newAccess);
    } catch (error: unknown) {
      if (error instanceof AuthError) return null;
      throw error;
    }
  }

  if (!res.ok) return null;

  const parsed = paginatedPassportsSchema.safeParse(await res.json());
  return parsed.success ? parsed.data : null;
}

/** Fetches all reference data needed to render labels in the passport list. */
export async function fetchReferenceData(): Promise<ReferenceData> {
  async function getList(path: string): Promise<RefItem[] | null> {
    try {
      const res = await fetch(`${BACKEND}${path}`, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const parsed = paginatedRefListSchema.safeParse(await res.json());
      return parsed.success ? parsed.data.results : null;
    } catch {
      return null;
    }
  }

  const [statuses, deliveryStatuses, districts, activityTypes, activitySubTypes, departments] = await Promise.all([
    getList("/inclusion-api/statuses/?page_size=20"),
    getList("/inclusion-api/delivery-statuses/?page_size=10"),
    getList("/inclusion-api/localities/?page_size=20"),
    getList("/inclusion-api/ref_category/?page_size=50"),
    getList("/inclusion-api/ref_sub_category/?page_size=200"),
    getList("/inclusion-api/departments/?page_size=200"),
  ]);

  if (!statuses || !deliveryStatuses || !districts || !activityTypes || !activitySubTypes) {
    throw new Error("Failed to load reference data from backend");
  }

  return { statuses, deliveryStatuses, districts, activityTypes, activitySubTypes, departments: departments ?? [] };
}
