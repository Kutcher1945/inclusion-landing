import { cache } from "react";
import { cookies } from "next/headers";
import type { PassportV2, PassportV2Patch, ChecklistSchema, PassportPhoto } from "./types";
import { passportV2Schema, checklistSchemaItemSchema, passportPhotoSchema } from "./types";
import { z } from "zod";

const BASE = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://green-admin.smartalmaty.kz";

// ─── Auth header ──────────────────────────────────────────────────────────────

async function authHeader(): Promise<Record<string, string>> {
  const jar = await cookies();
  const token = jar.get("passport_access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

type FetchResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "unauthorized" }
  | { kind: "not_found" }
  | { kind: "error"; status: number };

async function apiFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  options?: RequestInit,
): Promise<FetchResult<T>> {
  const headers = await authHeader();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, "Content-Type": "application/json", ...options?.headers },
  });

  if (res.status === 401) return { kind: "unauthorized" };
  if (res.status === 404) return { kind: "not_found" };
  if (!res.ok) return { kind: "error", status: res.status };

  const json = await res.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.error("[v2/api] schema mismatch", parsed.error.flatten());
    return { kind: "error", status: 0 };
  }
  return { kind: "ok", data: parsed.data };
}

// ─── Checklist schema (static catalog, cached per Node.js lifetime) ───────────
// `cache()` deduplicates across concurrent RSC renders in the same request.
// Next.js revalidates on the "checklist-schema" tag when criteria are updated in Django Admin.

export const fetchChecklistSchema = cache(async (): Promise<ChecklistSchema> => {
  const auth = await authHeader();
  const res = await fetch(
    `${BASE}/inclusion-api/admin/object-passports/checklist-schema/`,
    { headers: auth, next: { tags: ["checklist-schema"], revalidate: 3600 } },
  );
  if (!res.ok) throw new Error(`checklist-schema → ${res.status}`);
  const json = await res.json();
  return z.array(checklistSchemaItemSchema).parse(json);
});

// ─── Passport form (lean payload: ~5-20 KB) ───────────────────────────────────

export async function fetchPassportV2Form(id: number): Promise<FetchResult<PassportV2>> {
  return apiFetch(
    `/inclusion-api/admin/object-passports/${id}/form/`,
    passportV2Schema,
    { cache: "no-store" },
  );
}

// ─── Photos (lazy — not needed on initial form load) ─────────────────────────

export async function fetchPassportPhotos(id: number): Promise<FetchResult<PassportPhoto[]>> {
  return apiFetch(
    `/inclusion-api/admin/object-passports/${id}/photos/`,
    z.array(passportPhotoSchema),
    { cache: "no-store" },
  );
}

// ─── Save (PATCH) ─────────────────────────────────────────────────────────────

export async function patchPassportV2(
  id: number,
  body: PassportV2Patch,
): Promise<FetchResult<PassportV2>> {
  return apiFetch(
    `/inclusion-api/admin/object-passports/${id}/form/`,
    passportV2Schema,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

// ─── Photo upload ─────────────────────────────────────────────────────────────

export async function uploadPassportPhoto(
  id: number,
  section: string,
  file: File,
): Promise<FetchResult<PassportPhoto>> {
  const headers = await authHeader();
  const form = new FormData();
  form.append("section", section);
  form.append("image", file);

  const res = await fetch(`${BASE}/inclusion-api/admin/object-passports/${id}/photos/`, {
    method: "POST",
    headers,
    body: form,
  });

  if (res.status === 401) return { kind: "unauthorized" };
  if (!res.ok) return { kind: "error", status: res.status };

  const json = await res.json();
  const parsed = passportPhotoSchema.safeParse(json);
  if (!parsed.success) return { kind: "error", status: 0 };
  return { kind: "ok", data: parsed.data };
}

export async function deletePassportPhoto(
  passportId: number,
  photoId: number,
): Promise<{ ok: boolean }> {
  const headers = await authHeader();
  const res = await fetch(
    `${BASE}/inclusion-api/admin/object-passports/${passportId}/photos/${photoId}/`,
    { method: "DELETE", headers },
  );
  return { ok: res.ok };
}
