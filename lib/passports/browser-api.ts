import { paginatedPassportsSchema, paginatedRefListSchema } from "./types";
import { passportDetailSchema } from "./detail-types";
import type { PaginatedPassports, ReferenceData, RefItem } from "./types";
import type { PassportDetail, PassportCreateBody } from "./detail-types";

export type { ReferenceData, RefItem, PaginatedPassports };
export type { PassportDetail, PassportCreateBody };

export const PASSPORT_PAGE_SIZE = 25;

export type PassportListFilters = {
  search?: string;
  district?: string;
  status?: string;
  delivery_status?: string;
  type_of_activity?: string;
  sub_type_of_activity?: string;
  show_deleted?: boolean;
  ordering?: string;
};

export type PassportFetchResult =
  | { kind: "ok"; data: PassportDetail }
  | { kind: "unauthorized" | "not_found" | "error" };

const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://green-admin.smartalmaty.kz";

// ─── Token cache ──────────────────────────────────────────────────────────────

let _token: string | null = null;

async function getToken(): Promise<string | null> {
  if (_token) return _token;
  try {
    const res = await fetch("/api/auth/access-token");
    if (!res.ok) return null;
    const { access } = (await res.json()) as { access: string };
    _token = access;
    return access;
  } catch {
    return null;
  }
}

