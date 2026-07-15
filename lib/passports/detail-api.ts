import "server-only";
import { AuthError, refreshAccessToken } from "@/lib/auth/backend";
import { readSessionTokens } from "@/lib/auth/session";
import { passportDetailSchema } from "./detail-types";
import type { PassportDetail, PassportCreateBody } from "./detail-types";

const BACKEND =
  process.env.BACKEND_API_URL ?? "https://green-admin.smartalmaty.kz";

async function fetchWithAuth(url: string, accessToken: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });
}

export type PassportFetchResult =
  | { kind: "ok"; data: PassportDetail }
  | { kind: "unauthorized" | "not_found" | "error" };

async function attemptFetch(token: string, id: number): Promise<PassportFetchResult> {
  const url = `${BACKEND}/inclusion-api/admin/object-passports/${id}/`;
  const res = await fetchWithAuth(url, token);
  if (res.status === 401) return { kind: "unauthorized" };
  if (res.status === 404) return { kind: "not_found" };
  if (!res.ok) return { kind: "error" };
  const parsed = passportDetailSchema.safeParse(await res.json());
  if (!parsed.success) {
    console.error("[fetchPassportDetail] schema mismatch on 200 response", parsed.error.flatten());
    return { kind: "error" };
  }
  return { kind: "ok", data: parsed.data };
}

/** Fetches a single passport by ID with one silent token refresh on 401. */
export async function fetchPassportDetail(id: number): Promise<PassportFetchResult> {
  const { access, refresh } = await readSessionTokens();
  if (!access) return { kind: "unauthorized" };

  const result = await attemptFetch(access, id);

  if (result.kind === "unauthorized" && refresh) {
    try {
      const { access: newAccess } = await refreshAccessToken(refresh);
      return attemptFetch(newAccess, id);
    } catch (error: unknown) {
      if (error instanceof AuthError) return { kind: "unauthorized" };
      throw error;
    }
  }

  return result;
}

/** PATCHes a passport. Returns the updated passport or null on failure. */
export async function patchPassport(
  id: number,
  data: Record<string, unknown>,
): Promise<PassportDetail | null> {
  const { access, refresh } = await readSessionTokens();
  if (!access) return null;

  async function attempt(token: string): Promise<{ data: PassportDetail } | { status: number }> {
    const url = `${BACKEND}/inclusion-api/admin/object-passports/${id}/`;
    const res = await fetchWithAuth(url, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!res.ok) return { status: res.status };
    const parsed = passportDetailSchema.safeParse(await res.json());
    if (!parsed.success) {
      console.error("[patchPassport] schema mismatch on 200 response", parsed.error.flatten());
      return { status: 422 };
    }
    return { data: parsed.data };
  }

  const first = await attempt(access);
  if ("data" in first) return first.data;
  if (first.status !== 401 || !refresh) return null;

  try {
    const { access: newAccess } = await refreshAccessToken(refresh);
    const second = await attempt(newAccess);
    return "data" in second ? second.data : null;
  } catch (error: unknown) {
    if (error instanceof AuthError) return null;
    throw error;
  }
}

/** Soft-deletes a passport (sets is_deleted=true on the backend). Returns true on success. */
export async function deletePassport(id: number): Promise<boolean> {
  const { access, refresh } = await readSessionTokens();
  if (!access) return false;

  async function attempt(token: string): Promise<{ ok: boolean; status: number }> {
    const url = `${BACKEND}/inclusion-api/admin/object-passports/${id}/`;
    const res = await fetchWithAuth(url, token, { method: "DELETE" });
    return { ok: res.ok || res.status === 204, status: res.status };
  }

  const first = await attempt(access);
  if (first.ok) return true;
  if (first.status !== 401 || !refresh) return false;

  try {
    const { access: newAccess } = await refreshAccessToken(refresh);
    const second = await attempt(newAccess);
    return second.ok;
  } catch (error: unknown) {
    if (error instanceof AuthError) return false;
    throw error;
  }
}

/** Restores a soft-deleted passport. Returns the restored passport or null on failure. */
export async function restorePassport(id: number): Promise<PassportDetail | null> {
  const { access, refresh } = await readSessionTokens();
  if (!access) return null;

  async function attempt(token: string): Promise<{ data: PassportDetail } | { status: number }> {
    const url = `${BACKEND}/inclusion-api/admin/object-passports/${id}/restore/`;
    const res = await fetchWithAuth(url, token, { method: "POST", body: "{}" });
    if (!res.ok) return { status: res.status };
    const parsed = passportDetailSchema.safeParse(await res.json());
    if (!parsed.success) {
      console.error("[restorePassport] schema mismatch", parsed.error.flatten());
      return { status: 422 };
    }
    return { data: parsed.data };
  }

  const first = await attempt(access);
  if ("data" in first) return first.data;
  if (first.status !== 401 || !refresh) return null;

  try {
    const { access: newAccess } = await refreshAccessToken(refresh);
    const second = await attempt(newAccess);
    return "data" in second ? second.data : null;
  } catch (error: unknown) {
    if (error instanceof AuthError) return null;
    throw error;
  }
}

/** Fetches criterion display texts (index → criterion_text) from the first passport in
 *  the list. The backend sends criterion_text in the list payload; our Zod schema strips
 *  it for perf, so we read the raw JSON here. Returns [] when no passports exist yet. */
export async function fetchCriterionSchema(): Promise<{ index: number; text: string }[]> {
  const { access } = await readSessionTokens();
  if (!access) return [];

  try {
    const res = await fetchWithAuth(
      `${BACKEND}/inclusion-api/admin/object-passports/?page_size=1`,
      access,
    );
    if (!res.ok) return [];

    const list = await res.json() as {
      results?: Array<{ checklist?: Array<{ index?: number; criterion_text?: string }> }>;
    };
    const criteria = list.results?.[0]?.checklist;
    if (!criteria?.length) return [];

    return criteria
      .filter((c): c is { index: number; criterion_text: string } =>
        typeof c.index === "number" && typeof c.criterion_text === "string"
      )
      .sort((a, b) => a.index - b.index)
      .map(({ index, criterion_text }) => ({ index, text: criterion_text }));
  } catch {
    return [];
  }
}

/** Creates a new passport. Returns the created passport or null on failure. */
export async function createPassport(data: PassportCreateBody): Promise<PassportDetail | null> {
  const { access, refresh } = await readSessionTokens();
  if (!access) return null;

  const url = `${BACKEND}/inclusion-api/admin/object-passports/`;

  async function attempt(token: string): Promise<{ data: PassportDetail } | { status: number }> {
    const res = await fetchWithAuth(url, token, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) return { status: res.status };
    const parsed = passportDetailSchema.safeParse(await res.json());
    if (!parsed.success) {
      console.error("[createPassport] schema mismatch on 201 response", parsed.error.flatten());
      return { status: 422 };
    }
    return { data: parsed.data };
  }

  const first = await attempt(access);
  if ("data" in first) return first.data;
  if (first.status !== 401 || !refresh) return null;

  try {
    const { access: newAccess } = await refreshAccessToken(refresh);
    const second = await attempt(newAccess);
    return "data" in second ? second.data : null;
  } catch (error: unknown) {
    if (error instanceof AuthError) return null;
    throw error;
  }
}
