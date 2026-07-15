import { AuthError, refreshAccessToken } from "@/lib/auth/backend";
import { readSessionTokens } from "@/lib/auth/session";

const BACKEND = process.env.BACKEND_API_URL ?? "https://green-admin.smartalmaty.kz";

/** Proxies self-service password changes to the Django `me/change-password/` endpoint. */
export async function POST(request: Request) {
  const { access, refresh } = await readSessionTokens();
  if (!access) return new Response(null, { status: 401 });

  const body = await request.text();
  const url = `${BACKEND}/inclusion-api/admin/me/change-password/`;

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