async function doRefresh(): Promise<string | null> {
  try {
    const r1 = await fetch("/api/auth/refresh-token");
    if (!r1.ok) return null;
    const { refresh } = (await r1.json()) as { refresh: string };

    const r2 = await fetch(`${BACKEND}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!r2.ok) return null;

    const tokens = (await r2.json()) as { access: string; refresh?: string };

    await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access: tokens.access,
        refresh: tokens.refresh ?? refresh,
      }),
    });

    _token = tokens.access;
    return tokens.access;
  } catch {
    return null;
  }
}

// ─── Authenticated fetch with one auto-refresh on 401 ────────────────────────

async function authedFetch(
  url: string,
  init?: RequestInit,
): Promise<Response | null> {
  let token = await getToken();
  if (!token) return null;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, { ...init, headers, cache: "no-store" });

  if (res.status !== 401) return res;

  _token = null;
  token = await doRefresh();
  if (!token) return null;

  return fetch(url, {
    ...init,
    headers: { ...headers, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

// ─── Passport list ────────────────────────────────────────────────────────────

export async function fetchPassportList(
  page: number,
  filters: PassportListFilters = {},
): Promise<PaginatedPassports | null> {
  const qs = new URLSearchParams({
    page: String(page),
    page_size: String(PASSPORT_PAGE_SIZE),
  });
  if (filters.search) qs.set("search", filters.search);
  if (filters.district) qs.set("district", filters.district);
  if (filters.status) qs.set("status", filters.status);
  if (filters.delivery_status) qs.set("delivery_status", filters.delivery_status);
  if (filters.type_of_activity) qs.set("type_of_activity", filters.type_of_activity);
  if (filters.sub_type_of_activity) qs.set("sub_type_of_activity", filters.sub_type_of_activity);
  if (filters.show_deleted) qs.set("show_deleted", "true");
  if (filters.ordering) qs.set("ordering", filters.ordering);

  const res = await authedFetch(
    `${BACKEND}/inclusion-api/admin/object-passports/?${qs.toString()}`,
  );
  if (!res || !res.ok) return null;

  const parsed = paginatedPassportsSchema.safeParse(await res.json());
  return parsed.success ? parsed.data : null;
}

// ─── Reference data (public endpoints, no auth) ───────────────────────────────

async function getList(path: string): Promise<RefItem[] | null> {
  try {
    const res = await fetch(`${BACKEND}${path}`);
    if (!res.ok) return null;
    const parsed = paginatedRefListSchema.safeParse(await res.json());
    return parsed.success ? parsed.data.results : null;
  } catch {
    return null;
  }
}

export async function fetchReferenceData(): Promise<ReferenceData> {
  const [statuses, deliveryStatuses, districts, activityTypes, activitySubTypes, departments] =
    await Promise.all([
      getList("/inclusion-api/statuses/?page_size=20"),
      getList("/inclusion-api/delivery-statuses/?page_size=10"),
      getList("/inclusion-api/localities/?page_size=20"),
      getList("/inclusion-api/ref_category/?page_size=50"),
      getList("/inclusion-api/ref_sub_category/?page_size=200"),
      getList("/inclusion-api/departments/?page_size=200"),
    ]);

  return {
    statuses: statuses ?? [],
    deliveryStatuses: deliveryStatuses ?? [],
    districts: districts ?? [],
    activityTypes: activityTypes ?? [],
    activitySubTypes: activitySubTypes ?? [],
    departments: departments ?? [],
  };
}

// ─── Passport detail ──────────────────────────────────────────────────────────

export async function fetchPassportDetail(id: number): Promise<PassportFetchResult> {
  const res = await authedFetch(
    `${BACKEND}/inclusion-api/admin/object-passports/${id}/`,
  );
  if (!res) return { kind: "unauthorized" };
  if (res.status === 401) return { kind: "unauthorized" };
  if (res.status === 404) return { kind: "not_found" };
  if (!res.ok) return { kind: "error" };

  const parsed = passportDetailSchema.safeParse(await res.json());
  return parsed.success ? { kind: "ok", data: parsed.data } : { kind: "error" };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function patchPassport(
  id: number,
  data: Record<string, unknown>,
): Promise<PassportDetail | null> {
  const res = await authedFetch(
    `${BACKEND}/inclusion-api/admin/object-passports/${id}/`,
    { method: "PATCH", body: JSON.stringify(data) },
  );
  if (!res || !res.ok) return null;

  const parsed = passportDetailSchema.safeParse(await res.json());
  return parsed.success ? parsed.data : null;
}

export async function deletePassport(id: number): Promise<boolean> {
  const res = await authedFetch(
    `${BACKEND}/inclusion-api/admin/object-passports/${id}/`,
    { method: "DELETE" },
  );
  return Boolean(res && (res.ok || res.status === 204));
}

export async function restorePassport(id: number): Promise<PassportDetail | null> {
  const res = await authedFetch(
    `${BACKEND}/inclusion-api/admin/object-passports/${id}/restore/`,
    { method: "POST", body: "{}" },
  );
  if (!res || !res.ok) return null;

  const parsed = passportDetailSchema.safeParse(await res.json());
  return parsed.success ? parsed.data : null;
}

export async function createPassport(
  data: PassportCreateBody,
): Promise<PassportDetail | null> {
  const res = await authedFetch(
    `${BACKEND}/inclusion-api/admin/object-passports/`,
    { method: "POST", body: JSON.stringify(data) },
  );
  if (!res || !res.ok) return null;

  const parsed = passportDetailSchema.safeParse(await res.json());
  return parsed.success ? parsed.data : null;
}

// ─── Criterion schema (first passport's checklist) ───────────────────────────

export async function fetchCriterionSchema(): Promise<{ index: number; text: string }[]> {
  const res = await authedFetch(
    `${BACKEND}/inclusion-api/admin/object-passports/?page_size=1`,
  );
  if (!res || !res.ok) return [];

  const list = (await res.json()) as {
    results?: Array<{
      checklist?: Array<{ index?: number; criterion_text?: string }>;
    }>;
  };
  const criteria = list.results?.[0]?.checklist;
  if (!criteria?.length) return [];

  return criteria
    .filter(
      (c): c is { index: number; criterion_text: string } =>
        typeof c.index === "number" && typeof c.criterion_text === "string",
    )
    .sort((a, b) => a.index - b.index)
    .map(({ index, criterion_text }) => ({ index, text: criterion_text }));
}
