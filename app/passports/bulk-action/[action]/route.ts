import { AuthError, refreshAccessToken } from "@/lib/auth/backend";
import { readSessionTokens } from "@/lib/auth/session";

const BACKEND = process.env.BACKEND_API_URL ?? "https://green-admin.smartalmaty.kz";

const ACTION_TO_BACKEND_PATH: Record<string, string> = {
  "set-status": "bulk-set-status",
  delete: "bulk-delete",
  restore: "bulk-restore",
};

/** Proxies the three bulk mutations (status change / soft-delete / restore) for an explicit id selection. */
export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const backendPath = ACTION_TO_BACKEND_PATH[action];
  if (!backendPath) {
    return Response.json({ detail: "Неизвестное действие." }, { status: 400 });
  }

  const { access, refresh } = await readSessionTokens();
  if (!access) return new Response(null, { status: 401 });

  const incoming = new URL(request.url).searchParams;
  const qs = new URLSearchParams();
  if (incoming.get("tab") === "deleted") qs.set("show_deleted", "true");

  const body = await request.text();
  const url = `${BACKEND}/inclusion-api/admin/object-passports/${backendPath}/?${qs.toString()}`;

  let res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  if (res.status === 401 && refresh) {
    try {
      const { access: newAccess } = await refreshAccessToken(refresh);
      res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${newAccess}`, "Content-Type": "application/json" },
        body,
        cache: "no-store",
      });
    } catch (error: unknown) {
      if (error instanceof AuthError) return new Response(null, { status: 401 });
      throw error;
    }
  }

  const responseBody = await res.text();
  return new Response(responseBody, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
