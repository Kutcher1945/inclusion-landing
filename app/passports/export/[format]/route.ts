import { AuthError, refreshAccessToken } from "@/lib/auth/server-proxy";
import { readSessionTokens } from "@/lib/auth/session";

const BACKEND = process.env.BACKEND_API_URL ?? "https://green-admin.smartalmaty.kz";

const FILTER_KEYS = ["search", "district", "status", "delivery_status", "type_of_activity", "sub_type_of_activity"];

const FORMAT_TO_BACKEND_PATH: Record<string, string> = {
  pdf: "export-pdf",
  excel: "export-excel",
  json: "export-json",
  geojson: "export-geojson",
};

/**
 * Proxies all four bulk export formats (PDF/Excel/JSON/GeoJSON) through one route —
 * they share the exact same auth-forwarding and filter/ids/tab mapping, only the
 * backend path and response content-type differ.
 */
export async function GET(request: Request, { params }: { params: Promise<{ format: string }> }) {
  const { format } = await params;
  const backendPath = FORMAT_TO_BACKEND_PATH[format];
  if (!backendPath) {
    return Response.json({ detail: "Неизвестный формат экспорта." }, { status: 400 });
  }

  const { access, refresh } = await readSessionTokens();
  if (!access) return new Response(null, { status: 401 });

  const incoming = new URL(request.url).searchParams;
  const qs = new URLSearchParams();

  const ids = incoming.get("ids");
  if (ids) {
    // An explicit selection overrides filters entirely — only the tab (active/deleted) still applies.
    qs.set("ids", ids);
    if (incoming.get("tab") === "deleted") qs.set("show_deleted", "true");
  } else {
    if (incoming.get("tab") === "deleted") qs.set("show_deleted", "true");
    for (const key of FILTER_KEYS) {
      const value = incoming.get(key);
      if (value) qs.set(key, value);
    }
    const sort = incoming.get("sort");
    if (sort) qs.set("ordering", sort);
  }

  const url = `${BACKEND}/inclusion-api/admin/object-passports/${backendPath}/?${qs.toString()}`;
  let res = await fetch(url, { headers: { Authorization: `Bearer ${access}` }, cache: "no-store" });

  if (res.status === 401 && refresh) {
    try {
      const { access: newAccess } = await refreshAccessToken(refresh);
      res = await fetch(url, { headers: { Authorization: `Bearer ${newAccess}` }, cache: "no-store" });
    } catch (error: unknown) {
      if (error instanceof AuthError) return new Response(null, { status: 401 });
      throw error;
    }
  }

  if (!res.ok) {
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
    });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? "attachment",
    },
  });
}
