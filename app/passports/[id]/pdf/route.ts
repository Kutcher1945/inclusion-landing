import { AuthError, refreshAccessToken } from "@/lib/auth/backend";
import { readSessionTokens } from "@/lib/auth/session";

const BACKEND = process.env.BACKEND_API_URL ?? "https://green-admin.smartalmaty.kz";

/**
 * Proxies the Django admin's ReportLab PDF export. A plain <a href> can't carry
 * the session's JWT itself (it lives in an httpOnly cookie, backend-only) — this
 * route reads it server-side and forwards the request with the Bearer header.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { access, refresh } = await readSessionTokens();
  if (!access) return new Response(null, { status: 401 });

  const url = `${BACKEND}/inclusion-api/admin/object-passports/${id}/pdf/`;
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
      "Content-Type": "application/pdf",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? `attachment; filename="passport_${id}.pdf"`,
    },
  });
}
